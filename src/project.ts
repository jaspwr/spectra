import { writable, type Writable } from "svelte/store";
import { deserializeShader, Shader, type SerializedShader } from "./shader";
import type {
  Node,
  Edge as SvelteFlowEdge,
  Node as SvelteFlowNode,
} from "@xyflow/svelte";

const _projects: Project[] = [];
_projects.push(
  deserialize(
    `{"name":"Simple Frag","goals":[{"name":"Modify colours","done":false},{"name":"Swizzle a vector","done":false},{"name":"Use UV coords","done":false},{"name":"Use uniforms","done":false},{"name":"Sample from a texture","done":false}],"shaders":[{"filename":"main.frag","contents":"#version 100\\n\\n#ifdef GL_ES\\nprecision highp float;\\n#endif\\n\\nuniform float time;\\n\\nvoid main(void) {\\n    gl_FragColor = vec4(sin(time * 0.9) + 1.0, cos(time * 1.5) + 1.0, sin(time) + 1.0, 2.0) / 2.0;\\n}\\n"},{"filename":"main.vert","contents":"#version 100\\n\\nattribute vec4 aVertexPosition;\\nvoid main(void) {\\n    gl_Position = aVertexPosition;\\n}\\n"}],"pipelineGraph":{"nodes":[{"id":"0.28380237440581335","type":"shader","position":{"x":11,"y":75},"data":{"label":"shader node","shaderId":0},"origin":[0.5,0],"measured":{"width":222,"height":68},"selected":false,"dragging":false},{"id":"0.6069962777324323","type":"geometry","position":{"x":31,"y":175},"data":{"label":"geometry node","type":"Screen Quad"},"origin":[0.5,0],"measured":{"width":162,"height":40},"selected":false,"dragging":false},{"id":"0.32649749533152894","type":"gl-program","position":{"x":261,"y":25},"data":{"label":"gl-program node"},"origin":[0.5,0],"measured":{"width":122,"height":80},"selected":false,"dragging":false},{"id":"0.7483957287047194","type":"shader","position":{"x":11,"y":0},"data":{"label":"shader node","shaderId":1},"origin":[0.5,0],"measured":{"width":222,"height":52},"selected":true,"dragging":false},{"id":"0.5749796561628719","type":"window","position":{"x":400,"y":50},"data":{"label":"window node"},"origin":[0.5,0],"measured":{"width":87,"height":38}},{"id":"0.1982647322118778","type":"uniform","position":{"x":-200,"y":100},"data":{"label":"uniform node","type":"Time"},"origin":[0.5,0],"measured":{"width":162,"height":40}}],"edges":[{"source":"0.6069962777324323","target":"0.32649749533152894","targetHandle":"geometry","id":"xy-edge__0.6069962777324323-0.32649749533152894geometry","selected":false},{"source":"0.28380237440581335","target":"0.32649749533152894","targetHandle":"frag","id":"xy-edge__0.28380237440581335-0.32649749533152894frag","selected":false},{"source":"0.7483957287047194","target":"0.32649749533152894","targetHandle":"vert","id":"xy-edge__0.7483957287047194-0.32649749533152894vert","selected":false},{"source":"0.32649749533152894","target":"0.5749796561628719","targetHandle":"in","id":"xy-edge__0.32649749533152894-0.5749796561628719in"},{"source":"0.1982647322118778","target":"0.28380237440581335","targetHandle":"time","id":"xy-edge__0.1982647322118778-0.28380237440581335time"}]}}`
  )
);
_projects.push(
  deserialize(
    `{"name":"Shapes","goals":[{"name":"Diffuse lighting","done":false},{"name":"Specular highlights","done":false},{"name":"Normal mapping","done":false},{"name":"Fog","done":false},{"name":"Shadows","done":false},{"name":"Bloom","done":false}],"shaders":[], "pipelineGraph": {"nodes": [], "edges": []}}`
  )
);
_projects.push(
  deserialize(
    `{"name":"Full Scene","goals":[{"name":"Swaying grass","done":false},{"name":"Wavy water","done":false},{"name":"Water reflections","done":false},{"name":"Post-processing effects","done":false}],"shaders":[], "pipelineGraph": {"nodes": [], "edges": []}}`
  )
);

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
