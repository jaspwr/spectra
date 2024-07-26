<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";

  type $$Props = NodeProps;

  export let data: {};
</script>

<div class="framebuf">
  <Handle type="target" position={Position.Left} id="in" />
  <strong>FrameBuf</strong>
  <Handle type="source" position={Position.Right} id="out" />
</div>

<style>
  .framebuf {
    padding: 10px;
    border: 1px solid black;
    border-radius: 5px;
    background-color: #fff;
    width: 75px;
  }
</style>
