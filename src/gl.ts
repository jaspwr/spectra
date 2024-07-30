import { Projection, View } from "./camera";
import type { Project } from "./project";
import { Shader, ShaderType, type Uniform } from "./shader";
import { hashString, mat4_0, mat4_I, type Mat4, type Model, type Vec3 } from "./utils";

export const WINDOW_ASPECT: { value: number } = { value: 1 };
export const WINDOW_HEIGHT: { value: number } = { value: 1 };
export const WINDOW_WIDTH: { value: number } = { value: 1 };

export class GLProgram {
  public readonly program: WebGLProgram;
  public readonly uniforms: Record<string, WebGLUniformLocation>;
  public readonly uniformTypes: Record<string, string>;
  public readonly attributes: Record<string, GLint>;

  public constructor(gl: WebGLRenderingContext, shaders: Shader[]) {
    this.program = gl.createProgram()!;
    for (let shader of shaders) {
      gl.attachShader(this.program, shader.compiled(gl));
    }
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(
        `Failed to link program: ${gl.getProgramInfoLog(this.program)}`
      );
    }

    let uniforms: Record<string, WebGLUniformLocation> = {};
    let uniformTypes: Record<string, string> = {};

    for (let shader of shaders) {
      const uniformDefs: Uniform[] = [];
      shader.data.uniforms.update((u) => {
        uniformDefs.push(...u);
        return u;
      });

      for (let uniform of uniformDefs) {
        uniforms[uniform.name] = gl.getUniformLocation(
          this.program,
          uniform.name
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

export interface UniformSetter {
  set(gl: WebGLRenderingContext, program: GLProgram): void;
}

export class UniformFloatSetter implements UniformSetter {
  protected name: string;
  protected value: number;

  public constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  public set(gl: WebGLRenderingContext, program: GLProgram) {
    gl.uniform1f(program.uniforms[this.name], this.value);
  }
}

export class UniformTimeSetter extends UniformFloatSetter {
  public constructor(name: string) {
    super(name, 0);
  }

  public set(gl: WebGLRenderingContext, program: GLProgram) {
    this.value += 0.01;
    gl.uniform1f(program.uniforms[this.name], this.value);
  }
}


export class UniformVec2Setter implements UniformSetter {
  protected name: string;
  protected value: [number, number];

  protected getValue(): [number, number] {
    return this.value;
  }

  public constructor(name: string, value: [number, number]) {
    this.name = name;
    this.value = value;
  }

  public set(gl: WebGLRenderingContext, program: GLProgram) {
    const [x, y] = this.getValue();
    gl.uniform2f(program.uniforms[this.name], x, y);
  }
}

export class UniformWindowSizeSetter extends UniformVec2Setter {
  public constructor(name: string) {
    super(name, [0, 0]);
  }

  protected override getValue(): [number, number] {
    return [WINDOW_WIDTH.value, WINDOW_HEIGHT.value];
  }
}

export class UniformTextureSetter implements UniformSetter {
  protected name: string;
  protected texture: WebGLTexture;
  private textureUnit: number;
  private isCubeMap: boolean;

  public constructor(name: string, texture: WebGLTexture, textureUnit: number, isCubeMap: boolean) {
    this.name = name;
    this.texture = texture;
    this.textureUnit = textureUnit;
    this.isCubeMap = isCubeMap;
  }

  public set(gl: WebGLRenderingContext, program: GLProgram) {
    const unit: GLenum = gl.TEXTURE0 + this.textureUnit;
    gl.activeTexture(unit);
    gl.bindTexture(this.isCubeMap ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D, this.texture);
    gl.uniform1i(program.uniforms[this.name], this.textureUnit);
  }
}

export class UniformMat4Setter implements UniformSetter {
  protected name: string;
  protected value: Mat4;

  protected getValue() {
    return this.value;
  }

  public constructor(name: string, value: Mat4) {
    this.name = name;
    this.value = value;

    if (value.length !== 16) {
      throw new Error("Invalid matrix size");
    }
  }

  public set(gl: WebGLRenderingContext, program: GLProgram) {
    gl.uniformMatrix4fv(
      program.uniforms[this.name],
      false,
      new Float32Array(this.getValue())
    );
  }
}

export class UniformTranslationSetter extends UniformMat4Setter {
  public constructor(name: string, translation: Vec3) {
    super(name, mat4_I());
    this.update(translation);
  }

  public update(translation: Vec3) {
    this.value[12] = translation[0];
    this.value[13] = translation[1];
    this.value[14] = translation[2];
  }
}

export class UniformProjectionSetter extends UniformMat4Setter {
  private projection: Projection;

  public constructor(name: string, fov: number, far: number, near: number) {
    super(name, mat4_0());

    this.projection = new Projection();
    this.projection.update(p => {
      p.fov = fov;
      p.far = far;
      p.near = near;
      return p;
    });
  }

  protected override getValue() {
    return this.projection.value;
  }
}

export class UniformViewSetter extends UniformMat4Setter {
  private view: View;

  public constructor(
    name: string,
    position: Vec3,
    target: Vec3,
    up: Vec3
  ) {
    super(name, mat4_0());

    this.view = new View();
    this.view.update(v => {
      v.position = position;
      v.target = target;
      v.up = up;
      return v;
    });
  }

  protected override getValue() {
    return this.view.value;
  }
}

export abstract class Geometry {
  public uniformOverrides: UniformSetter[];
  abstract render(gl: WebGLRenderingContext, program: GLProgram): void;

  constructor(uniformOverrides: UniformSetter[]) {
    this.uniformOverrides = uniformOverrides;
  }
}

export class Mesh extends Geometry {
  vertices: WebGLBuffer;
  normals: WebGLBuffer;
  uv: WebGLBuffer;
  vertexCount: number;

  public constructor(gl: WebGLRenderingContext, model: Model, uniformOverrides: UniformSetter[]) {
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

  public render(gl: WebGLRenderingContext, program: GLProgram) {
    bindVBOToAttribute(gl, this.vertices, program.attributes["position"], 3);
    bindVBOToAttribute(gl, this.normals, program.attributes["normal"], 3);
    bindVBOToAttribute(gl, this.uv, program.attributes["uv"], 2);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
  }
}

export class FullscreenQuad extends Geometry {
  vbo: WebGLBuffer;

  public constructor(gl: WebGLRenderingContext, uniformOverrides: UniformSetter[]) {
    super(uniformOverrides);

    const vertices = new Float32Array([
      1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
    ]);

    this.vbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  public render(gl: WebGLRenderingContext, program: GLProgram) {
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

  public constructor(gl: WebGLRenderingContext) {
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

  public render(gl: WebGLRenderingContext, program: GLProgram) {
    bindVBOToAttribute(gl, this.vbo, program.attributes["position"], 3);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
  }
}

function createVBO(gl: WebGLRenderingContext, data: number[]): WebGLBuffer {
  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(data), gl.STATIC_DRAW);
  return vbo;
}

function bindVBOToAttribute(
  gl: WebGLRenderingContext,
  vbo: WebGLBuffer,
  attribute: GLint,
  size: number
) {
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 0, 0);
}

interface ShaderCompileError {
  filename: string;
  message: string;
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

export enum TextureResizeMode {
  Nearest = "Nearest",
  Linear = "Linear",
}

function getResizeMode(gl: WebGLRenderingContext, mode: TextureResizeMode): GLenum {
  switch (mode) {
    case TextureResizeMode.Nearest:
      return gl.NEAREST;
    case TextureResizeMode.Linear:
      return gl.LINEAR;
  }
}

export function loadImageTexture(gl: WebGLRenderingContext, url: string): WebGLTexture {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255])
  );

  const image = new Image();
  image.src = url;
  image.addEventListener("load", function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // gl.generateMipmap(gl.TEXTURE_2D);
  });

  if (texture === null) {
    throw new Error("Failed to create texture");
  }

  return texture;
}

export function createCubeMapTexture(gl: WebGLRenderingContext, url: string): WebGLTexture {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

  const faces = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  ];

  const fileNames = ["left", "right", "top", "bottom", "front", "back"];

  for (let i = 0; i < faces.length; i++) {
    const image = new Image();
    image.src = `${url}/${fileNames[i]}.png`;
    image.addEventListener("load", function() {
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      gl.texImage2D(faces[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    });
  }

  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  if (texture === null) {
    throw new Error("Failed to create cubemap");
  }

  return texture;
}

export function createSkyBoxProgram(gl: WebGLRenderingContext) {
  const vertSource = `
attribute vec3 position;

uniform mat4 uView;
uniform mat4 uProjection;

varying vec3 vUv;

void main() {
    vec4 pos = uProjection * uView * position;
    gl_Position = vec4(pos.x, pos.y, pos.w, pos.w);
    vUv = vec3(position.x, position.y, -position.z);
}
  `;
  const fragSource = `
#version 100

#ifdef GL_ES
precision highp float;
#endif

varying vec3 vUv;

uniform samplerCube uSkybox;

void main(void) {
    gl_FragColor = textureCube(uSkybox, vUv);
}
`;

  const shaders = [
    new Shader("skybox.vert", vertSource),
    new Shader("skybox.frag", fragSource),
  ];
  return new GLProgram(gl, shaders);
}
