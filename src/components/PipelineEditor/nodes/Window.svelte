<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";

  type $$Props = NodeProps;

  export let data: {};
</script>

<div class="window">
  <strong>Window</strong>
  <Handle type="target" position={Position.Left} id="in" />
</div>

<style>
  .window {
    width: 65px;
  }
</style>
