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

import type { FrameBufferTexture } from "./framebuffer";
import type { Geometry } from "./geometry";
import type { GLProgram } from "./glProgram";
import type { UniformSetter } from "./uniform";

export class RenderStep {
  program: GLProgram;
  framebuffer: FrameBufferTexture | null;
  geometry: Geometry[];
  uniformSetters: UniformSetter[];

  public outputId: string = "";
  public dependencies: string[] = [];

  public constructor(
    program: GLProgram,
    framebuffer: FrameBufferTexture | null,
    geometry: Geometry[],
    uniformSetters: UniformSetter[],
    dependencies: string[],
    outputId: string,
  ) {
    this.program = program;
    this.framebuffer = framebuffer;
    this.geometry = geometry;
    this.uniformSetters = uniformSetters;
    this.dependencies = dependencies;
    this.outputId = outputId;
  }

  public render(gl: WebGL2RenderingContext, deltaTime: number) {
    if (this.framebuffer !== null) {
      this.framebuffer.resize(gl, gl.canvas.height, gl.canvas.width);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer.framebuffer);
      gl.viewport(0, 0, this.framebuffer.width, this.framebuffer.height);
      if (this.framebuffer.isDepthMap) {
        gl.clear(gl.DEPTH_BUFFER_BIT);
      } else {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
    }

    gl.useProgram(this.program.program);

    for (let setter of this.uniformSetters) {
      setter.set(gl, this.program);
    }

    for (let geometry of this.geometry) {
      for (let override of geometry.uniformOverrides) {
        override.set(gl, this.program);
      }
      geometry.render(gl, this.program);
    }

    for (let setter of this.uniformSetters) {
      setter.reset(gl, this.program);
    }

    if (this.framebuffer !== null) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
  }
}
