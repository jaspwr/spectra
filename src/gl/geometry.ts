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

import type { Model } from "@/utils";
import type { GLProgram } from "./glProgram";
import type { UniformSetter } from "./uniform";
import { bindVBOToAttribute, createVBO } from "./utils";

export abstract class Geometry {
  public uniformOverrides: UniformSetter[];
  abstract render(gl: WebGL2RenderingContext, program: GLProgram): void;

  constructor(uniformOverrides: UniformSetter[]) {
    this.uniformOverrides = uniformOverrides;
  }
}

export class Mesh extends Geometry {
  vertices: WebGLBuffer;
  normals: WebGLBuffer;
  uv: WebGLBuffer;
  vertexCount: number;

  public constructor(gl: WebGL2RenderingContext, model: Model, uniformOverrides: UniformSetter[]) {
    super(uniformOverrides);
    let verticesFlat: number[] = [];
    let normalsFlat: number[] = [];
    let uvFlat: number[] = [];

    for (let face of model.faces) {
      for (let { vertexIndex, uvIndex, normalIndex } of face.points) {
        verticesFlat.push(...model.vertices[vertexIndex]);
        normalsFlat.push(...model.normals[normalIndex]);
        uvFlat.push(...model.uv[uvIndex]);
      }
    }

    this.vertices = createVBO(gl, verticesFlat);
    this.normals = createVBO(gl, normalsFlat);
    this.uv = createVBO(gl, uvFlat);

    this.vertexCount = model.faces.length * 3;
  }

  public render(gl: WebGL2RenderingContext, program: GLProgram) {
    bindVBOToAttribute(gl, this.vertices, program.attributes["position"], 3);
    bindVBOToAttribute(gl, this.normals, program.attributes["normal"], 3);
    bindVBOToAttribute(gl, this.uv, program.attributes["uv"], 2);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
  }
}

export class FullscreenQuad extends Geometry {
  vbo: WebGLBuffer;

  public constructor(gl: WebGL2RenderingContext, uniformOverrides: UniformSetter[]) {
    super(uniformOverrides);

    const vertices = new Float32Array([
      1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
    ]);

    this.vbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  public render(gl: WebGL2RenderingContext, program: GLProgram) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

    gl.enableVertexAttribArray(program.attributes["position"]);
    gl.vertexAttribPointer(
      program.attributes["position"],
      2,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }
}

export class SkyBox extends Geometry {
  vbo: WebGLBuffer;
  ebo: WebGLBuffer;
  vertexCount: number = 36;

  public constructor(gl: WebGL2RenderingContext) {
    super([]);

    // prettier-ignore
    const vertices = [
      -1, -1, 1, // 0         7--------6
      1, -1, 1,  // 1        /|       /|
      1, -1, -1, // 2       / |      / |
      -1, -1, -1,// 3      4--------5  |
      -1, 1, 1,  // 4      | 3------|--2
      1, 1, 1,   // 5      | /      | /
      1, 1, -1,  // 6      |/       |/
      -1, 1, -1, // 7      0--------1
    ];

    const indices = new Uint16Array([
      0, 1, 2, 2, 3, 0, // bottom
      4, 5, 6, 6, 7, 4, // top
      0, 4, 7, 7, 3, 0, // left
      1, 5, 6, 6, 2, 1, // right
      0, 1, 5, 5, 4, 0, // front
      3, 2, 6, 6, 7, 3, // back
    ]);

    this.vbo = createVBO(gl, vertices);
    this.ebo = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  }

  public render(gl: WebGL2RenderingContext, program: GLProgram) {
    bindVBOToAttribute(gl, this.vbo, program.attributes["position"], 3);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
  }
}
