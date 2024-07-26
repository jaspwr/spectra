<script lang="ts">
  import { writable } from "svelte/store";
  import {
    SvelteFlow,
    Controls,
    Background,
    BackgroundVariant,
    MiniMap,
    type Node,
  } from "@xyflow/svelte";

  import "@xyflow/svelte/dist/style.css";
  import Shader from "./PipelineEditorNodes/Shader.svelte";
  import GLProgram from "./PipelineEditorNodes/GLProgram.svelte";
  import Window from "./PipelineEditorNodes/Window.svelte";
  import SideBar from "./PipelineEditorNodes/SideBar.svelte";
  import FrameBuffer from "./PipelineEditorNodes/FrameBuffer.svelte";
  import Geometry from "./PipelineEditorNodes/Geometry.svelte";

  const nodeTypes = {
    shader: Shader,
    "gl-program": GLProgram,
    window: Window,
    "framebuffer": FrameBuffer,
    "geometry": Geometry,
  };

  const nodes = writable([
    {
      id: "1",
      type: "input",
      data: { label: "Input Node" },
      position: { x: 0, y: 0 },
    },
    {
      id: "2",
      type: "window",
      data: {},
      position: { x: 0, y: 150 },
    },
    {
      id: "3",
      type: "shader",
      data: { shaderId: writable(0) },
      position: { x: 20, y: 150 },
    },
    {
      id: "4",
      type: "gl-program",
      data: {},
      position: { x: 50, y: 150 },
    },
  ]);

  const edges = writable([
    {
      id: "1-2",
      type: "default",
      source: "1",
      target: "2",
    },
  ]);

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();

    if (!event.dataTransfer) {
      return null;
    }

    const type = event.dataTransfer.getData("application/svelteflow");

    const position = {
      x: 0,
      y: 0,
    };

    const newNode = {
      id: `${Math.random()}`,
      type,
      position,
      data: { label: `${type} node` },
      origin: [0.5, 0.0],
    } satisfies Node;

    $nodes.push(newNode);
    $nodes = $nodes;
  };
</script>

<div class="container">
  <SvelteFlow
    {nodeTypes}
    {nodes}
    {edges}
    snapGrid={[25, 25]}
    fitView
    on:nodeclick={(event) => console.log("on node click", event.detail.node)}
    on:dragover={onDragOver}
    on:drop={onDrop}
  >
    <Controls />
    <Background variant={BackgroundVariant.Dots} />
  </SvelteFlow>
  <SideBar />
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
    color: black;
    display: flex;
    flex-direction: column-reverse;
  }
</style>
