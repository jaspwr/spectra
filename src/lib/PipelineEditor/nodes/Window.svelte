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
    padding: 10px;
    border: 1px solid black;
    border-radius: 5px;
    background-color: #fff;
    width: 65px;
  }
</style>
