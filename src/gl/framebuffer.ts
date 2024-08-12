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

export enum FrameBufferType {
  Colour = "Colour",
  ColourHDR = "Colour HDR",
  Depth = "Depth",
}

function isDepthMap(type: FrameBufferType): boolean {
  return type === FrameBufferType.Depth;
}

function createTexture(texture: WebGLTexture, height: number, width: number, type: FrameBufferType, gl: WebGL2RenderingContext) {
  let internalFormat: GLint;
  let format: GLenum;
  let _type: GLenum;

  switch (type) {
    case FrameBufferType.Colour:
      internalFormat = gl.RGBA;
      format = gl.RGBA;
      _type = gl.UNSIGNED_BYTE;
      break;
    case FrameBufferType.ColourHDR:
      internalFormat = gl.RGBA16F;
      format = gl.RGBA;
      _type = gl.FLOAT;
      break;
    case FrameBufferType.Depth:
      internalFormat = gl.DEPTH_COMPONENT24;
      format = gl.DEPTH_COMPONENT;
      _type = gl.UNSIGNED_INT;
      break;
    default:
      throw new Error("Invalid FrameBufferType");
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    internalFormat,
    width,
    height,
    0,
    format,
    _type,
    null,
  );
}

function attachmentType(type: FrameBufferType, gl: WebGL2RenderingContext): GLenum {
  switch (type) {
    case FrameBufferType.Colour:
      return gl.COLOR_ATTACHMENT0;
    case FrameBufferType.ColourHDR:
      return gl.COLOR_ATTACHMENT0;
    case FrameBufferType.Depth:
      return gl.DEPTH_ATTACHMENT;
  }
}

export class FrameBufferTexture {
  public framebuffer: WebGLFramebuffer;
  public texture: WebGLTexture;

  private renderBuffer: WebGLRenderbuffer;
  public readonly type: FrameBufferType;

  public height: number = 0;
  public width: number = 0;

  public readonly scaleFactor: number;

  public constructor(
    gl: WebGL2RenderingContext,
    height: number,
    width: number,
    resizeMode: TextureResizeMode,
    scaleFactor: number,
    type: FrameBufferType,
  ) {
    this.type = type;
    this.scaleFactor = scaleFactor;
    this.height = Math.floor(height * this.scaleFactor);
    this.width = Math.floor(width * this.scaleFactor);
    [this.framebuffer, this.texture, this.renderBuffer] = this.createNew(
      gl,
      resizeMode,
      type
    );
  }

  public resize(gl: WebGL2RenderingContext, height: number, width: number) {
    height = Math.floor(height * this.scaleFactor);
    width = Math.floor(width * this.scaleFactor);

    if (height === this.height && width === this.width) {
      return;
    }

    console.log("Resizing framebuffer to", height, width);

    this.height = height;
    this.width = width;

    createTexture(this.texture, height, width, this.type, gl);

    if (!isDepthMap(this.type)) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
      // gl.renderbufferStorage(
      //   gl.RENDERBUFFER,
      //   gl.DEPTH_COMPONENT16,
      //   this.width,
      //   this.height,
      // );

      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, width, height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
    }
  }

  public clearFlags(gl: WebGL2RenderingContext): GLenum {
    if (isDepthMap(this.type)) {
      return gl.DEPTH_BUFFER_BIT;
    } else {
      return gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;
    }
  }

  private createNew(
    gl: WebGL2RenderingContext,
    resizeMode: TextureResizeMode,
    type: FrameBufferType,
  ): [WebGLFramebuffer, WebGLTexture, WebGLRenderbuffer] {
    const texture = gl.createTexture();

    if (texture === null) {
      throw new Error("Failed to create texture");
    }

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    createTexture(texture, this.height, this.width, type, gl);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      getResizeMode(gl, resizeMode),
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      getResizeMode(gl, resizeMode),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Create a renderbuffer for the depth buffer
    const renderbuffer = gl.createRenderbuffer();

    if (!isDepthMap(type)) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
      gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        this.width,
        this.height,
      );
    }

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      attachmentType(type, gl),
      gl.TEXTURE_2D,
      texture,
      0,
    );

    if (!isDepthMap(type)) {
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        renderbuffer,
      );
    }

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      console.log(this);
      console.error(gl.checkFramebufferStatus(gl.FRAMEBUFFER));
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
