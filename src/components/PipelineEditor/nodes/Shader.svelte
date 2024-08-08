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
  import { scenes, selectedScene } from "@/scene";
  import InputHandleList from "../InputHandleList.svelte";
    import TypedHandle from "../TypedHandle.svelte";
    import { KnownType, type PipelineConnectionType } from "@/type";
    import { ShaderType } from "@/gl/shader";

  type $$Props = NodeProps;

  $: scene = $scenes.find((p) => p.name === $selectedScene);

  export let data: { shaderSourceFileName: string } = {
    shaderSourceFileName: "",
  };

  if (data.shaderSourceFileName === undefined) {
    data.shaderSourceFileName = "";
  }

  $: shader = scene?.shaderFiles.find(
    (s) => s.filename === data.shaderSourceFileName,
  );

  let handles: [string, string, PipelineConnectionType][];
  $: uniforms = shader?.data?.uniforms;
  $: handles = ($uniforms ?? []).map((u) => [u.name, `${u.type} ${u.name}`, u.type]);

  let valueType: PipelineConnectionType = "";
  $: switch (shader?.data.type) {
    case ShaderType.Vert:
      valueType = KnownType.VertexShader;
      break;
    case ShaderType.Frag:
      valueType = KnownType.FragmentShader;
      break;
    case ShaderType.Comp:
      valueType = KnownType.ComputeShader;
      break;
  }
</script>

<div class="shader" style="height: {($uniforms?.length ?? 0) * 16.3 + 50}px">
  <div>
    <strong>Shader</strong>
  </div>
  <div>
    {#if data.shaderSourceFileName !== undefined}
      <select bind:value={data.shaderSourceFileName}>
        {#each (scene?.shaderFiles ?? []).filter(s => s.data.type !== ShaderType.Invalid) as shader}
          <option value={shader.filename}>{shader.filename}</option>
        {/each}
      </select>
    {/if}
  </div>

  <InputHandleList {handles} top={60} />
  <TypedHandle type="source" position={Position.Right} valueType={valueType} id="__output" />
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
