import { compileShader } from "./gl";
import { hashString } from "./utils";

export enum ShaderType {
  Frag,
  Vert,
  Geom,
  Comp,
}

let ID_COUNTER = 0;

export class Shader {
  public readonly uid: number = ID_COUNTER++;
  private _filename: string;
  private _contents: string;
  private _data: ShaderData;
  private _compiled: WebGLShader | null = null;
  private _lastCompiledHash: number | null = null;

  public constructor(filename: string, contents: string) {
    this._filename = filename;
    this._contents = contents;
    this._data = this.parseData();
  }

  /**
   * Returns the compiled `WebGLShader` for this shader but only
   * recompiles if the source has changed.
   */
  public compiled(gl: WebGLRenderingContext): WebGLShader {
    const currentSourceHash = hashString(this._contents);

    if (this._lastCompiledHash !== currentSourceHash) {
      this._compiled = compileShader(gl, this);
      this._lastCompiledHash = currentSourceHash;
    }

    return this._compiled!;
  }

  public updateFilename(filename: string) {
    this._filename = filename;
    this._data = this.parseData();
  }

  public updateContents(contents: string) {
    this._contents = contents;
    this._data = this.parseData();
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

  private parseData(): ShaderData {
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

    let uniforms: Uniform[] = [];
    let lines = this.contents.split("\n");
    for (let line of lines) {
      let tokens = line.split(" ");
      if (tokens.length < 3 || tokens[0] !== "uniform") continue;
      let type = tokens[1];
      let name = tokens[2].split(";")[0];
      uniforms.push({ name, type });
    }

    return { type, uniforms };
  }
}

interface ShaderData {
  type: ShaderType;
  uniforms: Uniform[];
}

interface Uniform {
  name: string;
  type: string;
}
