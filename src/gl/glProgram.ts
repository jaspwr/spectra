import type { Shader, Uniform as UniformDefinition } from "./shader";

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
      const uniformDefs: UniformDefinition[] = [];
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
