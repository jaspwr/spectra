<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import {
    SvelteFlow,
    Controls,
    Background,
    BackgroundVariant,
    type Node,
    useSvelteFlow,
    useEdges,
    type Edge,
  } from "@xyflow/svelte";

  import "@xyflow/svelte/dist/style.css";
  import Shader from "./PipelineEditorNodes/Shader.svelte";
  import GLProgram from "./PipelineEditorNodes/GLProgram.svelte";
  import Window from "./PipelineEditorNodes/Window.svelte";
  import SideBar from "./PipelineEditorNodes/SideBar.svelte";
  import FrameBuffer from "./PipelineEditorNodes/FrameBuffer.svelte";
  import Geometry from "./PipelineEditorNodes/Geometry.svelte";
  import ContextMenu from "./PipelineEditorNodes/ContextMenu.svelte";
  import { projects, selectedProject } from "../project";
  import Uniform from "./PipelineEditorNodes/Uniform.svelte";

  const nodeTypes = {
    shader: Shader,
    "gl-program": GLProgram,
    window: Window,
    framebuffer: FrameBuffer,
    geometry: Geometry,
    uniform: Uniform,
  };

  export let nodes: Writable<Node[]>;
  export let edges: Writable<Edge[]>;

  const { screenToFlowPosition } = useSvelteFlow();

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

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

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

  let menu: {
    id: string;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  } | null;
  let width: number;
  let height: number;

  function handleContextMenu({ detail: { event, node } }) {
    // Prevent native context menu from showing
    event.preventDefault();

    // Calculate position of the context menu. We want to make sure it
    // doesn't get positioned off-screen.
    menu = {
      id: node.id,
      top: event.clientY < height - 200 ? event.clientY : undefined,
      left: event.clientX < width - 200 ? event.clientX : undefined,
      right: event.clientX >= width - 200 ? width - event.clientX : undefined,
      bottom:
        event.clientY >= height - 200 ? height - event.clientY : undefined,
    };
  }

  // Close the context menu if it's open whenever the window is clicked.
  function handlePaneClick() {
    menu = null;
  }
</script>

<div class="container">
  <SvelteFlow
    {nodeTypes}
    {nodes}
    {edges}
    snapGrid={[25, 25]}
    fitView
    on:nodeclick={(event) => console.log("on node click", event.detail.node)}
    on:nodecontextmenu={handleContextMenu}
    on:paneclick={handlePaneClick}
    on:dragover={onDragOver}
    on:drop={onDrop}
  >
    <Controls />
    <Background variant={BackgroundVariant.Dots} />
    {#if menu}
      <ContextMenu
        onClick={handlePaneClick}
        id={menu.id}
        top={menu.top}
        left={menu.left}
        right={menu.right}
        bottom={menu.bottom}
      />
    {/if}
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
