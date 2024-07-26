<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";

  type $$Props = NodeProps;

  export let data: {};
</script>

<div class="program">
  <strong>GL Program</strong>
  <Handle type="target" position={Position.Left} style="top:37px;" id="vert" />
  <div class="label" style="top:32px;">Vert</div>
  <Handle type="target" position={Position.Left} style="top:52px;" id="frag" />
  <div class="label" style="top:47px;">Frag</div>
  <Handle type="target" position={Position.Left} style="top:66px;" id="geometry" />
  <div class="label" style="top:62px;">Geometry</div>
  <Handle type="source" position={Position.Right} />
</div>

<style>
  .program {
    padding: 10px;
    border: 1px solid black;
    border-radius: 5px;
    background-color: #fff;
    width: 100px;
    height: 58px;
  }

  .label {
    position: absolute;
    font-size: 10px;
  }
</style>
