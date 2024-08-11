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

import type { Shader, Uniform as UniformDefinition } from "./shader";

export class GLProgram {
  public readonly program: WebGLProgram;
  public readonly uniforms: Record<string, WebGLUniformLocation>;
  public readonly uniformTypes: Record<string, string>;
  public readonly attributes: Record<string, GLint>;

  public constructor(gl: WebGL2RenderingContext, shaders: Shader[]) {
    this.program = gl.createProgram()!;
    for (let shader of shaders) {
      gl.attachShader(this.program, shader.compiled(gl));
    }
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(
        `Failed to link program: ${gl.getProgramInfoLog(this.program)}`,
      );
    }

    let uniforms: Record<string, WebGLUniformLocation> = {};
    let uniformTypes: Record<string, string> = {};

    for (let shader of shaders) {
      const uniformDefs: UniformDefinition[] = [];
      shader.data.uniforms.update((u) => {
        uniformDefs.push(...u);
        return u;
      });

      for (let uniform of uniformDefs) {
        uniforms[uniform.name] = gl.getUniformLocation(
          this.program,
          uniform.name,
        )!;
        uniformTypes[uniform.name] = uniform.type;
      }
    }

    this.uniforms = uniforms;
    this.uniformTypes = uniformTypes;

    let attributes: Record<string, GLint> = {};

    const ATTRIBUTE_NAMES = ["position", "normal", "uv"];
    for (let name of ATTRIBUTE_NAMES) {
      let attr = gl.getAttribLocation(this.program, name);
      if (attr === -1) continue;
      attributes[name] = attr;
    }

    this.attributes = attributes;
  }
}
