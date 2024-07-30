<script lang="ts">
  import { TextureResizeMode } from "@/gl/texture";
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";

  type $$Props = NodeProps;

  export let data: {
    isDepthMap: boolean;
    resizeMode: TextureResizeMode;
  };

  if (!data) {
    data = {
      isDepthMap: false,
      resizeMode: TextureResizeMode.Linear,
    };
  }

  const resizeModes = Object.values(TextureResizeMode);
</script>

<div class="pipeline-node">
  <Handle type="target" position={Position.Left} id="in" />
  <strong>FrameBuf</strong>
  <div class="checkbox-and-label">
    <input type="checkbox" bind:checked={data.isDepthMap} />
    <span class="small">Depth Map</span>
  </div>
  <select bind:value={data.resizeMode}>
    {#each resizeModes as mode}
      <option>{mode}</option>
    {/each}
  </select>
  <Handle type="source" position={Position.Right} id="out" />
</div>

<style>
  .small {
    font-size: 11px;
  }
</style>
