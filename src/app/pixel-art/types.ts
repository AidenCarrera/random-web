export type Tool = "pencil" | "eraser" | "fill" | "picker";

/** Row-major grid of CSS colors, one entry per cell. */
export type PixelGrid = string[];

export type ExportPreview = {
  fileName: string;
  imageSrc: string;
};
