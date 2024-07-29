<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";

  type $$Props = NodeProps;

  export let data: {
    isDepthMap: boolean;
  };
</script>

<div class="pipeline-node">
  <Handle type="target" position={Position.Left} id="in" />
  <strong>FrameBuf</strong>
  <div class="checkbox-and-label">
  <input type="checkbox" bind:checked={data.isDepthMap} />
  <span class="small">Depth Map</span>
    </div>
  <Handle type="source" position={Position.Right} id="out" />
</div>

<style>
  .small {
    font-size: 11px;;
  }
</style>
