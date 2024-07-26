<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { writable, type Writable } from "svelte/store";
  import type { Shader } from "../../shader";
  import { projects, selectedProject } from "../../project";

  type $$Props = NodeProps;

  $: project = $projects.find((p) => p.name === $selectedProject);

  export let data: { type: Writable<string> } = {
    type: writable("Screen Quad"),
  };

  if (data.type === undefined) {
    data.type = writable("Screen Quad");
  }

  const { type } = data;

  const types = ["Screen Quad", "Model"];
</script>

<div class="shader">
  <div>
    <select bind:value={$type}>
      {#each types as type}
        <option>{type}</option>
      {/each}
    </select>
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
