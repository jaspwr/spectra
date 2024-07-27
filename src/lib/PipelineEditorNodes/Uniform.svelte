<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { writable, type Writable } from "svelte/store";
  import type { Shader } from "../../shader";
  import { projects, selectedProject } from "../../project";

  type $$Props = NodeProps;

  $: project = $projects.find((p) => p.name === $selectedProject);

  export let data = {
    type: "Time",
    float1: 0,
    float2: 0,
    textureSrc: "",
  };

  if (data.type === undefined) {
    data.type = "Time";
  }

  const types = ["Time", "float", "vec2", "texture"];
</script>

<div class="shader">
  <div>
    <select bind:value={data.type}>
      {#each types as type}
        <option>{type}</option>
      {/each}
    </select>

    <div>
      {#if data.type === "float"}
        <input type="number" bind:value={data.float1} />
      {:else if data.type === "vec2"}
        <input type="number" bind:value={data.float1} />
        <input type="number" bind:value={data.float2} />
      {:else if data.type === "texture"}
        src:
        <input type="text" bind:value={data.textureSrc} />
        <img src={data.textureSrc} alt="Texture preview" width="100px" />
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

  input {
    width: 60px;
  }
</style>
