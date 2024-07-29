<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { writable, type Writable } from "svelte/store";
  import { projects, selectedProject } from "@/project";

  type $$Props = NodeProps;

  $: project = $projects.find((p) => p.name === $selectedProject);

  export let data: {
    type: string;
    modelSrc: string;
    uniformOverrides: string[];
  } = {
    type: "Screen Quad",
    modelSrc: "",
    uniformOverrides: [],
  };

  if (data.type === undefined) {
    data.type = "Screen Quad";
  }

  if (data.uniformOverrides === undefined) {
    data.uniformOverrides = [];
  }

  const types = ["Screen Quad", "Model"];

  $: console.log(data.uniformOverrides);
</script>

<div>
  <div>
    <strong>Geometry</strong>
  </div>
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

    <hr />
    <span class="small"> Uniform Overrides:</span>
    <br />
    <button
      class="override"
      on:click={() => (data.uniformOverrides = [...data.uniformOverrides, ""])}
    >
      +
    </button>
    <button
      class="override"
      on:click={() =>
        (data.uniformOverrides = data.uniformOverrides.slice(
          0,
          data.uniformOverrides.length - 1,
        ))}
    >
      -
    </button>
    <div>
      {#each data.uniformOverrides as override, i}
        <input type="text" bind:value={override} />
        <Handle
          type="target"
          position={Position.Left}
          style="top:{i * 16.3 + 85}px;"
          id={override}
        />
      {/each}
    </div>
  </div>

  <Handle type="source" position={Position.Right} id="__output" />
</div>

<style>
  .override {
    font-size: 10px;
    width: 15px;
    height: 15px;
  }

  button {
    padding: 0;
    font-size: 12px;
    min-width: 15px !important;
  }

  .small {
    font-size: 12px;
  }
</style>
