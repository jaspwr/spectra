import type { Project } from "./project";
import { Shader, ShaderType } from "./shader";
import { hashString } from "./utils";

export class PipeLine {
  private steps: RenderStep[] = [];

  /**
   * @throws {string[]} An array of errors in the shaders and render pipeline
   */
  public constructor(project: Project, gl: WebGLRenderingContext) {
    const vsSource = `
    #version 100

    attribute vec4 aVertexPosition;
    void main(void) {
        gl_Position = aVertexPosition;
    }
`;

    const fsSource = `
    #version 100

    #ifdef GL_ES
    precision highp float;
    #endif

    void main(void) {
        gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    }
`;

    let errors: string[] = [];
    // for (let shader of project.shaderFiles) {
    //   try {
    //     let _ = shader.compiled(gl);
    //   } catch (e) {
    //     let e_ = e as ShaderCompileError;
    //     errors.push(`[${e_.filename}] ${e_.message}`);
    //   }
    // }

    try {
      const vs = new Shader("vs.vert", vsSource);
      const fs = new Shader("fs.frag", fsSource);

      const program = new GLProgram(gl, [vs, fs]);
      const geometry = new Geometry(gl);
      const step = new RenderStep(program, null, [geometry]);

      this.steps.push(step);
    } catch (e: any) {
      if (e.filename !== undefined) {
        errors.push(`[${e.filename}] ${e.message}`);
      } else {
        errors.push(e);
      }
    }

    if (errors.length > 0) {
      throw errors;
    }
  }

  public render(gl: WebGLRenderingContext, deltaTime: number) {
    for (let step of this.steps) {
      step.render(gl, deltaTime);
    }
  }
}

class GLProgram {
  public readonly program: WebGLProgram;
  public readonly uniforms: Record<string, WebGLUniformLocation>;
  public readonly uniformTypes: Record<string, string>;

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
      for (let uniform of shader.data.uniforms) {
        uniforms[uniform.name] = gl.getUniformLocation(
          this.program,
          uniform.name
        )!;
        uniformTypes[uniform.name] = uniform.type;
      }
    }

    this.uniforms = uniforms;
    this.uniformTypes = uniformTypes;
  }
}

class RenderStep {
  program: GLProgram;
  framebuffer: WebGLFramebuffer | null;
  geometry: Geometry[];

  public constructor(
    program: GLProgram,
    framebuffer: WebGLFramebuffer | null,
    geometry: Geometry[]
  ) {
    this.program = program;
    this.framebuffer = framebuffer;
    this.geometry = geometry;
  }

  public render(gl: WebGLRenderingContext, deltaTime: number) {
    if (this.framebuffer !== null) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    gl.useProgram(this.program.program);
    for (let geometry of this.geometry) {
      geometry.render(gl, this.program.program);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}

class Geometry {
  vbo: WebGLBuffer;

  public constructor(gl: WebGLRenderingContext) {
    const vertices = new Float32Array([1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0]);

    this.vbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  public render(gl: WebGLRenderingContext, program: WebGLProgram) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

    const vertexPosition = gl.getAttribLocation(program, "aVertexPosition");

    gl.enableVertexAttribArray(vertexPosition);
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }
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

function createFramebuffer(
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
