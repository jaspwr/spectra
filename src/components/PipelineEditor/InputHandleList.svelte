<script lang="ts">
  import { Handle, Position } from "@xyflow/svelte";

  export let handles: [string, string][];
  export let top: number;
</script>

{#each handles as [id, label], i}
  <Handle
    type="target"
    position={Position.Left}
    style={`top:${top + 6 + 15 * i}px;`}
    {id}
  />
  <div class="label" style={`top:${top + 15 * i}px;`}>{label}</div>
{/each}

<style>
  .label {
    position: absolute;
    font-size: 10px;
    margin-left: -2px;
  }
</style>
