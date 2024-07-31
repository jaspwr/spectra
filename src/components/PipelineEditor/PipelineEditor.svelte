<!--
  This file is part of Spectra.

  Spectra is free software: you can redistribute it and/or modify it 
  under the terms of the GNU General Public License as published by 
  the Free Software Foundation, either version 3 of the License, or 
  (at your option) any later version.

  Spectra is distributed in the hope that it will be useful, but 
  WITHOUT ANY WARRANTY; without even the implied warranty of 
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
  General Public License for more details.

  You should have received a copy of the GNU General Public License 
  along with Spectra. If not, see <https://www.gnu.org/licenses/>.
-->

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
  import Shader from "./nodes/Shader.svelte";
  import GLProgram from "./nodes/GLProgram.svelte";
  import Window from "./nodes/Window.svelte";
  import SideBar from "./SideBar.svelte";
  import FrameBuffer from "./nodes/FrameBuffer.svelte";
  import Geometry from "./nodes/Geometry.svelte";
  import ContextMenu from "./ContextMenu.svelte";
  import Uniform from "./nodes/Uniform.svelte";
  import MacroOutput from "./nodes/MacroOutput.svelte";
  import MacroInputs from "./nodes/MacroInputs.svelte";
  import MacroNode from "./nodes/MacroNode.svelte";

  const nodeTypes = {
    shader: Shader,
    "gl-program": GLProgram,
    window: Window,
    framebuffer: FrameBuffer,
    geometry: Geometry,
    uniform: Uniform,
    macro: MacroNode,
  };

  export let nodes: Writable<Node[]>;
  export let edges: Writable<Edge[]>;
  export let isMacro: boolean = false;

  if (isMacro) {
    nodeTypes["output"] = MacroOutput;
    nodeTypes["inputs"] = MacroInputs;
  }

  let editingMacro: boolean = true;

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

  function handleContextMenu({
    detail: { event, node },
  }: {
    detail: { event: any; node: any };
  }) {
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
  <SideBar {isMacro} />
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
