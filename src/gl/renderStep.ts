import type { FrameBufferTexture } from "./framebuffer";
import type { Geometry } from "./geometry";
import type { GLProgram } from "./glProgram";
import type { UniformSetter } from "./uniform";

export class RenderStep {
  program: GLProgram;
  framebuffer: FrameBufferTexture | null;
  geometry: Geometry[];
  uniformSetters: UniformSetter[];

  public constructor(
    program: GLProgram,
    framebuffer: FrameBufferTexture | null,
    geometry: Geometry[],
    uniformSetters: UniformSetter[]
  ) {
    this.program = program;
    this.framebuffer = framebuffer;
    this.geometry = geometry;
    this.uniformSetters = uniformSetters;
  }

  public render(gl: WebGLRenderingContext, deltaTime: number) {
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

    if (this.framebuffer !== null) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
  }
}
