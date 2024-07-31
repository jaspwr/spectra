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
  import type { PipelineConnectionType } from "@/type";
  import { Handle, Position } from "@xyflow/svelte";
  import TypedHandle from "./TypedHandle.svelte";

  export let handles: (
    | [string, string]
    | [string, string, PipelineConnectionType]
  )[];
  export let top: number;
</script>

{#each handles as [id, label, type], i}
  {#if type !== undefined}
    <TypedHandle
      type="target"
      position={Position.Left}
      valueType={type}
      top={top + 6 + 15 * i}
      {id}
    />
  {:else}
    <Handle
      type="target"
      position={Position.Left}
      style={`top:${top + 6 + 15 * i}px;`}
      {id}
    />
  {/if}
  <div class="label" style={`top:${top + 15 * i}px;`}>{label}</div>
{/each}

<style>
  .label {
    position: absolute;
    font-size: 10px;
    margin-left: -2px;
  }
</style>
