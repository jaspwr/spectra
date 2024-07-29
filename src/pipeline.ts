import type { Edge, Node } from "@xyflow/svelte";
import {
  FrameBufferTexture,
  FullscreenQuad,
  GLProgram,
  loadImageTexture,
  Mesh,
  RenderStep,
  UniformFloatSetter,
  UniformProjectionSetter,
  UniformTextureSetter,
  UniformTimeSetter,
  UniformTranslationSetter,
  UniformViewSetter,
  type Geometry,
  type UniformSetter,
} from "./gl";
import type { Project } from "./project";
import { Shader } from "./shader";
import { loadOBJ } from "./obj";
import { GL_ERRORS, type Vec3 } from "./utils";
import { UniformNodeType } from "./lib/PipelineEditor/nodes/uniform";

export class PipeLine {
  private steps: RenderStep[] = [];

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

      const framebuffers = createFramebuffers(nodes, edges, gl);
      const textures = createTextures(nodes, edges, gl);

      const steps = nodes
        .filter((n) => n.type === "gl-program")
        .map((n) =>
          createRenderStep(n, nodes!, edges!, project.shaderFiles, textures, framebuffers, gl)
        );

      Promise.all(steps).then((steps) => {
        // Sort
        console.log(steps);

        this.steps = steps;
      }).catch((e) => {
        eprintln(e);
      });
    } catch (e: any) {
      eprintln(e);
    }
  }

  public render(gl: WebGLRenderingContext, deltaTime: number) {
    for (let step of this.steps) {
      step.render(gl, deltaTime);
    }
  }
}

function eprintln(e: any) {
  if (e instanceof Error) {
    GL_ERRORS.update((errs) => {
      errs.push(e.message);
      return errs;
    });
  } else if (typeof e === "string") {
    GL_ERRORS.update((errs) => {
      errs.push(e);
      return errs;
    });
  } else if (e.filename !== undefined) {
    GL_ERRORS.update((errs) => {
      errs.push(`[${e.filename}] ${e.message}`);
      return errs;
    });
  }
}

function handleShader(
  shader: Node,
  ns: Node[],
  es: Edge[],
  textures: Record<string, WebGLTexture>,
  framebuffers: Record<string, FrameBufferTexture>
): {
  uniformSetters: UniformSetter[];
  dependencies: string[];
} {
  let dependencies: string[] = [];
  let uniformSetters = getUniformSetters(shader, ns, es, textures, framebuffers);

  return {
    uniformSetters,
    dependencies,
  };
}

function getUniformSetters(
  self: Node,
  ns: Node[],
  es: Edge[],
  textures: Record<string, WebGLTexture>,
  framebuffers: Record<string, FrameBufferTexture>
): UniformSetter[] {
  let textureUnitCounter = 0;

  return es
    .filter((e) => e.target === self.id)
    .map((e) => {
      let uniformName = e.targetHandle!;
      let uniformNode = ns.find((n) => n.id === e.source)!;

      switch (uniformNode.type) {
        case "uniform":
          switch (uniformNode.data.type) {
            case UniformNodeType.Time:
              return new UniformTimeSetter(uniformName);
            case UniformNodeType.Tex:
              return new UniformTextureSetter(uniformName, textures[uniformNode.data.textureSrc as string], textureUnitCounter++);
            case UniformNodeType.Float:
              return new UniformFloatSetter(uniformName, (uniformNode.data.value ?? 0) as number);
            case UniformNodeType.ViewMatrix: {
              const data = uniformNode.data;
              return new UniformViewSetter(uniformName,
                [data.x, data.y, data.z,] as Vec3,
                [data.targetX, data.targetY, data.targetZ] as Vec3,
                [data.upX, data.upY, data.upZ] as Vec3);
            }
            case UniformNodeType.ProjectionMatrix:
              return new UniformProjectionSetter(uniformName,
                uniformNode.data.fov as number,
                uniformNode.data.far as number,
                uniformNode.data.near as number);
            case UniformNodeType.TranslationMatrix:
              return new UniformTranslationSetter(uniformName, [
                uniformNode.data.x ?? 0,
                uniformNode.data.y ?? 0,
                uniformNode.data.z ?? 0] as Vec3);
            default:
              throw new Error("Unsupported uniform type");
          }
        case "framebuffer":
          const framebuftex = framebuffers[uniformNode.id];
          if (framebuftex === undefined) {
            throw new Error("Invalid framebuffer.");
          }
          return new UniformTextureSetter(uniformName, framebuftex.texture, textureUnitCounter++);
        default:
          throw new Error("Unsupported uniform type");
      }
    });
}

