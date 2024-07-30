import { getResizeMode, type TextureResizeMode } from "./texture";

export class FrameBufferTexture {
  public framebuffer: WebGLFramebuffer;
  public texture: WebGLTexture;

  private renderBuffer: WebGLRenderbuffer;
  public readonly isDepthMap: boolean;

  public height: number = 0;
  public width: number = 0;

  public constructor(
    gl: WebGLRenderingContext,
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

  public resize(gl: WebGLRenderingContext, height: number, width: number) {
    if (height === this.height && width === this.width) {
      return;
    }

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      this.isDepthMap ? gl.DEPTH_COMPONENT : gl.RGBA,
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

  private createNew(gl: WebGLRenderingContext, height: number, width: number, resizeMode: TextureResizeMode, isDepthMap: boolean): [WebGLFramebuffer, WebGLTexture, WebGLRenderbuffer] {
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
      isDepthMap ? gl.DEPTH_COMPONENT : gl.RGBA,
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
