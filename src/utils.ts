/**
 * This file is part of Spectra.
 *
 * Spectra is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Spectra is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Spectra. If not, see <https://www.gnu.org/licenses/>.
 * */

import { type Writable, writable } from "svelte/store";
import type { PipelineConnectionType } from "./type";
import { URL_PARAMETERS } from "./url";

export function hashString(str: string): number {
  var hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export interface Face {
  points: Point[];
}

export interface Point {
  vertexIndex: number;
  uvIndex: number;
  normalIndex: number;
}

export function vec2(entries: number[]): Vec2 {
  if (entries.length < 2) {
    throw new Error("Wrong dimension for Vec2");
  }
  return [entries[0], entries[1]];
}

export function vec3(entries: number[]): Vec3 {
  if (entries.length !== 3) {
    throw new Error("Wrong dimension for Vec3");
  }
  return entries as Vec3;
}

type DoubleArray<T extends any[]> = [...T, ...T];

export type Mat4 = DoubleArray<DoubleArray<DoubleArray<DoubleArray<[number]>>>>;

export function mat4_0(): Mat4 {
  return new Array(16).fill(0) as Mat4;
}

export function mat4_I(): Mat4 {
  // prettier-ignore
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

export function mat4_translate(vec: Vec3): Mat4 {
  // prettier-ignore
  return [
    1, 0, 0, vec[0],
    0, 1, 0, vec[1],
    0, 0, 1, vec[2],
    0, 0, 0, 1
  ];
}

export interface Model {
  vertices: Vec3[];
  uv: Vec2[];
  normals: Vec3[];
  faces: Face[];
}

export function filterNonDigits(word: string): string {
  return word
    .split("")
    .filter((c) => "0123456789".includes(c))
    .join("");
}

export const GL_ERRORS: Writable<string[]> = writable([]);
export const FPS: Writable<number> = writable(0);
export const PLAYING: Writable<boolean> = writable(
  !URL_PARAMETERS.startPaused ?? true,
);
export const GL_CONTEXT: { gl: WebGL2RenderingContext | null } = { gl: null };

const NODE_HANDLE_TYPES: Record<string, PipelineConnectionType> = {};

export function registerNodeHandleType(
  nodeId: string,
  handle: string,
  type: PipelineConnectionType,
) {
  NODE_HANDLE_TYPES[`${nodeId}-${handle}`] = type;
}

export function getNodeHandleType(nodeId: string, handle: string) {
  return NODE_HANDLE_TYPES[`${nodeId}-${handle}`];
}
