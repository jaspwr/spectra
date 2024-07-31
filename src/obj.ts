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

import {
  filterNonDigits,
  vec2,
  vec3,
  type Face,
  type Model,
  type Point,
  type Vec2,
  type Vec3,
} from "./utils";

const MODEL_CACHE: { [url: string]: Model } = {};

/**
 * Load and parse an OBJ file from the given URL.
 * */
export async function loadOBJ(url: string): Promise<Model> {
  if (url in MODEL_CACHE) return MODEL_CACHE[url];

  try {
    const response = await fetch(url);
    const obj = await response.text();
    const model = parseOBJ(obj);
    MODEL_CACHE[url] = model;
    return model;
  } catch (e) {
    throw new Error(`Failed to load OBJ file: ${url}.\n ${e}`);
  }
}

function parseOBJ(obj: string): Model {
  const lines = obj.split("\n");

  const vertices: Vec3[] = [];
  const normals: Vec3[] = [];
  const uv: Vec2[] = [];
  let faces: Face[] = [];

  for (const line of lines) {
    const parts = line.split(" ").filter((p) => p !== "");

    if (parts[0] === "v") {
      vertices.push(vec3(parts.slice(1).map(parseFloat)));
    } else if (parts[0] === "f") {
      faces.push({
        points: parts
          .slice(1)
          .map(parseFacePoint)
          .filter((p) => p !== undefined),
      });
    } else if (parts[0] === "vn") {
      normals.push(vec3(parts.slice(1).map(parseFloat)));
    } else if (parts[0] === "vt") {
      uv.push(vec2(parts.slice(1).map(parseFloat)));
    }
  }

  faces = faces.flatMap(intoTriangles);

  return { vertices, normals, uv, faces };
}

function parseFacePoint(point: string): Point | undefined {
  const indices = point.split("/");
  if (indices.length !== 3) {
    return undefined;
  }
  return {
    vertexIndex: parseInt(indices[0]) - 1,
    uvIndex: parseInt(indices[1]) - 1,
    normalIndex: parseInt(indices[2]) - 1,
  };
}
function intoTriangles(face: Face): Face[] {
  const triangles: Face[] = [];
  for (let i = 0; i + 3 <= face.points.length; i++) {
    triangles.push({
      points: [face.points[0], face.points[i + 1], face.points[i + 2]],
    });
  }
  return triangles;
}
