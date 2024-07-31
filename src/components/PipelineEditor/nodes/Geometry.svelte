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
  import { writable, type Writable } from "svelte/store";
  import { projects, selectedProject } from "@/project";
  import { GeometryNodeType } from "./geometry";

  type $$Props = NodeProps;

  $: project = $projects.find((p) => p.name === $selectedProject);

  export let data: {
    type: GeometryNodeType;
    modelSrc: string;
    uniformOverrides: string[];
  } = {
    type: GeometryNodeType.ScreenQuad,
    modelSrc: "",
    uniformOverrides: [],
  };

  if (data.type === undefined) {
    data.type = GeometryNodeType.ScreenQuad;
  }

  if (data.uniformOverrides === undefined) {
    data.uniformOverrides = [];
  }

  const types = Object.values(GeometryNodeType);
</script>

<div>
  <div>
    <strong>Geometry</strong>
  </div>
  <div>
    <select bind:value={data.type}>
      {#each types as type}
        <option>{type}</option>
      {/each}
    </select>
    <div>
      {#if data.type === "Model"}
        src:
        <input type="text" bind:value={data.modelSrc} />
      {/if}
    </div>

    <hr />
    <span class="small"> Uniform Overrides:</span>
    <br />
    <button
      class="override"
      on:click={() => (data.uniformOverrides = [...data.uniformOverrides, ""])}
    >
      +
    </button>
    <button
      class="override"
      on:click={() =>
        (data.uniformOverrides = data.uniformOverrides.slice(
          0,
          data.uniformOverrides.length - 1,
        ))}
    >
      -
    </button>
    <div>
      {#each data.uniformOverrides as override, i}
        <input type="text" bind:value={override} />
        <Handle
          type="target"
          position={Position.Left}
          style="top:{i * 16.3 + 85}px;"
          id={override}
        />
      {/each}
    </div>
  </div>

  <Handle type="source" position={Position.Right} id="__output" />
</div>

<style>
  .override {
    font-size: 10px;
    width: 15px;
    height: 15px;
  }

  button {
    padding: 0;
    font-size: 12px;
    min-width: 15px !important;
  }

  .small {
    font-size: 12px;
  }
</style>
