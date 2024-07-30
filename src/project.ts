import { writable, type Writable } from "svelte/store";
import { deserializeShader, Shader, type SerializedShader } from "./gl/shader";
import type {
  Node,
  Edge as SvelteFlowEdge,
  Node as SvelteFlowNode,
} from "@xyflow/svelte";

const _projects: Project[] = [];
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


for (let i = 0; i < _projects.length; i++) {
  const stored = localStorage.getItem(_projects[i].name);
  if (stored !== null) {
    _projects[i] = deserialize(stored);
  }
}

// _projects.push(
//   deserialize(
//     `{"name":"Simple Frag","goals":[{"name":"Modify colours","done":false},{"name":"Swizzle a vector","done":false},{"name":"Use UV coords","done":false},{"name":"Use uniforms","done":false},{"name":"Sample from a texture","done":false}],"shaders":[{"filename":"main.frag","contents":"#version 100\\n\\n#ifdef GL_ES\\nprecision highp float;\\n#endif\\n\\nuniform float time;\\n\\nvarying vec2 uvCoords;\\n\\nvoid main(void) {\\n    gl_FragColor = vec4(uvCoords.x + sin(time), cos(uvCoords.y + time), 1., 1.) / 2.0;\\n}\\n"},{"filename":"main.vert","contents":"#version 100\\n\\nattribute vec4 position;\\n\\nvarying vec2 uvCoords;\\n\\nvoid main(void) {\\n    uvCoords = (position.xy + 1.0)/2.0;\\n    gl_Position = position;\\n}\\n"}],"pipelineGraph":{"nodes": [], "edges": []}}`
//   )
// );
// _projects.push(
//   deserialize(
//     `{"name":"Shapes","goals":[{"name":"Diffuse lighting","done":false},{"name":"Specular highlights","done":false},{"name":"Normal mapping","done":false},{"name":"Fog","done":false},{"name":"Shadows","done":false},{"name":"Bloom","done":false}],"shaders":[{"filename":"main.frag","contents":"#ifdef GL_ES\\nprecision highp float;\\n#endif\\n\\nvarying vec3 vNormal;\\nvarying vec2 vUv;\\n\\nvoid main() {\\n    vec2 clampedUv = clamp(vUv, 0., 1.);\\n    gl_FragColor = vec4(clampedUv, 1., 1.);\\n}"},{"filename":"main.vert","contents":"attribute vec3 position;\\nattribute vec3 normal;\\nattribute vec2 uv;\\nuniform mat4 model;\\nuniform mat4 view;\\nuniform mat4 projection;\\nvarying vec3 vNormal;\\nvarying vec2 vUv;\\n\\nvoid main() {\\n    vUv = uv;\\n    vNormal = (model * vec4(normal, 0.)).xyz;\\n    gl_Position = projection * view * model * vec4(position, 1.);\\n}"}],"pipelineGraph":{"nodes": [], "edges": []}}`
//   )
// );
// _projects.push(
//   deserialize(
//     `{"name":"Full Scene","goals":[{"name":"Swaying grass","done":false},{"name":"Wavy water","done":false},{"name":"Water reflections","done":false},{"name":"Post-processing effects","done":false}],"shaders":[], "pipelineGraph": {"nodes": [], "edges": []}}`
//   )
// );

for (let project of _projects) {
  project.selectedShaderFile = writable(project.shaderFiles[0]?.filename ?? "");
}

export const projects = writable<Project[]>(_projects);

// The UID of the selected project
export const selectedProject = writable<string>("Simple Frag");

export interface Project {
  name: string;
  goals: Goal[];
  shaderFiles: Shader[];
  selectedShaderFile?: Writable<string>;
  pipelineGraph: PipelineGraph;
}

export interface Goal {
  name: string;
  done: boolean;
}

export interface PipelineGraph {
  nodes: Writable<SvelteFlowNode[]>;
  edges: Writable<SvelteFlowEdge[]>;
}

function newPipelineGraph(): PipelineGraph {
  return {
    nodes: writable([]),
    edges: writable([]),
  };
}

export function serialize(project: Project): string {
  const serialized: SerializedProject = {
    name: project.name,
    goals: [...project.goals],
    shaders: project.shaderFiles.map((s) => s.serialize()),
    pipelineGraph: serializePipelineGraph(project.pipelineGraph),
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
  };
}

interface SerializedProject {
  name: string;
  shaders: SerializedShader[];
  goals: Goal[];
  pipelineGraph: SerializedPipelineGraph;
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
