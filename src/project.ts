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
    `{"name":"Simple Frag","goals":[{"name":"Modify colours","done":false},{"name":"Swizzle a vector","done":false},{"name":"Use UV coords","done":false},{"name":"Use uniforms","done":false},{"name":"Sample from a texture","done":false}],"shaders":[{"filename":"main.frag","contents":"#version 100\\n\\n#ifdef GL_ES\\nprecision highp float;\\n#endif\\n\\nuniform float time;\\n\\nvarying vec2 uvCoords;\\n\\nvoid main(void) {\\n    gl_FragColor = vec4(uvCoords.x + sin(time), cos(uvCoords.y + time), 1., 1.) / 2.0;\\n}\\n"},{"filename":"main.vert","contents":"#version 100\\n\\nattribute vec4 position;\\n\\nvarying vec2 uvCoords;\\n\\nvoid main(void) {\\n    uvCoords = (position.xy + 1.0)/2.0;\\n    gl_Position = position;\\n}\\n"}],"pipelineGraph":{"nodes":[{"id":"0.28380237440581335","type":"shader","position":{"x":11,"y":75},"data":{"label":"shader node","shaderId":0},"origin":[0.5,0],"measured":{"width":222,"height":68},"selected":false,"dragging":false},{"id":"0.6069962777324323","type":"geometry","position":{"x":31,"y":175},"data":{"label":"geometry node","type":"Screen Quad"},"origin":[0.5,0],"measured":{"width":162,"height":40},"selected":false,"dragging":false},{"id":"0.32649749533152894","type":"gl-program","position":{"x":261,"y":25},"data":{"label":"gl-program node"},"origin":[0.5,0],"measured":{"width":122,"height":80},"selected":false,"dragging":false},{"id":"0.7483957287047194","type":"shader","position":{"x":11,"y":0},"data":{"label":"shader node","shaderId":1},"origin":[0.5,0],"measured":{"width":222,"height":52},"selected":false,"dragging":false},{"id":"0.5749796561628719","type":"window","position":{"x":400,"y":50},"data":{"label":"window node"},"origin":[0.5,0],"measured":{"width":87,"height":38}},{"id":"0.1982647322118778","type":"uniform","position":{"x":-200,"y":100},"data":{"label":"uniform node","type":"time"},"origin":[0.5,0],"measured":{"width":162,"height":40}}],"edges":[{"source":"0.6069962777324323","target":"0.32649749533152894","targetHandle":"geometry","id":"xy-edge__0.6069962777324323-0.32649749533152894geometry","selected":false},{"source":"0.28380237440581335","target":"0.32649749533152894","targetHandle":"frag","id":"xy-edge__0.28380237440581335-0.32649749533152894frag","selected":false},{"source":"0.7483957287047194","target":"0.32649749533152894","targetHandle":"vert","id":"xy-edge__0.7483957287047194-0.32649749533152894vert","selected":false},{"source":"0.32649749533152894","target":"0.5749796561628719","targetHandle":"in","id":"xy-edge__0.32649749533152894-0.5749796561628719in"},{"source":"0.1982647322118778","target":"0.28380237440581335","targetHandle":"time","id":"xy-edge__0.1982647322118778-0.28380237440581335time"}]}}`
  )
);
_projects.push(
  deserialize(
    `{"name":"Shapes","goals":[{"name":"Diffuse lighting","done":false},{"name":"Specular highlights","done":false},{"name":"Normal mapping","done":false},{"name":"Fog","done":false},{"name":"Shadows","done":false},{"name":"Bloom","done":false}],"shaders":[{"filename":"main.frag","contents":"#ifdef GL_ES\\nprecision highp float;\\n#endif\\n\\nvarying vec3 vNormal;\\nvarying vec2 vUv;\\n\\nvoid main() {\\n    vec2 clampedUv = clamp(vUv, 0., 1.);\\n    gl_FragColor = vec4(clampedUv, 1., 1.);\\n}"},{"filename":"main.vert","contents":"attribute vec3 position;\\nattribute vec3 normal;\\nattribute vec2 uv;\\nuniform mat4 model;\\nuniform mat4 view;\\nuniform mat4 projection;\\nvarying vec3 vNormal;\\nvarying vec2 vUv;\\n\\nvoid main() {\\n    vUv = uv;\\n    vNormal = (model * vec4(normal, 0.)).xyz;\\n    gl_Position = projection * view * model * vec4(position, 1.);\\n}"}],"pipelineGraph":{"nodes":[{"id":"0.8398805551003263","type":"shader","position":{"x":36,"y":-25},"data":{"label":"shader node","shaderId":2},"origin":[0.5,0],"measured":{"width":222,"height":52},"selected":false,"dragging":false},{"id":"0.16173032208604377","type":"shader","position":{"x":61,"y":-150},"data":{"label":"shader node","shaderId":3},"origin":[0.5,0],"measured":{"width":222,"height":101},"selected":false,"dragging":false},{"id":"0.31520863567991997","type":"gl-program","position":{"x":261,"y":-50},"data":{"label":"gl-program node"},"origin":[0.5,0],"measured":{"width":122,"height":80},"selected":false,"dragging":false},{"id":"0.7860122550892916","type":"geometry","position":{"x":56,"y":50},"data":{"label":"geometry node","type":"Model","modelSrc":"cube.obj"},"origin":[0.5,0],"measured":{"width":162,"height":77},"selected":false,"dragging":false},{"id":"0.8661473114953129","type":"window","position":{"x":393.5,"y":-50},"data":{"label":"window node"},"origin":[0.5,0],"measured":{"width":87,"height":38},"selected":false,"dragging":false},{"id":"0.7079005235784883","type":"uniform","position":{"x":-219,"y":-225},"data":{"label":"uniform node","type":"view","x":5,"y":3,"z":5,"targetX":0,"targetY":0,"targetZ":0,"upX":0,"upY":1,"upZ":0},"origin":[0.5,0],"measured":{"width":162,"height":222},"selected":true,"dragging":false},{"id":"0.5621413967099553","type":"uniform","position":{"x":-244,"y":25},"data":{"label":"uniform node","type":"projection","fov":45,"near":0.1,"far":100},"origin":[0.5,0],"measured":{"width":162,"height":101},"selected":false,"dragging":false}],"edges":[{"source":"0.16173032208604377","target":"0.31520863567991997","targetHandle":"vert","id":"xy-edge__0.16173032208604377-0.31520863567991997vert","selected":false},{"source":"0.8398805551003263","target":"0.31520863567991997","targetHandle":"frag","id":"xy-edge__0.8398805551003263-0.31520863567991997frag","selected":false},{"source":"0.7860122550892916","target":"0.31520863567991997","targetHandle":"geometry","id":"xy-edge__0.7860122550892916-0.31520863567991997geometry","selected":false},{"source":"0.31520863567991997","target":"0.8661473114953129","targetHandle":"in","id":"xy-edge__0.31520863567991997-0.8661473114953129in","selected":false},{"source":"0.7079005235784883","target":"0.16173032208604377","targetHandle":"view","id":"xy-edge__0.7079005235784883-0.16173032208604377view","selected":false},{"source":"0.5621413967099553","target":"0.16173032208604377","targetHandle":"projection","id":"xy-edge__0.5621413967099553-0.16173032208604377projection","selected":false}]}}`
  )
);
_projects.push(
  deserialize(
    `{"name":"Full Scene","goals":[{"name":"Swaying grass","done":false},{"name":"Wavy water","done":false},{"name":"Water reflections","done":false},{"name":"Post-processing effects","done":false}],"shaders":[], "pipelineGraph": {"nodes": [], "edges": []}}`
  )
);
_projects.push(
  deserialize(`{"name":"framebuf test","goals":[{"name":"Modify colours","done":false},{"name":"Swizzle a vector","done":false},{"name":"Use UV coords","done":false},{"name":"Use uniforms","done":false},{"name":"Sample from a texture","done":false}],"shaders":[{"filename":"main.frag","contents":"#version 100\\n\\n#ifdef GL_ES\\nprecision highp float;\\n#endif\\n\\nuniform float time;\\n\\nvarying vec2 uvCoords;\\n\\n// The texture.\\nuniform sampler2D u_texture;\\n \\nvoid main() {\\n   gl_FragColor = texture2D(u_texture, uvCoords);\\n}"},{"filename":"main.vert","contents":"#version 100\\n\\nattribute vec4 position;\\n\\nvarying vec2 uvCoords;\\n\\nvoid main(void) {\\n    uvCoords = position.xy;\\n\\n    gl_Position = position;\\n}\\n"},{"filename":"other.frag","contents":"#version 100\\n\\n#ifdef GL_ES\\nprecision highp float;\\n#endif\\n\\nuniform float time;\\n\\nvarying vec2 uvCoords;\\n\\n// The texture.\\nuniform sampler2D u_texture;\\n \\nvoid main() {\\n   gl_FragColor = texture2D(u_texture, uvCoords);\\n}"}],"pipelineGraph":{"nodes":[{"id":"0.28380237440581335","type":"shader","position":{"x":11,"y":75},"data":{"label":"shader node","shaderId":0},"origin":[0.5,0],"measured":{"width":222,"height":84},"selected":false,"dragging":false},{"id":"0.6069962777324323","type":"geometry","position":{"x":31,"y":225},"data":{"label":"geometry node","type":"Screen Quad"},"origin":[0.5,0],"measured":{"width":162,"height":40},"selected":false,"dragging":false},{"id":"0.32649749533152894","type":"gl-program","position":{"x":236,"y":50},"data":{"label":"gl-program node"},"origin":[0.5,0],"measured":{"width":122,"height":80},"selected":false,"dragging":false},{"id":"0.7483957287047194","type":"shader","position":{"x":11,"y":0},"data":{"label":"shader node","shaderId":1},"origin":[0.5,0],"measured":{"width":222,"height":52},"selected":false,"dragging":false},{"id":"0.1982647322118778","type":"uniform","position":{"x":-244,"y":50},"data":{"label":"uniform node","type":"Time"},"origin":[0.5,0],"measured":{"width":162,"height":40},"selected":false,"dragging":false},{"id":"0.10974112207964315","type":"uniform","position":{"x":-219,"y":125},"data":{"label":"uniform node","type":"texture","textureSrc":"stones.png"},"origin":[0.5,0],"measured":{"width":162,"height":164},"selected":false,"dragging":false},{"id":"0.242991718643367","type":"gl-program","position":{"x":886,"y":75},"data":{"label":"gl-program node"},"origin":[0.5,0],"measured":{"width":122,"height":80},"selected":false,"dragging":false},{"id":"0.7529181105135678","type":"shader","position":{"x":611,"y":-75},"data":{"label":"shader node","shaderId":0},"origin":[0.5,0],"measured":{"width":222,"height":84},"selected":false,"dragging":false},{"id":"0.8254230235563282","type":"framebuffer","position":{"x":398.5,"y":25},"data":{"label":"framebuffer node"},"origin":[0.5,0],"measured":{"width":97,"height":38},"selected":true,"dragging":false},{"id":"0.9675358404669339","type":"window","position":{"x":1043.5,"y":100},"data":{"label":"window node"},"origin":[0.5,0],"measured":{"width":87,"height":38},"selected":false,"dragging":false}],"edges":[{"source":"0.6069962777324323","target":"0.32649749533152894","targetHandle":"geometry","id":"xy-edge__0.6069962777324323-0.32649749533152894geometry","selected":false},{"source":"0.28380237440581335","target":"0.32649749533152894","targetHandle":"frag","id":"xy-edge__0.28380237440581335-0.32649749533152894frag","selected":false},{"source":"0.7483957287047194","target":"0.32649749533152894","targetHandle":"vert","id":"xy-edge__0.7483957287047194-0.32649749533152894vert","selected":false},{"source":"0.1982647322118778","target":"0.28380237440581335","targetHandle":"time","id":"xy-edge__0.1982647322118778-0.28380237440581335time","selected":false},{"source":"0.10974112207964315","target":"0.28380237440581335","targetHandle":"u_texture","id":"xy-edge__0.10974112207964315-0.28380237440581335u_texture","selected":false},{"source":"0.7529181105135678","target":"0.242991718643367","targetHandle":"frag","id":"xy-edge__0.7529181105135678-0.242991718643367frag","selected":false},{"source":"0.7483957287047194","target":"0.242991718643367","targetHandle":"vert","id":"xy-edge__0.7483957287047194-0.242991718643367vert","selected":false},{"source":"0.6069962777324323","target":"0.242991718643367","targetHandle":"geometry","id":"xy-edge__0.6069962777324323-0.242991718643367geometry","selected":false},{"source":"0.32649749533152894","target":"0.8254230235563282","targetHandle":"in","id":"xy-edge__0.32649749533152894-0.8254230235563282in","selected":false},{"source":"0.8254230235563282","sourceHandle":"out","target":"0.7529181105135678","targetHandle":"u_texture","id":"xy-edge__0.8254230235563282out-0.7529181105135678u_texture","selected":false},{"source":"0.242991718643367","target":"0.9675358404669339","targetHandle":"in","id":"xy-edge__0.242991718643367-0.9675358404669339in","selected":false}]}}`)
);
_projects.push(deserialize(`{"name":"Situation","goals":[{"name":"Diffuse lighting","done":false},{"name":"Specular highlights","done":false},{"name":"Normal mapping","done":false},{"name":"Fog","done":false},{"name":"Shadows","done":false},{"name":"Bloom","done":false}],"shaders":[{"filename":"main.frag","contents":"#ifdef GL_ES\\nprecision highp float;\\n#endif\\n\\nvarying vec3 vNormal;\\nvarying vec2 vUv;\\n\\nuniform float time;\\n\\nvoid main() {\\n    vec3 lightDirection = vec3(cos(time), -0.4, sin(time));\\n    float ambientLight = 0.1;\\n    vec3 brown = vec3(.54, .27, .07);\\n    float lightness = -clamp(dot(normalize(vNormal), normalize(lightDirection)), -1., 0.);\\n    lightness = ambientLight + (1. - ambientLight) * lightness;\\n    float spec = pow(lightness, 50.);\\n    gl_FragColor = vec4(brown * lightness + spec, 1.);\\n}"},{"filename":"main.vert","contents":"attribute vec3 position;\\nattribute vec3 normal;\\nattribute vec2 uv;\\nuniform mat4 model;\\nuniform mat4 view;\\nuniform mat4 projection;\\nvarying vec3 vNormal;\\nvarying vec2 vUv;\\n\\nvoid main() {\\n    vUv = uv;\\n    vNormal = (model * vec4(normal, 0.)).xyz;\\n    gl_Position = projection * view * model * vec4(position, 1.);\\n}"}],"pipelineGraph":{"nodes":[{"id":"0.8398805551003263","type":"shader","position":{"x":-389,"y":125},"data":{"label":"shader node","shaderId":2},"origin":[0.5,0],"measured":{"width":222,"height":68},"selected":false,"dragging":false},{"id":"0.16173032208604377","type":"shader","position":{"x":61,"y":-150},"data":{"label":"shader node","shaderId":3},"origin":[0.5,0],"measured":{"width":222,"height":101},"selected":false,"dragging":false},{"id":"0.31520863567991997","type":"gl-program","position":{"x":261,"y":-50},"data":{"label":"gl-program node"},"origin":[0.5,0],"measured":{"width":122,"height":80},"selected":false,"dragging":false},{"id":"0.8661473114953129","type":"window","position":{"x":393.5,"y":-50},"data":{"label":"window node"},"origin":[0.5,0],"measured":{"width":87,"height":38},"selected":false,"dragging":false},{"id":"0.7079005235784883","type":"uniform","position":{"x":-219,"y":-250},"data":{"label":"uniform node","type":"view","x":5,"y":3,"z":5,"targetX":0,"targetY":0,"targetZ":0,"upX":0,"upY":1,"upZ":0},"origin":[0.5,0],"measured":{"width":162,"height":222},"selected":false,"dragging":false},{"id":"0.5621413967099553","type":"uniform","position":{"x":-219,"y":0},"data":{"label":"uniform node","type":"projection","fov":45,"near":0.1,"far":100},"origin":[0.5,0],"measured":{"width":162,"height":101},"selected":false,"dragging":false},{"id":"0.6581115910459696","type":"geometry","position":{"x":31,"y":100},"data":{"label":"geometry node","type":"Model","uniformOverrides":["model"],"modelSrc":"sphere.obj"},"origin":[0.5,0],"measured":{"width":162,"height":147},"selected":false,"dragging":false},{"id":"0.532574107694253","type":"uniform","position":{"x":-169,"y":175},"data":{"label":"uniform node","type":"translation","x":0,"z":-3},"origin":[0.5,0],"measured":{"width":162,"height":101},"selected":false,"dragging":false},{"id":"0.7446113371735203","type":"geometry","position":{"x":-44,"y":300},"data":{"label":"geometry node","type":"Model","uniformOverrides":["model"],"modelSrc":"monkey.obj"},"origin":[0.5,0],"measured":{"width":162,"height":147},"selected":false,"dragging":false},{"id":"0.6104713280508203","type":"uniform","position":{"x":-269,"y":300},"data":{"label":"uniform node","type":"translation"},"origin":[0.5,0],"measured":{"width":162,"height":101},"selected":false,"dragging":false},{"id":"0.6869172561404668","type":"uniform","position":{"x":-644,"y":150},"data":{"label":"uniform node","type":"time"},"origin":[0.5,0],"measured":{"width":162,"height":40},"selected":false,"dragging":false},{"id":"0.15917140501318938","type":"geometry","position":{"x":-44,"y":475},"data":{"label":"geometry node","type":"Model","uniformOverrides":["model"],"modelSrc":"cube.obj"},"origin":[0.5,0],"measured":{"width":162,"height":147},"selected":false,"dragging":false},{"id":"0.6493829668983515","type":"uniform","position":{"x":-244,"y":475},"data":{"label":"uniform node","type":"translation","z":0,"x":-2,"y":-0.4},"origin":[0.5,0],"measured":{"width":162,"height":101},"selected":true,"dragging":false}],"edges":[{"source":"0.16173032208604377","target":"0.31520863567991997","targetHandle":"vert","id":"xy-edge__0.16173032208604377-0.31520863567991997vert","selected":false},{"source":"0.8398805551003263","target":"0.31520863567991997","targetHandle":"frag","id":"xy-edge__0.8398805551003263-0.31520863567991997frag","selected":false},{"source":"0.31520863567991997","target":"0.8661473114953129","targetHandle":"in","id":"xy-edge__0.31520863567991997-0.8661473114953129in","selected":false},{"source":"0.7079005235784883","target":"0.16173032208604377","targetHandle":"view","id":"xy-edge__0.7079005235784883-0.16173032208604377view","selected":false},{"source":"0.5621413967099553","target":"0.16173032208604377","targetHandle":"projection","id":"xy-edge__0.5621413967099553-0.16173032208604377projection","selected":false},{"source":"0.6581115910459696","sourceHandle":"__output","target":"0.31520863567991997","targetHandle":"geometry","id":"xy-edge__0.6581115910459696__output-0.31520863567991997geometry","selected":false},{"source":"0.532574107694253","target":"0.6581115910459696","targetHandle":"model","id":"xy-edge__0.532574107694253-0.6581115910459696model","selected":false},{"source":"0.532574107694253","target":"0.6581115910459696","id":"xy-edge__0.532574107694253-0.6581115910459696","selected":false},{"source":"0.7446113371735203","sourceHandle":"__output","target":"0.31520863567991997","targetHandle":"geometry","id":"xy-edge__0.7446113371735203__output-0.31520863567991997geometry","selected":false},{"source":"0.6104713280508203","target":"0.7446113371735203","targetHandle":"model","id":"xy-edge__0.6104713280508203-0.7446113371735203model","selected":false},{"source":"0.6104713280508203","target":"0.7446113371735203","id":"xy-edge__0.6104713280508203-0.7446113371735203","selected":false},{"source":"0.6869172561404668","target":"0.8398805551003263","targetHandle":"time","id":"xy-edge__0.6869172561404668-0.8398805551003263time","selected":false},{"source":"0.15917140501318938","sourceHandle":"__output","target":"0.31520863567991997","targetHandle":"geometry","id":"xy-edge__0.15917140501318938__output-0.31520863567991997geometry","selected":false},{"source":"0.6493829668983515","target":"0.15917140501318938","targetHandle":"model","id":"xy-edge__0.6493829668983515-0.15917140501318938model","selected":false},{"source":"0.6493829668983515","target":"0.15917140501318938","id":"xy-edge__0.6493829668983515-0.15917140501318938","selected":false}]}}`));

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
