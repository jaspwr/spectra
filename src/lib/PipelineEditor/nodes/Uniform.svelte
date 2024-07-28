<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { projects, selectedProject } from "@/project";
  import {
    UniformNodeType,
    type UniformNodeData,
    DEFAULT_PROJECTION,
    DEFAULT_VIEW,
  } from "./uniform";

  type $$Props = NodeProps;

  $: project = $projects.find((p) => p.name === $selectedProject);

  export let data: UniformNodeData = { type: UniformNodeType.Time };

  const types = Object.values(UniformNodeType);

  $: switch (data.type) {
    case UniformNodeType.ProjectionMatrix:
      if (data.fov !== undefined) break;
      for (const key in DEFAULT_PROJECTION) {
        data[key] = DEFAULT_PROJECTION[key];
      }
      break;
    case UniformNodeType.ViewMatrix:
      if (data.upX !== undefined) break;
      for (const key in DEFAULT_VIEW) {
        data[key] = DEFAULT_VIEW[key];
      }
      break;
  }
</script>

<div class="shader">
  <div>
    <select bind:value={data.type}>
      {#each types as type}
        <option>{type}</option>
      {/each}
    </select>

    <div>
      {#if data.type === UniformNodeType.Float}
        <input type="number" bind:value={data.value} />
      {:else if data.type === UniformNodeType.Tex}
        src:
        <input type="text" bind:value={data.textureSrc} />
        <img src={data.textureSrc} alt="Texture preview" width="100px" />
      {:else if data.type === UniformNodeType.ViewMatrix}
        x: <input type="number" bind:value={data.x} /> <br />
        y: <input type="number" bind:value={data.y} /> <br />
        z: <input type="number" bind:value={data.z} /> <br />

        targ x: <input type="number" bind:value={data.targetX} /> <br />
        targ y: <input type="number" bind:value={data.targetY} /> <br />
        targ z: <input type="number" bind:value={data.targetZ} /> <br />

        up x: <input type="number" bind:value={data.upX} /> <br />
        up y: <input type="number" bind:value={data.upY} /> <br />
        up z: <input type="number" bind:value={data.upZ} /> <br />
      {:else if data.type === UniformNodeType.ProjectionMatrix}
        fov: <input type="number" bind:value={data.fov} /> <br />
        far: <input type="number" bind:value={data.far} /> <br />
        near: <input type="number" bind:value={data.near} /> <br />
      {:else if data.type === UniformNodeType.TranslationMatrix}
        x: <input type="number" bind:value={data.x} /> <br />
        y: <input type="number" bind:value={data.y} /> <br />
        z: <input type="number" bind:value={data.z} /> <br />
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

  input {
    width: 60px;
  }
</style>
