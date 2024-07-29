<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { writable, type Writable } from "svelte/store";
  import { projects, selectedProject } from "@/project";
    import InputHandleList from "../InputHandleList.svelte";

  type $$Props = NodeProps;

  $: project = $projects.find((p) => p.name === $selectedProject);

  export let data: { shaderSourceFileName: string } = {
    shaderSourceFileName: "",
  };

  if (data.shaderSourceFileName === undefined) {
    data.shaderSourceFileName = "";
  }

  $: shader = project?.shaderFiles.find((s) => s.filename === data.shaderSourceFileName);

  let handles: [string, string][];
  $: handles = (shader?.data?.uniforms ?? []).map((u) => [u.name, `${u.type} ${u.name}`]);
</script>

<div
  class="shader"
  style="height: {(shader?.data?.uniforms?.length ?? 0) * 16.3 + 50}px"
>

  <div>
    <strong>Shader</strong>
  </div>
  <div>
    {#if data.shaderSourceFileName !== undefined}
      <select bind:value={data.shaderSourceFileName}>
        {#each project?.shaderFiles ?? [] as shader}
          <option value={shader.filename}>{shader.filename}</option>
        {/each}
      </select>
    {/if}
  </div>

  <InputHandleList {handles} top={60} />
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