function createFramebuffers(
  ns: Node[],
  es: Edge[],
  gl: WebGLRenderingContext
): Record<string, FrameBufferTexture> {
  return ns.filter((n) => n.type === "framebuffer")
    .map((n) => [n.id, new FrameBufferTexture(gl, 1000, 100, n.data.isDepthMap as boolean)] as [string, FrameBufferTexture])
    .reduce((acc, [id, fb]) => {
      acc[id] = fb;
      return acc;
    }, {} as Record<string, FrameBufferTexture>);
}

function createTextures(
  ns: Node[],
  es: Edge[],
  gl: WebGLRenderingContext
): Record<string, WebGLTexture> {
  return ns.filter((n) => n.type === "uniform" && n.data.type === "texture")
    .map((n) => [n.data.textureSrc, loadImageTexture(gl, n.data.textureSrc as string)] as [string, WebGLTexture])
    .reduce((acc, [id, tex]) => {
      acc[id] = tex;
      return acc;
    }, {} as Record<string, WebGLTexture>);
}

async function createRenderStep(
  programNode: Node,
  ns: Node[],
  es: Edge[],
  shaders: Shader[],
  textures: Record<string, WebGLTexture>,
  framebuffers: Record<string, FrameBufferTexture>,
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

  let output: FrameBufferTexture | null;

  if (outputNode.type === "window") {
    output = null;
  } else if (outputNode.type === "framebuffer") {
    output = framebuffers[outputNode.id];
    if (output === undefined) {
      throw new Error("Framebuffer not found");
    }
  } else {
    throw new Error("Invalid output.");
  }

  const vert = ns.find(
    (ns) => ns.id === targetedBy.find((e) => e.targetHandle === "vert")?.source
  );
  const frag = ns.find(
    (ns) => ns.id === targetedBy.find((e) => e.targetHandle === "frag")?.source
  );
  const geometry = targetedBy
    .filter((e) => e.targetHandle === "geometry")
    .map(e => ns.find(n => n.id === e.source))
    .filter(n => n !== undefined);

  if (frag === undefined || vert === undefined || geometry === undefined) {
    throw new Error("GL Program did not have all of the necessary inputs.");
  }

  let { dependencies, uniformSetters } = handleShader(vert, ns, es, textures, framebuffers);
  let frag_ = handleShader(frag, ns, es, textures, framebuffers);
  dependencies.push(...frag_.dependencies);
  uniformSetters.push(...frag_.uniformSetters);

  const vs = shaders.find((s) => s.uid === vert.data.shaderId)!;
  const fs = shaders.find((s) => s.uid === frag.data.shaderId)!;

  let geo: Geometry[] = [];

  for (let g of geometry) {
    const uniformSetters = getUniformSetters(g, ns, es, textures, framebuffers);
    switch (g.data.type) {
      case "Screen Quad":
        geo.push(new FullscreenQuad(gl, uniformSetters));
        break;
      case "Model":
        let model = await loadOBJ(g.data.modelSrc as string);
        geo.push(new Mesh(gl, model, uniformSetters));
        break;
      default:
        throw new Error("Unsupported geometry type.");
    }
  }

  let program = new GLProgram(gl, [vs, fs]);

  return new RenderStep(program, output, geo, uniformSetters);
}
