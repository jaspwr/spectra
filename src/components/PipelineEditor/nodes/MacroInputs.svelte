<!--
  This file is part of Spectra.

  Spectra is free software: you can redistribute it and/or modify it 
  under the terms of the GNU General Public License as published by 
  the Free Software Foundation, either version 3 of the License, or 
  (at your option) any later version.

  Spectra is distributed in the hope that it will be useful, but 
  WITHOUT ANY WARRANTY; without even the implied warranty of 
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
  General Public License for more details.

  You should have received a copy of the GNU General Public License 
  along with Spectra. If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import InputHandleList from "../InputHandleList.svelte";
  import type { Writable } from "svelte/store";

  type $$Props = NodeProps;

  export let data: {
    inputLabels: Writable<string[]>;
  };

  $: inputLabels = data.inputLabels;

  const top = 40;
</script>

<div class="inputs" style="height: {15 * $inputLabels.length + 40}px;">
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
</div>

<style>
  .label {
    position: absolute;
    font-size: 10px;
    margin-left: -2px;
    width: calc(100% - 20px);
    display: flex;
    justify-content: flex-end;
  }

  .inputs {
    width: 140px;
  }
</style>
