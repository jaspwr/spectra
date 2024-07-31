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

import { writable, type Writable } from "svelte/store";
import { hashString } from "@/utils";

export enum ShaderType {
  Frag,
  Vert,
  Geom,
  Comp,
}

export class Shader {
  private _filename: string;
  private _contents: string;
  private _data: ShaderData;
  private _compiled: WebGLShader | null = null;
  private _lastCompiledHash: number | null = null;

  public constructor(filename: string, contents: string) {
    this._data = {
      type: ShaderType.Vert,
      uniforms: writable([]),
    };
    this._filename = filename;
    this._contents = contents;
    this.updateType();
    this.updateUniforms();
  }

  /**
   * Returns the compiled `WebGLShader` for this shader but only
   * recompiles if the source has changed.
   */
  public compiled(gl: WebGLRenderingContext): WebGLShader {
    const currentSourceHash = hashString(this._contents);

    // if (
    //   this._compiled === null ||
    //   this._lastCompiledHash !== currentSourceHash
    // ) {
    this._compiled = compileShader(gl, this);
    this._lastCompiledHash = currentSourceHash;
    // }

    return this._compiled!;
  }

  public deleteCompilation() {
    this._compiled = null;
  }

  public updateFilename(filename: string) {
    this._filename = filename;
    this.updateType();
  }

  public updateContents(contents: string) {
    this._contents = contents;
    this.updateUniforms();
  }

  public get filename(): string {
    return this._filename;
  }

  public get contents(): string {
    return this._contents;
  }

  public get data(): ShaderData {
    return this._data;
  }

  private updateType() {
    let extension = this.filename.split(".").pop();
    let type: ShaderType;
    switch (extension) {
      case "frag":
        type = ShaderType.Frag;
        break;
      case "vert":
        type = ShaderType.Vert;
        break;
      case "geom":
        type = ShaderType.Geom;
        break;
      case "comp":
        type = ShaderType.Comp;
        break;
      default:
        throw new Error(
          `Unknown shader type: ${extension} for ${this.filename}`
        );
    }

    this._data.type = type;
  }

  private updateUniforms() {
    let uniforms: Uniform[] = [];
    let lines = this.contents.split("\n");
    for (let line of lines) {
      let tokens = line.split(" ").filter((t) => t !== "");
      if (tokens.length < 3 || tokens[0] !== "uniform") continue;
      let type = tokens[1];
      let name = tokens[2].split(";")[0];
      uniforms.push({ name, type });
    }

    this._data.uniforms.set(uniforms);
  }

  public serialize(): SerializedShader {
    return {
      filename: this._filename,
      contents: this._contents,
    };
  }
}

export interface SerializedShader {
  filename: string;
  contents: string;
}

export function deserializeShader(s: SerializedShader) {
  return new Shader(s.filename, s.contents);
}

interface ShaderData {
  type: ShaderType;
  uniforms: Writable<Uniform[]>;
}

export interface Uniform {
  name: string;
  type: string;
}

export function compileShader(
  gl: WebGLRenderingContext,
  source: Shader
): WebGLShader {
  let type: number | undefined = undefined;

  console.log(source.filename, source.data.type);

  switch (source.data.type) {
    case ShaderType.Frag:
      type = gl.FRAGMENT_SHADER;
      break;
    case ShaderType.Vert:
      type = gl.VERTEX_SHADER;
      break;
  }
  if (type === undefined) {
    throw new Error("Invalid shader type");
  }

  const shader = gl.createShader(type);
  if (shader === null) {
    throw new Error("Failed to create shader");
  }

  gl.shaderSource(shader, source.contents);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw {
      filename: source.filename,
      message: gl.getShaderInfoLog(shader),
    } as ShaderCompileError;
  }

  return shader;
}

interface ShaderCompileError {
  filename: string;
  message: string;
}
