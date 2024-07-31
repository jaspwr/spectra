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

import { WINDOW_ASPECT } from "@/gl/utils";
import { mat4_0, mat4_translate, type Mat4, type Vec3 } from "./utils";

export class View {
  private data: ViewData = new ViewData();
  private dirty: boolean = true;
  private mat: Mat4 | null = null;

  public get value(): Mat4 {
    if (this.dirty || this.mat === null) {
      this.dirty = false;
      const view = this.calculateView();
      this.mat = view;
      return view;
    }
    return this.mat;
  }

  public update(fn: (data: ViewData) => void) {
    fn(this.data);
    this.dirty = true;
  }

  private calculateView(): Mat4 {
    const mat = mat4_0();

    const [ex, ey, ez] = this.data.position;
    const [cx, cy, cz] = this.data.target;
    const [ux, uy, uz] = this.data.up;

    let fx = cx - ex,
      fy = cy - ey,
      fz = cz - ez;
    const rlf = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz);
    fx *= rlf;
    fy *= rlf;
    fz *= rlf;

    let sx = fy * uz - fz * uy;
    let sy = fz * ux - fx * uz;
    let sz = fx * uy - fy * ux;
    const rls = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz);
    sx *= rls;
    sy *= rls;
    sz *= rls;

    const ux2 = sy * fz - sz * fy;
    const uy2 = sz * fx - sx * fz;
    const uz2 = sx * fy - sy * fx;

    mat[0] = sx;
    mat[1] = ux2;
    mat[2] = -fx;
    mat[3] = 0;
    mat[4] = sy;
    mat[5] = uy2;
    mat[6] = -fy;
    mat[7] = 0;
    mat[8] = sz;
    mat[9] = uz2;
    mat[10] = -fz;
    mat[11] = 0;
    mat[12] = -(sx * ex + sy * ey + sz * ez);
    mat[13] = -(ux2 * ex + uy2 * ey + uz2 * ez);
    mat[14] = fx * ex + fy * ey + fz * ez;
    mat[15] = 1;

    return mat;
  }

}

export class Projection {
  private dirty: boolean = true;
  private mat: Mat4 | null = null;
  private preAspect: number = 1;
  private data: ProjectionData = new ProjectionData();

  public get value(): Mat4 {
    if (this.dirty || this.mat === null || this.preAspect !== WINDOW_ASPECT.value) {
      const proj = this.calculateProjection();
      this.dirty = false;
      this.preAspect = WINDOW_ASPECT.value;
      this.mat = proj;
      return proj;
    }
    return this.mat;
  }

  public update(fn: (data: ProjectionData) => void) {
    fn(this.data);
    this.dirty = true;
  }

  private calculateProjection(): Mat4 {
    const mat = mat4_0();

    const height_div_2n = Math.tan((this.data.fov * Math.PI) / 360);
    const width_div_2n = WINDOW_ASPECT.value * height_div_2n;
    mat[0] = 1 / height_div_2n;
    mat[5] = 1 / width_div_2n;
    mat[10] =
      (this.data.far + this.data.near) / (this.data.near - this.data.far);
    mat[11] = -1;
    mat[14] =
      (2 * this.data.far * this.data.near) / (this.data.near - this.data.far);
    mat[15] = 0;

    return mat;
  }
}

export class ViewData {
  public position: Vec3 = [-6, 6, 3];
  public target: Vec3 = [0, 0, 0];
  public up: Vec3 = [0, 1, 0];
}

export class ProjectionData {
  public fov: number = 45;
  public near: number = 0.1;
  public far: number = 100;
}
