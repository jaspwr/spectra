<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { writable, type Writable } from "svelte/store";
  import { projects, selectedProject } from "@/project";

  type $$Props = NodeProps;

  $: project = $projects.find((p) => p.name === $selectedProject);

  export let data: { shaderId: number } = {
    shaderId: 0,
  };

  if (data.shaderId === undefined) {
    data.shaderId = 0;
  }

  $: shader = project?.shaderFiles.find((s) => s.uid === data.shaderId);
</script>

<div
  class="shader"
  style="height: {(shader?.data?.uniforms?.length ?? 0) * 16.3 + 50}px"
>

  <div>
    <strong>Shader</strong>
  </div>
  <div>
    {#if data.shaderId !== undefined}
      <select bind:value={data.shaderId}>
        {#each project?.shaderFiles ?? [] as shader}
          <option value={shader.uid}>{shader.filename}</option>
        {/each}
      </select>
    {/if}
  </div>

  {#each shader?.data?.uniforms ?? [] as uniform, i}
    <Handle
      type="target"
      position={Position.Left}
      style="top:{i * 16.3 + 55}px;"
      id={uniform.name}
    />
    <div class="label" style="top:{i * 16.3 + 50}px;">
      <strong>{uniform.name}</strong>
      <span>{uniform.type}</span>
    </div>
  {/each}
  <Handle type="source" position={Position.Right} />
</div>

<style>
  .shader {
    width: 200px;
  }

  .label {
    position: absolute;
    font-size: 10px;
  }
</style>
