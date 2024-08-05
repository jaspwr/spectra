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

import { writable, type Writable } from "svelte/store";
import { deserializeShader, Shader, type SerializedShader } from "./gl/shader";
import pako from "pako";
import type {
  Edge as SvelteFlowEdge,
  Node as SvelteFlowNode,
} from "@xyflow/svelte";
import type { Macro } from "@/macro";
import { URL_PARAMETERS } from "./url";


// The filename of the selected project
export const selectedProject = writable<string>("Simple Frag");

const _projects: Project[] = [];

if (URL_PARAMETERS.project !== undefined) {
  const project = fromUrl(URL_PARAMETERS.project);
  _projects.push(project);
  selectedProject.set(project.name);
  if (URL_PARAMETERS.defaultSourceFile !== undefined) {
    console.log(URL_PARAMETERS.defaultSourceFile);
    if (project.selectedShaderFile === undefined) project.selectedShaderFile = writable(URL_PARAMETERS.defaultSourceFile);
    project.selectedShaderFile?.set(URL_PARAMETERS.defaultSourceFile);
  }
}

_projects.push(
  deserialize(
    `{"name":"Simple Frag","goals":[{"name":"Modify colours","done":false},{"name":"Swizzle a vector","done":false},{"name":"Use UV coords","done":false},{"name":"Use uniforms","done":false},{"name":"Sample from a texture","done":false}],"shaders":[{"filename":"main.frag","contents":"#version 100\\n\\n#ifdef GL_ES\\nprecision highp float;\\n#endif\\n\\nuniform float time;\\n\\nvarying vec2 uvCoords;\\n\\nvoid main(void) {\\n    gl_FragColor = vec4(uvCoords.x + sin(time), cos(uvCoords.y + time), 1., 1.) / 2.0;\\n}\\n"},{"filename":"main.vert","contents":"#version 100\\n\\nattribute vec4 position;\\n\\nvarying vec2 uvCoords;\\n\\nvoid main(void) {\\n    uvCoords = (position.xy + 1.0)/2.0;\\n    gl_Position = position;\\n}\\n"}],"pipelineGraph":{"nodes":[{"id":"0.46183791393277907","type":"gl-program","position":{"x":250,"y":125},"data":{"label":"gl-program node"},"origin":[0.5,0],"measured":{"width":122,"height":80},"selected":false},{"id":"0.9361335759625984","type":"window","position":{"x":393.5,"y":150},"data":{"label":"window node"},"origin":[0.5,0],"measured":{"width":87,"height":40},"selected":false,"dragging":false},{"id":"0.13214298723530327","type":"shader","position":{"x":11,"y":75},"data":{"label":"shader node","shaderSourceFileName":"main.frag"},"origin":[0.5,0],"measured":{"width":222,"height":88},"selected":false,"dragging":false},{"id":"0.5773928601448672","type":"shader","position":{"x":11,"y":-25},"data":{"label":"shader node","shaderSourceFileName":"main.vert"},"origin":[0.5,0],"measured":{"width":222,"height":72},"selected":false,"dragging":false},{"id":"0.6592953329742872","type":"geometry","position":{"x":36.5,"y":200},"data":{"label":"geometry node","type":"Screen Quad","uniformOverrides":[]},"origin":[0.5,0],"measured":{"width":123,"height":113},"selected":false,"dragging":false},{"id":"0.5113171012819773","type":"uniform","position":{"x":-244,"y":100},"data":{"label":"uniform node","type":"time"},"origin":[0.5,0],"measured":{"width":162,"height":59},"selected":false,"dragging":false}],"edges":[{"source":"0.46183791393277907","target":"0.9361335759625984","targetHandle":"in","id":"xy-edge__0.46183791393277907-0.9361335759625984in","selected":false},{"source":"0.13214298723530327","target":"0.46183791393277907","targetHandle":"frag","id":"xy-edge__0.13214298723530327-0.46183791393277907frag","selected":false},{"source":"0.5773928601448672","target":"0.46183791393277907","targetHandle":"vert","id":"xy-edge__0.5773928601448672-0.46183791393277907vert","selected":false},{"source":"0.6592953329742872","sourceHandle":"__output","target":"0.46183791393277907","targetHandle":"geometry","id":"xy-edge__0.6592953329742872__output-0.46183791393277907geometry","selected":false},{"source":"0.5113171012819773","target":"0.13214298723530327","targetHandle":"time","id":"xy-edge__0.5113171012819773-0.13214298723530327time"}]}}`
  )
);
_projects.push(
  deserialize(
    `{"name":"Shapes","goals":[{"name":"Diffuse lighting","done":false},{"name":"Specular highlights","done":false},{"name":"Normal mapping","done":false},{"name":"Fog","done":false},{"name":"Shadows","done":false},{"name":"Bloom","done":false}],"shaders":[{"filename":"main.frag","contents":"#ifdef GL_ES\\nprecision highp float;\\n#endif\\n\\nvarying vec3 vNormal;\\nvarying vec2 vUv;\\n\\nvoid main() {\\n    vec2 clampedUv = clamp(vUv, 0., 1.);\\n    gl_FragColor = vec4(clampedUv, 1., 1.);\\n}"},{"filename":"main.vert","contents":"attribute vec3 position;\\nattribute vec3 normal;\\nattribute vec2 uv;\\nuniform mat4 model;\\nuniform mat4 view;\\nuniform mat4 projection;\\nvarying vec3 vNormal;\\nvarying vec2 vUv;\\n\\nvoid main() {\\n    vUv = uv;\\n    vNormal = (model * vec4(normal, 0.)).xyz;\\n    gl_Position = projection * view * model * vec4(position, 1.);\\n}"}],"pipelineGraph":{"nodes": [], "edges": []}}`
  )
);
_projects.push(
  deserialize(
    `{"name":"Full Scene","goals":[{"name":"Swaying grass","done":false},{"name":"Wavy water","done":false},{"name":"Water reflections","done":false},{"name":"Post-processing effects","done":false}],"shaders":[], "pipelineGraph": {"nodes": [], "edges": []}}`
  )
);
_projects.push({
  name: "Diffuse",
  goals: [],
  shaderFiles: [],
  pipelineGraph: {
    nodes: writable([]),
    edges: writable([]),
  },
  macros: [],
});

