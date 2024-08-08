<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { writable, type Writable } from "svelte/store";
  import type { Shader } from "../../shader";
  import { scenes, selectedScene } from "../../scene";

  type $$Props = NodeProps;

  $: scene = $scenes.find((p) => p.name === $selectedScene);

  export let data: { type: string; modelSrc: string } = {
    type: "Screen Quad",
    modelSrc: "",
  };

  if (data.type === undefined) {
    data.type = "Screen Quad";
  }

  const types = ["Screen Quad", "Model"];
</script>

<div class="shader">
  <div>
    <select bind:value={data.type}>
      {#each types as type}
        <option>{type}</option>
      {/each}
    </select>
    <div>
      {#if data.type === "Model"}
        src:
        <input type="text" bind:value={data.modelSrc} />
      {/if}
    </div>
  </div>

  <Handle type="source" position={Position.Right} />
</div>

<style>
  .shader {
    padding: 10px;
    border: 1px solid black;
    border-radius: 5px;
    background-color: #fff;
    width: 140px;
  }

  .label {
    position: absolute;
    font-size: 10px;
  }
</style>
