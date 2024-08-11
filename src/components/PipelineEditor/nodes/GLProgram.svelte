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
  import TypedHandle from "../TypedHandle.svelte";
  import { KnownType } from "@/type";

  type $$Props = NodeProps;

  export let data: {};

  const handles: [string, string, KnownType][] = [
    ["vert", "Vert", KnownType.VertexShader],
    ["frag", "Frag", KnownType.FragmentShader],
    ["geometry", "Geometry", KnownType.Geometry],
  ];
</script>

<div class="program">
  <strong>GL Program</strong>
  <InputHandleList {handles} top={33} />
  <TypedHandle
    type="source"
    position={Position.Right}
    valueType={KnownType.Output}
    id="__output"
  />
</div>

<style>
  .program {
    width: 110px;
    height: 65px;
  }
</style>
