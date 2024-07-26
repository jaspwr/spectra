import { writable, type Writable } from "svelte/store";
import { Shader } from "./shader";

const _projects: Project[] = [
  {
    name: "Simple Frag",
    goals: [
      { name: "Modify colours", done: false },
      { name: "Swizzle a vector", done: false },
      { name: "Use UV coords", done: false },
      { name: "Use uniforms", done: false },
      { name: "Sample from a texture", done: false },
    ],
    shaderFiles:  [new Shader("main.frag", "precision mediump float;")],
  },
  {
    name: "Shapes",
    goals: [
        { name: "Diffuse lighting", done: false },
        { name: "Specular highlights", done: false },
        { name: "Normal mapping", done: false },
        { name: "Fog", done: false },
        { name: "Shadows", done: false },
        { name: "Bloom", done: false },
    ],
    shaderFiles: [],
  },
  {
    name: "Full Scene",
    goals: [
        { name: "Swaying grass", done: false },
        { name: "Wavy water", done: false },
        { name: "Water reflections", done: false },
        { name: "Post-processing effects", done: false },
    ],
    shaderFiles: [],
  }
];

for (let project of _projects) {
  project.selectedShaderFile = writable(project.shaderFiles[0]?.uid ?? -1);
}

export const projects = writable<Project[]>(_projects);


// The UID of the selected project
export const selectedProject = writable<string>("Simple Frag");

export interface Project {
  name: string;
  goals: Goal[];
  shaderFiles: Shader[];
  selectedShaderFile?: Writable<number>;
}

export interface Goal {
  name: string;
  done: boolean;
}
