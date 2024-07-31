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
  import InputHandleList from "../InputHandleList.svelte";

  type $$Props = NodeProps;

  $: project = $projects.find((p) => p.name === $selectedProject);

  export let data: { shaderSourceFileName: string } = {
    shaderSourceFileName: "",
  };

  if (data.shaderSourceFileName === undefined) {
    data.shaderSourceFileName = "";
  }

  $: shader = project?.shaderFiles.find(
    (s) => s.filename === data.shaderSourceFileName,
  );

  let handles: [string, string][];
  $: uniforms = shader?.data?.uniforms;
  $: handles = ($uniforms ?? []).map((u) => [u.name, `${u.type} ${u.name}`]);
</script>

<div class="shader" style="height: {($uniforms?.length ?? 0) * 16.3 + 50}px">
  <div>
    <strong>Shader</strong>
  </div>
  <div>
    {#if data.shaderSourceFileName !== undefined}
      <select bind:value={data.shaderSourceFileName}>
        {#each project?.shaderFiles ?? [] as shader}
          <option value={shader.filename}>{shader.filename}</option>
        {/each}
      </select>
    {/if}
  </div>

  <InputHandleList {handles} top={60} />
  <Handle type="source" position={Position.Right} />
</div>

<style>
  .shader {
    width: 200px;
  }

  .label {
    position: absolute;
    font-size: 10px;
  }
</style>