// if (!URL_PARAMETERS.isEmbedded) {
//   for (let i = 0; i < _projects.length; i++) {
//     const stored = localStorage.getItem(_projects[i].name);
//     if (stored !== null) {
//       _projects[i] = deserialize(stored);
//     }
//   }
// }

for (let project of _projects) {
  if (project.selectedShaderFile === undefined)
    project.selectedShaderFile = writable(project.shaderFiles[0]?.filename ?? "");
}

export const projects = writable<Project[]>(_projects);

export interface Project {
  name: string;
  goals: Goal[];
  shaderFiles: Shader[];
  selectedShaderFile?: Writable<string>;
  pipelineGraph: PipelineGraph;
  macros: Macro[];
}

export interface Goal {
  name: string;
  done: boolean;
}

export interface PipelineGraph {
  nodes: Writable<SvelteFlowNode[]>;
  edges: Writable<SvelteFlowEdge[]>;
}

export function serialize(project: Project): string {
  const serialized: SerializedProject = {
    name: project.name,
    goals: [...project.goals],
    shaders: project.shaderFiles.map((s) => s.serialize()),
    pipelineGraph: serializePipelineGraph(project.pipelineGraph),
    macros: project.macros.map(m => serializeMacro(m)),
  };

  return JSON.stringify(serialized);
}

export function deserialize(json: string): Project {
  let serialized = JSON.parse(json) as SerializedProject;

  return {
    name: serialized.name,
    goals: serialized.goals,
    shaderFiles: serialized.shaders.map((s) => deserializeShader(s)),
    pipelineGraph: deserializePipelineGraph(serialized.pipelineGraph),
    macros: (serialized.macros ?? []).map(m => deserializeMacro(m)),
  };
}

interface SerializedProject {
  name: string;
  shaders: SerializedShader[];
  goals: Goal[];
  pipelineGraph: SerializedPipelineGraph;
  macros: SerializedMacro[];
}

interface SerializedMacro {
  name: string;
  inputLabels: string[];
  graph: SerializedPipelineGraph;
}

interface SerializedPipelineGraph {
  nodes: SvelteFlowNode[];
  edges: SvelteFlowEdge[];
}

function serializePipelineGraph(graph: PipelineGraph): SerializedPipelineGraph {
  // Evil value stealing
  let nodes: SvelteFlowNode[] | undefined, edges: SvelteFlowEdge[] | undefined;
  graph.nodes.update((n) => {
    nodes = [...n];
    return n;
  });
  graph.edges.update((e) => {
    edges = [...e];
    return e;
  });

  if (nodes === undefined || edges === undefined)
    throw new Error("Error in graph data");

  return {
    nodes: nodes,
    edges: edges,
  };
}

function deserializePipelineGraph(
  serialized: SerializedPipelineGraph
): PipelineGraph {
  let nodes = writable(serialized.nodes);
  let edges = writable(serialized.edges);

  return { nodes, edges };
}

function serializeMacro(macro: Macro): SerializedMacro {
  // Evil value stealing
  let nodes: SvelteFlowNode[] | undefined, edges: SvelteFlowEdge[] | undefined, inputLabels: string[] | undefined;
  macro.nodes.update((n) => {
    nodes = [...n];
    return n;
  });
  macro.edges.update((e) => {
    edges = [...e];
    return e;
  });
  macro.inputLabels.update((l) => {
    inputLabels = [...l];
    return l;
  });

  if (nodes === undefined || edges === undefined || inputLabels === undefined)
    throw new Error("Error in macro data");

  return {
    name: macro.name,
    inputLabels,
    graph: {
      nodes: nodes,
      edges: edges,
    },
  };
}

function deserializeMacro(serialized: SerializedMacro): Macro {
  let inputLabels = writable(serialized.inputLabels);
  let nodes = writable(serialized.graph.nodes.map(n => {
    if (n.type === "inputs") {
      n.data.inputLabels = inputLabels;
    }
    return n;
  }));
  let edges = writable(serialized.graph.edges);


  return {
    name: serialized.name,
    nodes,
    edges,
    inputLabels,
  };
}

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binaryString = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }

  return btoa(binaryString);
}

function base64ToUint8Array(base64String: string): Uint8Array {
  const binaryString = atob(base64String);

  const len = binaryString.length;
  const uint8Array = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }

  return uint8Array;
}

export function toUrl(project: Project): string {
  const data = serialize(project);
  const compressesed = pako.deflate(data);
  const b64 = uint8ArrayToBase64(compressesed);
  const url = encodeURIComponent(b64);
  return url;
}

export function fromUrl(url: string): Project {
  console.log(url);
  const b64 = decodeURIComponent(url);
  const compressed = base64ToUint8Array(b64);
  const data = pako.inflate(compressed, { to: "string" });

  return deserialize(data);
}
