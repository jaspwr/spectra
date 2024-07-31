import { hashString } from "./utils";

export type PipelineConnectionType = KnownType | string;

export enum KnownType {
  Float = "float",
  Vec2 = "vec2",
  Vec3 = "vec3",
  Vec4 = "vec4",
  Mat4 = "mat4",
  VertexShader = "vertex",
  FragmentShader = "fragment",
  ComputeShader = "compute",
  Geometry = "geometry",
  Output = "output",
  Texture2D = "sampler2D",
  TextureCube = "samplerCube",
}

export function typeCol(type: PipelineConnectionType): string {
  if (type === "") return "#000";
  const hue = hashString(type) * 1242.46 % 360;
  return `hsl(${hue}, 100%, 50%)`;
}
