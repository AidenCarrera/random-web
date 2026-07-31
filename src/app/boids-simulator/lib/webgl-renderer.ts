import type { Flock, FlockRenderer } from "../types";
import { TRAIL_CAPACITY } from "./flock";
import {
  BODY_SHAPE,
  PHOSPHOR_GLOW,
  PHOSPHOR_WIDTH,
  TRAIL_GLOW,
  TRAIL_TAIL_WIDTH,
  TRAIL_WIDTH,
} from "./geometry";
import {
  BACKGROUND_RGB,
  BODY_COLOR_WORDS,
  PHOSPHOR_COLOR_WORDS,
  TRAIL_COLOR_WORDS,
} from "./palette";

/** Floats per body instance: x, y, vx, vy, size, packed color. */
const BODY_STRIDE = 6;
/** Floats per trail segment instance: startX, startY, endX, endY, packed color, packed endpoint ages. */
const TRAIL_STRIDE = 6;
const MAX_TRAIL_SEGMENTS = TRAIL_CAPACITY - 1;

// Brightness kept per 60 Hz frame, which sets how long paint lingers.
const PHOSPHOR_DECAY = 0.973;
// Subtracted alongside the decay: multiplying an 8-bit channel never reaches zero, so
// without a floor every streak leaves a permanent one-count residue.
const PHOSPHOR_FLOOR = 1.5 / 255;
// Fraction of device pixels. Quarters texture memory, and linear sampling blurs it softer.
const PHOSPHOR_SCALE = 0.5;
const TRAIL_HOT = 0.35;
// Deposits stay near their own hue so accumulated paint builds color instead of washing out.
const PHOSPHOR_HOT = 0.06;

const CLIP_SPACE = `
  vec4 toClip(vec2 world, vec2 resolution) {
    vec2 clip = world / resolution * 2.0 - 1.0;
    // Canvas space runs top-down, clip space bottom-up.
    return vec4(clip.x, -clip.y, 0.0, 1.0);
  }
`;

const BODY_VERTEX_SHADER = `#version 300 es
in vec2 a_vertex;
in vec2 a_offset;
in vec2 a_velocity;
in float a_size;
in vec4 a_color;

uniform vec2 u_resolution;

out vec4 v_color;
${CLIP_SPACE}
void main() {
  float speed = length(a_velocity);
  vec2 heading = speed > 0.0 ? a_velocity / speed : vec2(1.0, 0.0);
  vec2 local = a_vertex * a_size;
  vec2 world = a_offset + vec2(
    local.x * heading.x - local.y * heading.y,
    local.x * heading.y + local.y * heading.x
  );

  gl_Position = toClip(world, u_resolution);
  v_color = a_color;
}
`;

const TRAIL_VERTEX_SHADER = `#version 300 es
// x runs 0..1 along the segment, y runs -0.5..0.5 across it.
in vec2 a_corner;
in vec2 a_start;
in vec2 a_end;
in vec4 a_color;
// .x and .y hold each endpoint's age: 0 at the oldest point, 1 under the boid.
in vec4 a_age;

uniform vec2 u_resolution;
uniform float u_width;
uniform float u_tailWidth;
uniform float u_glow;
uniform float u_ratio;
uniform float u_hot;

out vec4 v_color;
// Signed distance from the segment's centerline, in device pixels.
out float v_across;
// Half width of the solid core at this point of the taper, in device pixels.
out float v_half;
${CLIP_SPACE}
void main() {
  vec2 delta = a_end - a_start;
  float span = length(delta);
  vec2 direction = span > 0.0 ? delta / span : vec2(1.0, 0.0);
  vec2 normal = vec2(-direction.y, direction.x);

  float age = mix(a_age.x, a_age.y, a_corner.x);
  // Cubic holds most of the trail hair-thin so the head reads as a comet.
  float taper = age * age * age;
  float width = mix(u_tailWidth, u_width, taper);

  // Widens the quad past the core by the halo plus a device pixel of edge falloff.
  float drawn = width + 2.0 * u_glow + 2.0 / u_ratio;
  vec2 world = a_start
    + direction * (span * a_corner.x)
    + normal * (drawn * a_corner.y);

  gl_Position = toClip(world, u_resolution);
  // Alpha falls off faster than the width does, and the head runs hot toward white.
  v_color = vec4(a_color.rgb + vec3(u_hot) * taper, a_color.a * age * age);
  v_across = drawn * a_corner.y * u_ratio;
  v_half = width * u_ratio * 0.5;
}
`;

