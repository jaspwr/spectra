<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import InputHandleList from "../InputHandleList.svelte";
  import type { Writable } from "svelte/store";

  type $$Props = NodeProps;

  export let data: {
    inputLabels: Writable<string[]>;
  };

  $: inputLabels = data.inputLabels;

  const top = 55;
</script>

<div class="inputs">
  <strong>Macro Inputs</strong>

  {#each $inputLabels as label, i}
    <Handle
      type="source"
      position={Position.Right}
      style={`top:${top + 6 + 15 * i}px;`}
      id={label}
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
</div>

<style>
  .inputs {
    width: 165px;
  }
</style>
