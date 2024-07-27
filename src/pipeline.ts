import type { Edge, Node } from "@xyflow/svelte";
import {
  FullscreenQuad,
  GLProgram,
  Mesh,
  RenderStep,
  UniformTimeSetter,
  type UniformSetter,
} from "./gl";
import type { Project } from "./project";
import { Shader } from "./shader";
import { loadOBJ } from "./obj";

export class PipeLine {
  private steps: RenderStep[] = [];

  /**
   * @throws {string[]} An array of errors in the shaders and render pipeline
   */
  public constructor(project: Project, gl: WebGLRenderingContext) {
    let errors: string[] = [];

    try {
      // Evil value stealing
      let nodes: Node[] | undefined, edges: Edge[] | undefined;
      project.pipelineGraph.nodes.update((n) => {
        nodes = [...n];
        return n;
      });
      project.pipelineGraph.edges.update((e) => {
        edges = [...e];
        return e;
      });

      if (nodes === undefined || edges === undefined)
        throw ["Error in graph data"];

      console.log(nodes, edges);

      const steps = nodes
        .filter((n) => n.type === "gl-program")
        .map((n) =>
          createRenderStep(n, nodes!, edges!, project.shaderFiles, gl)
        );

      // Sort
      Promise.all(steps).then((steps) => {
        this.steps = steps;
      });
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

function handleShader(
  shader: Node,
  ns: Node[],
  es: Edge[]
): {
  uniformSetters: UniformSetter[];
  dependencies: string[];
} {
  let dependencies: string[] = [];

  let uniformSetters = es
    .filter((e) => e.target === shader.id)
    .map((e) => {
      let uniformName = e.targetHandle!;
      let uniformNode = ns.find((n) => n.id === e.source)!;

      switch (uniformNode.data.type) {
        case "Time":
          return new UniformTimeSetter(uniformName);
          break;
        default:
          throw new Error("Unsupported uniform type");
      }
    });

  return {
    uniformSetters,
    dependencies,
  };
}

async function createRenderStep(
  programNode: Node,
  ns: Node[],
  es: Edge[],
  shaders: Shader[],
  gl: WebGLRenderingContext
): Promise<RenderStep> {
  const id = programNode.id;
  const targetedBy = es.filter((e) => e.target === id);
  const sourcedBy = es.filter((e) => e.source === id);

  if (sourcedBy.length !== 1) {
    throw new Error("Program needs 1 output");
  }

  const outputNode = ns.find((n) => n.id === sourcedBy[0].target);
  if (outputNode === undefined) {
    throw new Error("No valid output for GL program");
  }

  let output: WebGLFramebuffer | null;

  if (outputNode.type === "window") {
    output = null;
  } else {
    throw new Error("Invalid output.");
  }

  const vert = ns.find(
    (ns) => ns.id === targetedBy.find((e) => e.targetHandle === "vert")?.source
  );
  const frag = ns.find(
    (ns) => ns.id === targetedBy.find((e) => e.targetHandle === "frag")?.source
  );
  const geometry = ns.find(
    (ns) =>
      ns.id === targetedBy.find((e) => e.targetHandle === "geometry")?.source
  );

  if (frag === undefined || vert === undefined || geometry === undefined) {
    throw new Error("GL Program did not have all of the necessary inputs.");
  }

  let { dependencies, uniformSetters } = handleShader(vert, ns, es);
  let frag_ = handleShader(frag, ns, es);
  dependencies.push(...frag_.dependencies);
  uniformSetters.push(...frag_.uniformSetters);

  const vs = shaders.find((s) => s.uid === vert.data.shaderId)!;
  const fs = shaders.find((s) => s.uid === frag.data.shaderId)!;

  let geo;

  console.log(geometry.data.type);

  switch (geometry.data.type) {
    case "Screen Quad":
      geo = [new FullscreenQuad(gl)];
      break;
    case "Model":
      let model = await loadOBJ(geometry.data.modelSrc as string);
      geo = [new Mesh(gl, model)];
      break;
    default:
      throw new Error("Unsupported geometry type.");
  }

  let program = new GLProgram(gl, [vs, fs]);

  return new RenderStep(program, output, geo, uniformSetters);
}
