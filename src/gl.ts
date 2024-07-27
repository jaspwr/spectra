import { Camera } from "./camera";
import type { Project } from "./project";
import { Shader, ShaderType } from "./shader";
import { hashString, mat4_I, type Mat4, type Model } from "./utils";

export const WINDOW_ASPECT: { value: number } = { value: 1 };

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

    console.log(shaders);
    for (let shader of shaders) {
      for (let uniform of shader.data.uniforms) {
        console.log(uniform.name);
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

let camera = new Camera();

export class RenderStep {
  program: GLProgram;
  framebuffer: WebGLFramebuffer | null;
  geometry: Geometry[];
  uniformSetters: UniformSetter[];

  public constructor(
    program: GLProgram,
    framebuffer: WebGLFramebuffer | null,
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
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    gl.useProgram(this.program.program);

    for (let setter of this.uniformSetters) {
      setter.set(gl, this.program);
    }

    if (this.program.uniforms["projection"] !== undefined) {
      gl.uniformMatrix4fv(
        this.program.uniforms["projection"],
        false,
        camera.projection
      );
    }

    if (this.program.uniforms["view"] !== undefined) {
      gl.uniformMatrix4fv(this.program.uniforms["view"], false, camera.view);
    }

    if (this.program.uniforms["model"] !== undefined) {
      gl.uniformMatrix4fv(this.program.uniforms["model"], false, mat4_I());
    }

    for (let geometry of this.geometry) {
      geometry.render(gl, this.program);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}

export interface UniformSetter {
  set(gl: WebGLRenderingContext, program: GLProgram): void;
}

class UniformSetterFloat implements UniformSetter {
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

export class UniformTimeSetter extends UniformSetterFloat {
  public constructor(name: string) {
    super(name, 0);
  }

  public set(gl: WebGLRenderingContext, program: GLProgram) {
    this.value += 0.01;
    gl.uniform1f(program.uniforms[this.name], this.value);
  }
}

export class UniformMat4Setter implements UniformSetter {
  protected name: string;
  protected value: Mat4;

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
      new Float32Array(this.value)
    );
  }
}

interface Geometry {
  render(gl: WebGLRenderingContext, program: GLProgram): void;
}

export class Mesh implements Geometry {
  vertices: WebGLBuffer;
  normals: WebGLBuffer;
  uv: WebGLBuffer;
  vertexCount: number;

  public constructor(gl: WebGLRenderingContext, model: Model) {
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

export class FullscreenQuad implements Geometry {
  vbo: WebGLBuffer;

  public constructor(gl: WebGLRenderingContext) {
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

export function createFramebuffer(
  gl: WebGLRenderingContext,
  height: number,
  width: number
): WebGLFramebuffer {
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );

  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    console.error("Framebuffer is not complete");
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  if (framebuffer === null) {
    throw new Error("Failed to create framebuffer");
  }

  return framebuffer;
}

function loadImageTexture(gl: WebGLRenderingContext, url: string) {
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
  image.addEventListener("load", function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  });

  return texture;
}