const FRAGMENT_SHADER = `#version 300 es
// Matches the vertex stage's default, which shared uniforms must agree with.
precision highp float;

in vec4 v_color;
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

/**
 * Calculates sub-pixel core coverage analytically with a box filter to avoid MSAA
 * quantization artifacts on thin trails, then wraps the core in a soft halo so
 * dense flocks bloom instead of reading as flat hairlines.
 */
const TRAIL_FRAGMENT_SHADER = `#version 300 es
// Matches the vertex stage's default, which shared uniforms must agree with.
precision highp float;

uniform float u_glow;
uniform float u_ratio;

in vec4 v_color;
in float v_across;
in float v_half;
out vec4 outColor;

// Share of the trail's alpha carried by the halo outside the core.
const float GLOW_ALPHA = 0.42;

void main() {
  float offset = abs(v_across);
  float core = clamp(v_half - offset + 0.5, 0.0, 1.0);
  float falloff =
    1.0 - smoothstep(0.0, u_glow * u_ratio, max(0.0, offset - v_half));
  outColor = vec4(v_color.rgb, v_color.a * max(core, falloff * falloff * GLOW_ALPHA));
}
`;

// Screen-covering triangle generated from the vertex index, so it needs no buffer.
const POST_VERTEX_SHADER = `#version 300 es
out vec2 v_uv;

void main() {
  vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  v_uv = corner;
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}
`;

// Reads the phosphor buffer back out, dimmed. Runs twice per frame: once to decay the
// buffer into its twin, once at full brightness to add the paint to the screen.
const POST_FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D u_source;
uniform float u_decay;
uniform float u_floor;

in vec2 v_uv;
out vec4 outColor;

void main() {
  vec3 paint = texture(u_source, v_uv).rgb;
  outColor = vec4(max(paint * u_decay - vec3(u_floor), vec3(0.0)), 1.0);
}
`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Boids shader compile failed", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function linkProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Boids shader link failed", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/** Binds an interleaved per-instance attribute and advances it once per instance. */
function instancedAttribute(
  gl: WebGL2RenderingContext,
  location: number,
  size: number,
  type: number,
  normalized: boolean,
  stride: number,
  offset: number,
) {
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
  gl.vertexAttribDivisor(location, 1);
}

/**
 * Instanced WebGL2 renderer drawing trails and bodies in batched draw calls per frame
 * using dynamically updated interleaved buffers.
 *
 * With trails on it also keeps a long-exposure phosphor buffer: an offscreen texture that
 * decays a few percent per frame while each boid streaks its latest motion into it
 * additively. Paint outlives the `TRAIL_CAPACITY` ring buffer by seconds, and lanes the
 * flock keeps crossing accumulate into brighter strata.
 */
