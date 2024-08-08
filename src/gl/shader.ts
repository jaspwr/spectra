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
  Invalid,
  Frag,
  Vert,
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
  public compiled(gl: WebGL2RenderingContext): WebGLShader {
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
      case "comp":
        type = ShaderType.Comp;
        break;
      default:
        type = ShaderType.Invalid;
        break;
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

  public lint(gl: WebGL2RenderingContext): LintMessage[] {
    const messages: LintMessage[] = [];

    const type = shaderType(this.data.type);
    if (type === undefined) {
      return [];
    }

    const shader = gl.createShader(type);
    if (shader === null) {
      throw new Error("Failed to create shader");
    }

    gl.shaderSource(shader, this._contents);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return gl.getShaderInfoLog(shader)
        ?.split("\n")
        .filter((line) => /\w/.test(line))
        .map((line) =>
          new LintMessage(line, this._contents)
        ) ?? [];
    }

    return [];
  }

}

export enum LintSeverity {
  Unknown = "unknown",
  Error = "error",
  Warning = "warning",
  Info = "info",
  Hint = "hint",
}

export class LintMessage {
  public readonly message: string;
  public readonly severity: LintSeverity;
  public readonly range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };

  public constructor(
    rawError: string,
    shaderSource: string,
  ) {
    this.message = rawError;
    const parts = rawError.split(":");

    if (parts.length !== 5) {
      let [serverity, ...rest] = parts;
      this.severity = this.parseSeverity(serverity);
      this.range = { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: this.endOfLine(1, shaderSource) };
      return;
    }

    const [type, _, rawLineNum, code, __] = parts;
    const lineNum = parseInt(rawLineNum);
    const codeParts = code.split("'")[1];

    this.severity = this.parseSeverity(type);

    const line = shaderSource.split("\n")[lineNum - 1];
    const start = line.indexOf(codeParts);
    const end = start + codeParts.length;

    this.range = { startLineNumber: lineNum, endLineNumber: lineNum, startColumn: start + 1, endColumn: end + 1 };
  }

  private parseSeverity(type: string): LintSeverity {
    switch (type) {
      case "ERROR":
        return LintSeverity.Error;
      case "WARNING":
        return LintSeverity.Warning;
      default:
        return LintSeverity.Unknown;
    }
  }

  private endOfLine(line: number, source: string): number {
    const lineStr = source.split("\n")[line - 1] ?? "";
    for (let i = lineStr.length; i >= 0; i--) {
      if (/\w/.test(lineStr.charAt(i))) {
        return i + 2;
      }
    }
    return 1;
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

function shaderType(type: ShaderType): GLenum | undefined {
  switch (type) {
    case ShaderType.Frag:
      return WebGL2RenderingContext.FRAGMENT_SHADER;
    case ShaderType.Vert:
      return WebGL2RenderingContext.VERTEX_SHADER;
    default:
      return undefined;
  }
}

export function compileShader(
  gl: WebGL2RenderingContext,
  source: Shader
): WebGLShader {
  const type = shaderType(source.data.type);

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
