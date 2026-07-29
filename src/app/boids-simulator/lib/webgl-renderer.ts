import type { Flock, FlockRenderer } from "../types";
import { TRAIL_CAPACITY } from "./flock";
import { BODY_SHAPE, TRAIL_WIDTH } from "./geometry";
import { BACKGROUND_RGB, BODY_COLOR_WORDS, TRAIL_COLOR_WORDS } from "./palette";

/** Floats per body instance: x, y, vx, vy, size, packed color. */
const BODY_STRIDE = 6;
/** Floats per trail segment instance: startX, startY, endX, endY, packed color. */
const TRAIL_STRIDE = 5;
const MAX_TRAIL_SEGMENTS = TRAIL_CAPACITY - 1;

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

uniform vec2 u_resolution;
uniform float u_width;
uniform float u_ratio;

out vec4 v_color;
// Signed distance from the segment's centerline, in device pixels.
out float v_across;
${CLIP_SPACE}
void main() {
  vec2 delta = a_end - a_start;
  float span = length(delta);
  vec2 direction = span > 0.0 ? delta / span : vec2(1.0, 0.0);
  vec2 normal = vec2(-direction.y, direction.x);

  // Widens quad by 1 device pixel for analytical anti-aliasing edge falloff.
  float drawn = u_width + 2.0 / u_ratio;
  vec2 world = a_start
    + direction * (span * a_corner.x)
    + normal * (drawn * a_corner.y);

  gl_Position = toClip(world, u_resolution);
  v_color = a_color;
  v_across = drawn * a_corner.y * u_ratio;
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

/** Calculates sub-pixel line coverage analytically with a box filter to avoid MSAA quantization artifacts on thin trails. */
const TRAIL_FRAGMENT_SHADER = `#version 300 es
// Matches the vertex stage's default, which shared uniforms must agree with.
precision highp float;

uniform float u_width;
uniform float u_ratio;

in vec4 v_color;
in float v_across;
out vec4 outColor;

void main() {
  float halfWidth = u_width * u_ratio * 0.5;
  float coverage = clamp(halfWidth - abs(v_across) + 0.5, 0.0, 1.0);
  outColor = vec4(v_color.rgb, v_color.a * coverage);
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
 * Instanced WebGL2 renderer drawing trails and bodies in two batched draw calls per frame
 * using dynamically updated interleaved buffers.
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
  if (!bodyProgram || !trailProgram) return null;

  const bodyResolution = gl.getUniformLocation(bodyProgram, "u_resolution");
  const trailResolution = gl.getUniformLocation(trailProgram, "u_resolution");
  const trailWidth = gl.getUniformLocation(trailProgram, "u_width");
  const trailRatio = gl.getUniformLocation(trailProgram, "u_ratio");
  if (!bodyResolution || !trailResolution || !trailWidth || !trailRatio) {
    return null;
  }

  const bodyVao = gl.createVertexArray();
  const trailVao = gl.createVertexArray();
  const bodyShape = gl.createBuffer();
  const trailShape = gl.createBuffer();
  const bodyInstances = gl.createBuffer();
  const trailInstances = gl.createBuffer();

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
  gl.bindVertexArray(trailVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, trailShape);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, -0.5, 0, 0.5, 1, -0.5, 1, 0.5]),
    gl.STATIC_DRAW,
  );
  const trailCorner = gl.getAttribLocation(trailProgram, "a_corner");
  gl.enableVertexAttribArray(trailCorner);
  gl.vertexAttribPointer(trailCorner, 2, gl.FLOAT, false, 0, 0);

  const trailBytes = TRAIL_STRIDE * 4;
  gl.bindBuffer(gl.ARRAY_BUFFER, trailInstances);
  instancedAttribute(gl, gl.getAttribLocation(trailProgram, "a_start"), 2, gl.FLOAT, false, trailBytes, 0); // prettier-ignore
  instancedAttribute(gl, gl.getAttribLocation(trailProgram, "a_end"), 2, gl.FLOAT, false, trailBytes, 8); // prettier-ignore
  instancedAttribute(gl, gl.getAttribLocation(trailProgram, "a_color"), 4, gl.UNSIGNED_BYTE, true, trailBytes, 16); // prettier-ignore

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
  let viewWidth = 1;
  let viewHeight = 1;
  let viewRatio = 1;

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
      let previous = base + ((start % TRAIL_CAPACITY) << 1);

      for (let point = 1; point < length; point += 1) {
        const current = base + (((start + point) % TRAIL_CAPACITY) << 1);
        const offset = segments * TRAIL_STRIDE;
        trailFloats[offset] = trail[previous];
        trailFloats[offset + 1] = trail[previous + 1];
        trailFloats[offset + 2] = trail[current];
        trailFloats[offset + 3] = trail[current + 1];
        trailWords[offset + 4] = word;
        previous = current;
        segments += 1;
      }
    }
    return segments;
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
    },

    draw(flock, trails) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (flock.count === 0) return;

      if (trails) {
        reserveTrails(flock.count * MAX_TRAIL_SEGMENTS);
        const segments = packTrails(flock);
        if (segments > 0) {
          gl.useProgram(trailProgram);
          gl.uniform2f(trailResolution, viewWidth, viewHeight);
          gl.uniform1f(trailWidth, TRAIL_WIDTH);
          gl.uniform1f(trailRatio, viewRatio);
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
      gl.deleteBuffer(bodyShape);
      gl.deleteBuffer(trailShape);
      gl.deleteBuffer(bodyInstances);
      gl.deleteBuffer(trailInstances);
      gl.deleteVertexArray(bodyVao);
      gl.deleteVertexArray(trailVao);
      gl.deleteProgram(bodyProgram);
      gl.deleteProgram(trailProgram);
    },
  };
}