export function createWebglFlockRenderer(
  canvas: HTMLCanvasElement,
): FlockRenderer | null {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: true,
    depth: false,
    // Snapshot export reads the canvas back outside of a draw call.
    preserveDrawingBuffer: true,
    stencil: false,
  });
  if (!gl) return null;

  const bodyProgram = linkProgram(gl, BODY_VERTEX_SHADER, FRAGMENT_SHADER);
  const trailProgram = linkProgram(
    gl,
    TRAIL_VERTEX_SHADER,
    TRAIL_FRAGMENT_SHADER,
  );
  const postProgram = linkProgram(gl, POST_VERTEX_SHADER, POST_FRAGMENT_SHADER);
  if (!bodyProgram || !trailProgram || !postProgram) return null;

  const bodyResolution = gl.getUniformLocation(bodyProgram, "u_resolution");
  const trailResolution = gl.getUniformLocation(trailProgram, "u_resolution");
  const trailWidth = gl.getUniformLocation(trailProgram, "u_width");
  const trailTailWidth = gl.getUniformLocation(trailProgram, "u_tailWidth");
  const trailGlow = gl.getUniformLocation(trailProgram, "u_glow");
  const trailRatio = gl.getUniformLocation(trailProgram, "u_ratio");
  const trailHot = gl.getUniformLocation(trailProgram, "u_hot");
  const postSource = gl.getUniformLocation(postProgram, "u_source");
  const postDecay = gl.getUniformLocation(postProgram, "u_decay");
  const postFloor = gl.getUniformLocation(postProgram, "u_floor");
  if (
    !bodyResolution ||
    !trailResolution ||
    !trailWidth ||
    !trailTailWidth ||
    !trailGlow ||
    !trailRatio ||
    !trailHot ||
    !postSource ||
    !postDecay ||
    !postFloor
  ) {
    return null;
  }

  const bodyVao = gl.createVertexArray();
  const trailVao = gl.createVertexArray();
  const depositVao = gl.createVertexArray();
  const postVao = gl.createVertexArray();
  const bodyShape = gl.createBuffer();
  const trailShape = gl.createBuffer();
  const bodyInstances = gl.createBuffer();
  const trailInstances = gl.createBuffer();
  const depositInstances = gl.createBuffer();

  // Bodies: a four-vertex arrowhead fan, one instance per boid.
  gl.bindVertexArray(bodyVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, bodyShape);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(BODY_SHAPE.flat()),
    gl.STATIC_DRAW,
  );
  const bodyVertex = gl.getAttribLocation(bodyProgram, "a_vertex");
  gl.enableVertexAttribArray(bodyVertex);
  gl.vertexAttribPointer(bodyVertex, 2, gl.FLOAT, false, 0, 0);

  const bodyBytes = BODY_STRIDE * 4;
  gl.bindBuffer(gl.ARRAY_BUFFER, bodyInstances);
  instancedAttribute(gl, gl.getAttribLocation(bodyProgram, "a_offset"), 2, gl.FLOAT, false, bodyBytes, 0); // prettier-ignore
  instancedAttribute(gl, gl.getAttribLocation(bodyProgram, "a_velocity"), 2, gl.FLOAT, false, bodyBytes, 8); // prettier-ignore
  instancedAttribute(gl, gl.getAttribLocation(bodyProgram, "a_size"), 1, gl.FLOAT, false, bodyBytes, 16); // prettier-ignore
  instancedAttribute(gl, gl.getAttribLocation(bodyProgram, "a_color"), 4, gl.UNSIGNED_BYTE, true, bodyBytes, 20); // prettier-ignore

  // Trails: a unit quad expanded to segment length and width in the shader.
  gl.bindBuffer(gl.ARRAY_BUFFER, trailShape);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, -0.5, 0, 0.5, 1, -0.5, 1, 0.5]),
    gl.STATIC_DRAW,
  );

  const trailBytes = TRAIL_STRIDE * 4;

  // Crisp trails and phosphor deposits share a program but pack different segments, so
  // each keeps its own instance buffer rather than restaging one buffer twice per frame.
  const describeTrailVao = (
    vao: WebGLVertexArrayObject | null,
    instances: WebGLBuffer | null,
  ) => {
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, trailShape);
    const corner = gl.getAttribLocation(trailProgram, "a_corner");
    gl.enableVertexAttribArray(corner);
    gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, instances);
    instancedAttribute(gl, gl.getAttribLocation(trailProgram, "a_start"), 2, gl.FLOAT, false, trailBytes, 0); // prettier-ignore
    instancedAttribute(gl, gl.getAttribLocation(trailProgram, "a_end"), 2, gl.FLOAT, false, trailBytes, 8); // prettier-ignore
    instancedAttribute(gl, gl.getAttribLocation(trailProgram, "a_color"), 4, gl.UNSIGNED_BYTE, true, trailBytes, 16); // prettier-ignore
    instancedAttribute(gl, gl.getAttribLocation(trailProgram, "a_age"), 4, gl.UNSIGNED_BYTE, true, trailBytes, 20); // prettier-ignore
  };

  describeTrailVao(trailVao, trailInstances);
  describeTrailVao(depositVao, depositInstances);

  gl.bindVertexArray(null);
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(BACKGROUND_RGB[0], BACKGROUND_RGB[1], BACKGROUND_RGB[2], 1);

  // Interleaved staging buffers. Each is viewed as floats for the geometry and
  // as 32-bit words for the packed color, so a color costs one store.
  let bodyCapacity = 0;
  let bodyData = new ArrayBuffer(0);
  let bodyFloats = new Float32Array(bodyData);
  let bodyWords = new Uint32Array(bodyData);
  let trailCapacity = 0;
  let trailData = new ArrayBuffer(0);
  let trailFloats = new Float32Array(trailData);
  let trailWords = new Uint32Array(trailData);
  let depositCapacity = 0;
  let depositData = new ArrayBuffer(0);
  let depositFloats = new Float32Array(depositData);
  let depositWords = new Uint32Array(depositData);
  let viewWidth = 1;
  let viewHeight = 1;
  let viewRatio = 1;

  // Phosphor accumulation. Two textures ping-pong because the decay pass has to read
  // the whole buffer while writing it; the one at `phosphorSource` holds live paint.
  const phosphorTextures: (WebGLTexture | null)[] = [null, null];
  const phosphorTargets: (WebGLFramebuffer | null)[] = [null, null];
  let phosphorSource = 0;
  let phosphorWidth = 1;
  let phosphorHeight = 1;
  let phosphorRatio = 1;
  // Whether the buffer holds paint worth compositing.
  let phosphorLit = false;

  const releasePhosphor = () => {
    for (let slot = 0; slot < 2; slot += 1) {
      gl.deleteFramebuffer(phosphorTargets[slot]);
      gl.deleteTexture(phosphorTextures[slot]);
      phosphorTargets[slot] = null;
      phosphorTextures[slot] = null;
    }
  };

  const clearPhosphor = () => {
    gl.clearColor(0, 0, 0, 0);
    for (let slot = 0; slot < 2; slot += 1) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, phosphorTargets[slot]);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(BACKGROUND_RGB[0], BACKGROUND_RGB[1], BACKGROUND_RGB[2], 1);
    phosphorSource = 0;
    phosphorLit = false;
  };

  // Reallocates the pair for the current drawing buffer, dropping stored paint.
  const allocatePhosphor = () => {
    releasePhosphor();
    phosphorWidth = Math.max(1, Math.floor(canvas.width * PHOSPHOR_SCALE));
    phosphorHeight = Math.max(1, Math.floor(canvas.height * PHOSPHOR_SCALE));
    phosphorRatio = viewRatio * PHOSPHOR_SCALE;

    for (let slot = 0; slot < 2; slot += 1) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, phosphorWidth, phosphorHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); // prettier-ignore
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const target = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, target);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0); // prettier-ignore
      phosphorTextures[slot] = texture;
      phosphorTargets[slot] = target;
    }
    clearPhosphor();
  };

  const drawPost = (
    texture: WebGLTexture | null,
    decay: number,
    floor: number,
  ) => {
    gl.useProgram(postProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(postSource, 0);
    gl.uniform1f(postDecay, decay);
    gl.uniform1f(postFloor, floor);
    gl.bindVertexArray(postVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const reserveBodies = (count: number) => {
    if (count <= bodyCapacity) return;
    bodyCapacity = Math.max(count, bodyCapacity * 2, 256);
    bodyData = new ArrayBuffer(bodyCapacity * bodyBytes);
    bodyFloats = new Float32Array(bodyData);
    bodyWords = new Uint32Array(bodyData);
    gl.bindBuffer(gl.ARRAY_BUFFER, bodyInstances);
    gl.bufferData(gl.ARRAY_BUFFER, bodyData.byteLength, gl.DYNAMIC_DRAW);
  };

  const reserveTrails = (segments: number) => {
    if (segments <= trailCapacity) return;
    trailCapacity = Math.max(segments, trailCapacity * 2, 2048);
    trailData = new ArrayBuffer(trailCapacity * trailBytes);
    trailFloats = new Float32Array(trailData);
    trailWords = new Uint32Array(trailData);
    gl.bindBuffer(gl.ARRAY_BUFFER, trailInstances);
    gl.bufferData(gl.ARRAY_BUFFER, trailData.byteLength, gl.DYNAMIC_DRAW);
  };

  const packTrails = (flock: Flock) => {
    const { color, trail, trailLength, trailStart } = flock;
    let segments = 0;

    for (let index = 0; index < flock.count; index += 1) {
      const length = trailLength[index];
      if (length < 2) continue;

      const word = TRAIL_COLOR_WORDS[color[index]];
      const base = index * TRAIL_CAPACITY * 2;
      const start = trailStart[index];
      // Ages are quantized to bytes, so the newest point lands exactly on 255.
      const ageStep = 255 / (length - 1);
      let previous = base + ((start % TRAIL_CAPACITY) << 1);
      let previousAge = 0;

      for (let point = 1; point < length; point += 1) {
        const current = base + (((start + point) % TRAIL_CAPACITY) << 1);
        const age = Math.round(point * ageStep);
        const offset = segments * TRAIL_STRIDE;
        trailFloats[offset] = trail[previous];
        trailFloats[offset + 1] = trail[previous + 1];
        trailFloats[offset + 2] = trail[current];
        trailFloats[offset + 3] = trail[current + 1];
        trailWords[offset + 4] = word;
        trailWords[offset + 5] = previousAge | (age << 8);
        previous = current;
        previousAge = age;
        segments += 1;
      }
    }
    return segments;
  };

  const reserveDeposits = (segments: number) => {
    if (segments <= depositCapacity) return;
    depositCapacity = Math.max(segments, depositCapacity * 2, 256);
    depositData = new ArrayBuffer(depositCapacity * trailBytes);
    depositFloats = new Float32Array(depositData);
    depositWords = new Uint32Array(depositData);
    gl.bindBuffer(gl.ARRAY_BUFFER, depositInstances);
    gl.bufferData(gl.ARRAY_BUFFER, depositData.byteLength, gl.DYNAMIC_DRAW);
  };

  // Packs the one segment each boid travelled this frame. The buffer already holds every
  // earlier segment, so repainting a whole trail would just scorch the same paint again.
  const packDeposits = (flock: Flock) => {
    const { color, trail, trailLength, trailStart } = flock;
    let segments = 0;

    for (let index = 0; index < flock.count; index += 1) {
      const length = trailLength[index];
      // A boid that just spawned or wrapped has no prior point to streak from.
      if (length < 2) continue;

      const base = index * TRAIL_CAPACITY * 2;
      const start = trailStart[index];
      const previous = base + (((start + length - 2) % TRAIL_CAPACITY) << 1);
      const current = base + (((start + length - 1) % TRAIL_CAPACITY) << 1);
      const offset = segments * TRAIL_STRIDE;
      depositFloats[offset] = trail[previous];
      depositFloats[offset + 1] = trail[previous + 1];
      depositFloats[offset + 2] = trail[current];
      depositFloats[offset + 3] = trail[current + 1];
      depositWords[offset + 4] = PHOSPHOR_COLOR_WORDS[color[index]];
      // Both endpoints at full age, so the streak keeps one width instead of tapering.
      depositWords[offset + 5] = 255 | (255 << 8);
      segments += 1;
    }
    return segments;
  };

  // Decays the stored paint into the spare buffer, then streaks this frame's motion in.
  const paintPhosphor = (flock: Flock, delta: number) => {
    const target = phosphorSource ^ 1;
    gl.bindFramebuffer(gl.FRAMEBUFFER, phosphorTargets[target]);
    gl.viewport(0, 0, phosphorWidth, phosphorHeight);
    gl.disable(gl.BLEND);
    drawPost(
      phosphorTextures[phosphorSource],
      Math.pow(PHOSPHOR_DECAY, delta),
      PHOSPHOR_FLOOR * delta,
    );
    gl.enable(gl.BLEND);
    phosphorSource = target;

    reserveDeposits(flock.count);
    const segments = packDeposits(flock);
    if (segments === 0) return;

    // Additive, so lanes the flock keeps re-crossing build past a single pass's brightness.
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(trailProgram);
    gl.uniform2f(trailResolution, viewWidth, viewHeight);
    gl.uniform1f(trailWidth, PHOSPHOR_WIDTH);
    gl.uniform1f(trailTailWidth, PHOSPHOR_WIDTH);
    gl.uniform1f(trailGlow, PHOSPHOR_GLOW);
    gl.uniform1f(trailRatio, phosphorRatio);
    gl.uniform1f(trailHot, PHOSPHOR_HOT);
    gl.bindVertexArray(depositVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, depositInstances);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, depositFloats, 0, segments * TRAIL_STRIDE); // prettier-ignore
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, segments);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    phosphorLit = true;
  };

  const packBodies = (flock: Flock) => {
    const { color, size, vx, vy, x, y } = flock;
    for (let index = 0; index < flock.count; index += 1) {
      const offset = index * BODY_STRIDE;
      bodyFloats[offset] = x[index];
      bodyFloats[offset + 1] = y[index];
      bodyFloats[offset + 2] = vx[index];
      bodyFloats[offset + 3] = vy[index];
      bodyFloats[offset + 4] = size[index];
      bodyWords[offset + 5] = BODY_COLOR_WORDS[color[index]];
    }
  };

  return {
    resize(width, height, ratio) {
      viewWidth = width;
      viewHeight = height;
      viewRatio = ratio;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      // The accumulated paint is tied to the old pixel grid, so a resize starts over.
      allocatePhosphor();
    },

    draw(flock, trails, delta) {
      // A paused frame reports no elapsed time, which holds the exposure where it is.
      if (trails && delta > 0 && flock.count > 0) paintPhosphor(flock, delta);
      else if (!trails && phosphorLit) clearPhosphor();

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (trails && phosphorLit) {
        // Paint is stored as light alone, so it adds onto the background.
        gl.blendFunc(gl.ONE, gl.ONE);
        drawPost(phosphorTextures[phosphorSource], 1, 0);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      }

      if (flock.count === 0) return;

      if (trails) {
        reserveTrails(flock.count * MAX_TRAIL_SEGMENTS);
        const segments = packTrails(flock);
        if (segments > 0) {
          gl.useProgram(trailProgram);
          gl.uniform2f(trailResolution, viewWidth, viewHeight);
          gl.uniform1f(trailWidth, TRAIL_WIDTH);
          gl.uniform1f(trailTailWidth, TRAIL_TAIL_WIDTH);
          gl.uniform1f(trailGlow, TRAIL_GLOW);
          gl.uniform1f(trailRatio, viewRatio);
          gl.uniform1f(trailHot, TRAIL_HOT);
          gl.bindVertexArray(trailVao);
          gl.bindBuffer(gl.ARRAY_BUFFER, trailInstances);
          gl.bufferSubData(
            gl.ARRAY_BUFFER,
            0,
            trailFloats,
            0,
            segments * TRAIL_STRIDE,
          );
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, segments);
        }
      }

      reserveBodies(flock.count);
      packBodies(flock);
      gl.useProgram(bodyProgram);
      gl.uniform2f(bodyResolution, viewWidth, viewHeight);
      gl.bindVertexArray(bodyVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, bodyInstances);
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        0,
        bodyFloats,
        0,
        flock.count * BODY_STRIDE,
      );
      gl.drawArraysInstanced(
        gl.TRIANGLE_FAN,
        0,
        BODY_SHAPE.length,
        flock.count,
      );
      gl.bindVertexArray(null);
    },

    dispose() {
      releasePhosphor();
      gl.deleteBuffer(bodyShape);
      gl.deleteBuffer(trailShape);
      gl.deleteBuffer(bodyInstances);
      gl.deleteBuffer(trailInstances);
      gl.deleteBuffer(depositInstances);
      gl.deleteVertexArray(bodyVao);
      gl.deleteVertexArray(trailVao);
      gl.deleteVertexArray(depositVao);
      gl.deleteVertexArray(postVao);
      gl.deleteProgram(bodyProgram);
      gl.deleteProgram(trailProgram);
      gl.deleteProgram(postProgram);
    },
  };
}
