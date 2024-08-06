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

import { mat4_0, mat4_I, type Mat4, type Vec3 } from "@/utils";
import type { GLProgram } from "./glProgram";
import { WINDOW_HEIGHT, WINDOW_WIDTH } from "./utils";
import { Projection, View } from "@/camera";

export interface UniformSetter {
  set(gl: WebGL2RenderingContext, program: GLProgram): void;
  reset(gl: WebGL2RenderingContext, program: GLProgram): void;
}

export class UniformFloatSetter implements UniformSetter {
  protected name: string;
  protected value: number;

  public constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  public set(gl: WebGL2RenderingContext, program: GLProgram) {
    gl.uniform1f(program.uniforms[this.name], this.value);
  }

  public reset(gl: WebGL2RenderingContext, program: GLProgram) {}
}

export class UniformTimeSetter extends UniformFloatSetter {
  public constructor(name: string) {
    super(name, 0);
  }

  public set(gl: WebGL2RenderingContext, program: GLProgram) {
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

  public set(gl: WebGL2RenderingContext, program: GLProgram) {
    const [x, y] = this.getValue();
    gl.uniform2f(program.uniforms[this.name], x, y);
  }

  public reset(gl: WebGL2RenderingContext, program: GLProgram) {}
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

  public set(gl: WebGL2RenderingContext, program: GLProgram) {
    const unit: GLenum = gl.TEXTURE0 + this.textureUnit;
    gl.activeTexture(unit);
    gl.bindTexture(this.isCubeMap ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D, this.texture);
    gl.uniform1i(program.uniforms[this.name], this.textureUnit);
  }

  public reset(gl: WebGL2RenderingContext, program: GLProgram) {
    const unit: GLenum = gl.TEXTURE0 + this.textureUnit;
    gl.activeTexture(unit);
    gl.bindTexture(this.isCubeMap ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D, null);
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

  public set(gl: WebGL2RenderingContext, program: GLProgram) {
    gl.uniformMatrix4fv(
      program.uniforms[this.name],
      false,
      new Float32Array(this.getValue())
    );
  }

  public reset(gl: WebGL2RenderingContext, program: GLProgram) {}
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
