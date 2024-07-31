<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { projects, selectedProject, type Project } from "@/project";
  import InputHandleList from "../InputHandleList.svelte";

  type $$Props = NodeProps;

  export let data: {
    name: string;
  };

  $: project = $projects.find((p) => p.name === $selectedProject);
  $: macro = project?.macros.find((m) => m.name === data.name);
  $: handles = macro?.inputLabels;
  $: macroNames = project?.macros.map((m) => m.name) ?? [];
</script>

<div>
  <select bind:value={data.name} class="macro-type">
    {#each macroNames as name}
      <option value={name}>{name}</option>
    {/each}
  </select>
  <div class="macro" style="height:{($handles?.length ?? 0) * 20 + 45}px">
    {#if macro === undefined}
      Invalid Macro
    {:else}
      <strong>{macro.name}</strong>
      <InputHandleList handles={$handles?.map((h) => [h, h]) ?? []} top={75} />
      <Handle type="source" position={Position.Right} />
    {/if}
  </div>
</div>

<style>
  .macro-type {
    margin-bottom: 10px;
  }

  .macro {
    padding: 5px;
    background-color: var(--text-prim);
    color: var(--bg-prim);
    width: 100px;
  }
</style>
