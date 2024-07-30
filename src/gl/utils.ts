export function createVBO(gl: WebGLRenderingContext, data: number[]): WebGLBuffer {
  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(data), gl.STATIC_DRAW);
  return vbo;
}

export function bindVBOToAttribute(
  gl: WebGLRenderingContext,
  vbo: WebGLBuffer,
  attribute: GLint,
  size: number
) {
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 0, 0);
}

export const WINDOW_ASPECT: { value: number } = { value: 1 };
export const WINDOW_HEIGHT: { value: number } = { value: 1 };
export const WINDOW_WIDTH: { value: number } = { value: 1 };
