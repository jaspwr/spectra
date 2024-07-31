<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";

  type $$Props = NodeProps;

  export let data: {};
</script>

<div class="output_">
  <strong>Macro Output</strong>
  <Handle type="target" position={Position.Left} id="in"/>
</div>

<style>
  .output_ {
    width: 65px;
  }
</style>
