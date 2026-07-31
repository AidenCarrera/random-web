// Vertex order splits the concave notch correctly when rendered as a triangle fan.
export const BODY_SHAPE = [
  [1.75, 0],
  [-1, 0.68],
  [-0.48, 0],
  [-1, -0.68],
] as const;

export const TRAIL_WIDTH = 2.2;
export const TRAIL_TAIL_WIDTH = 0.25;
export const TRAIL_GLOW = 2.4;

export const PHOSPHOR_WIDTH = 2.6;
// Wider than the trail glow so accumulated phosphor reads as smoke.
export const PHOSPHOR_GLOW = 4.5;
