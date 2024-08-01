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

import { getResizeMode, type TextureResizeMode } from "./texture";

export class FrameBufferTexture {
  public framebuffer: WebGLFramebuffer;
  public texture: WebGLTexture;

  private renderBuffer: WebGLRenderbuffer;
  public readonly isDepthMap: boolean;

  public height: number = 0;
  public width: number = 0;

  public constructor(
    gl: WebGL2RenderingContext,
    height: number,
    width: number,
    resizeMode: TextureResizeMode,
    isDepthMap: boolean = false
  ) {
    this.isDepthMap = isDepthMap;
    [this.framebuffer, this.texture, this.renderBuffer] = this.createNew(gl, height, width, resizeMode, isDepthMap);
    this.height = height;
    this.width = width;
  }

  public resize(gl: WebGL2RenderingContext, height: number, width: number) {
    if (height === this.height && width === this.width) {
      return;
    }

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      this.isDepthMap ? gl.DEPTH_COMPONENT24 : gl.RGBA,
      width,
      height,
      0,
      this.isDepthMap ? gl.DEPTH_COMPONENT : gl.RGBA,
      this.isDepthMap ? gl.UNSIGNED_INT : gl.UNSIGNED_BYTE,
      null
    );

    if (!this.isDepthMap) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    }

    this.height = height;
    this.width = width;
  }

  private createNew(gl: WebGL2RenderingContext, height: number, width: number, resizeMode: TextureResizeMode, isDepthMap: boolean): [WebGLFramebuffer, WebGLTexture, WebGLRenderbuffer] {
    const texture = gl.createTexture();

    if (texture === null) {
      throw new Error("Failed to create texture");
    }

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      isDepthMap ? gl.DEPTH_COMPONENT24 : gl.RGBA,
      width,
      height,
      0,
      isDepthMap ? gl.DEPTH_COMPONENT : gl.RGBA,
      isDepthMap ? gl.UNSIGNED_INT : gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, getResizeMode(gl, resizeMode));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, getResizeMode(gl, resizeMode));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Create a renderbuffer for the depth buffer
    const renderbuffer = gl.createRenderbuffer();

    if (!isDepthMap) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    }

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      isDepthMap ? gl.DEPTH_ATTACHMENT : gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );

    if (!isDepthMap) {
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
    }

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.error("Framebuffer is not complete");
    }

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (framebuffer === null || renderbuffer === null) {
      throw new Error("Failed to create framebuffer");
    }

    return [framebuffer, texture, renderbuffer];
  }
}
