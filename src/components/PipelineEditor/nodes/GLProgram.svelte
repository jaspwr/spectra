<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
    import InputHandleList from "../InputHandleList.svelte";

  type $$Props = NodeProps;

  export let data: {};

  const handles: [string, string][] = [
    ["vert", "Vert"],
    ["frag", "Frag"],
    ["geometry", "Geometry"],
  ];
</script>

<div class="program">
  <strong>GL Program</strong>
  <InputHandleList {handles} top={33} />
  <Handle type="source" position={Position.Right} />
</div>

<style>
  .program {
    width: 110px;
    height: 65px;
  }
</style>
