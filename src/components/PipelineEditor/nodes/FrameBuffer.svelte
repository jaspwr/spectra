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
  import { TextureResizeMode } from "@/gl/texture";
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import TypedHandle from "../TypedHandle.svelte";
  import { KnownType } from "@/type";

  type $$Props = NodeProps;

  export let data: {
    isDepthMap: boolean;
    resizeMode: TextureResizeMode;
    scaleFactor: number;
  };

  if (!data) {
    data = {
      isDepthMap: false,
      resizeMode: TextureResizeMode.Linear,
      scaleFactor: 1,
    };
  }

  if (!data.scaleFactor) {
    data.scaleFactor = 1;
  }

  const resizeModes = Object.values(TextureResizeMode);
</script>

<div class="pipeline-node">
  <TypedHandle
    type="target"
    position={Position.Left}
    id="in"
    valueType={KnownType.Output}
  />
  <strong>FrameBuf</strong>
  <div class="checkbox-and-label">
    <input type="checkbox" bind:checked={data.isDepthMap} />
    <span class="small">Depth Map</span>
  </div>
  <select bind:value={data.resizeMode}>
    {#each resizeModes as mode}
      <option>{mode}</option>
    {/each}
  </select>
  <br />
  Scale:
  <input type="number" bind:value={data.scaleFactor} step="0.1" />
  <TypedHandle
    type="source"
    position={Position.Right}
    id="out"
    valueType={KnownType.Texture2D}
  />
</div>

<style>
  .small {
    font-size: 11px;
  }

  input[type="number"] {
    width: 50px;
  }
</style>
