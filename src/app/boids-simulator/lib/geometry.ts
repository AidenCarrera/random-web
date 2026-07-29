/**
 * Arrowhead geometry in unit space. Vertex order allows a four-vertex triangle fan
 * to split the concave notch correctly: (tip, left, notch) and (tip, notch, right).
 */
export const BODY_SHAPE = [
  [1.75, 0],
  [-1, 0.68],
  [-0.48, 0],
  [-1, -0.68],
] as const;

export const TRAIL_WIDTH = 0.9;
