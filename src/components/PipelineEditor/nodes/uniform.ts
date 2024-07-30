export enum UniformNodeType {
  Time = "time",
  Float = "float",
  Vec2 = "vec2",
  Tex = "texture",
  ViewMatrix = "view",
  ProjectionMatrix = "projection",
  TranslationMatrix = "translation",
  WindowSize = "window size",
  CubeMap = "cube map",
};

export type UniformNodeData =
  { type: UniformNodeType.Tex, textureSrc: string }
  | { type: UniformNodeType.CubeMap, textureSrc: string }
  | { type: UniformNodeType.Time }
  | { type: UniformNodeType.WindowSize }
  | { type: UniformNodeType.Float, value: number }
  | { type: UniformNodeType.Vec2, x: number, y: number }
  | { type: UniformNodeType.ViewMatrix, x: number, y: number, z: number, targetX: number, targetY: number, targetZ: number, upX: number, upY: number, upZ: number }
  | { type: UniformNodeType.ProjectionMatrix, fov: number, near: number, far: number }
  | { type: UniformNodeType.TranslationMatrix, x: number, y: number, z: number };


export const DEFAULT_PROJECTION: UniformNodeData = {
  type: UniformNodeType.ProjectionMatrix,
  fov: 45,
  near: 0.1,
  far: 100,
};

export const DEFAULT_VIEW: UniformNodeData = {
  type: UniformNodeType.ViewMatrix,
  x: 0,
  y: 0,
  z: 5,
  targetX: 0,
  targetY: 0,
  targetZ: 0,
  upX: 0,
  upY: 1,
  upZ: 0,
};

