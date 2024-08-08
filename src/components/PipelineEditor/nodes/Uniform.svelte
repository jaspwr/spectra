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
  import { scenes, selectedScene } from "@/scene";
  import {
    UniformNodeType,
    type UniformNodeData,
    DEFAULT_PROJECTION,
    DEFAULT_VIEW,
  } from "./uniform";
    import { KnownType } from "@/type";
    import TypedHandle from "../TypedHandle.svelte";

  type $$Props = NodeProps;

  $: scene = $scenes.find((p) => p.name === $selectedScene);

  export let data: UniformNodeData = { type: UniformNodeType.Time };

  const types = Object.values(UniformNodeType);

  $: switch (data.type) {
    case UniformNodeType.ProjectionMatrix:
      if (data.fov !== undefined) break;
      for (const key in DEFAULT_PROJECTION) {
        data[key] = DEFAULT_PROJECTION[key];
      }
      break;
    case UniformNodeType.ViewMatrix:
      if (data.upX !== undefined) break;
      for (const key in DEFAULT_VIEW) {
        data[key] = DEFAULT_VIEW[key];
      }
      break;
  }

  let outputType = "";
 
  $: switch (data.type) {
    case UniformNodeType.Float:
      outputType = KnownType.Float;
      break;
    case UniformNodeType.Time:
      outputType = KnownType.Float;
      break;
    case UniformNodeType.Tex:
      outputType = KnownType.Texture2D;
      break;
    case UniformNodeType.ViewMatrix:
      outputType = KnownType.Mat4;
      break;
    case UniformNodeType.ProjectionMatrix:
      outputType = KnownType.Mat4;
      break;
    case UniformNodeType.TranslationMatrix:
      outputType = KnownType.Mat4;
      break;
    case UniformNodeType.Vec2:
      outputType = KnownType.Vec2;
      break;
    case UniformNodeType.CubeMap:
      outputType = KnownType.TextureCube;
      break;
    case UniformNodeType.WindowSize:
      outputType = KnownType.Vec2;
      break;
  }

</script>

<div class="uniform">
  <div>
    <div>
      <strong>Uniform</strong>
    </div>
    <select bind:value={data.type}>
      {#each types as type}
        <option>{type}</option>
      {/each}
    </select>

    <div style="margin-top: 7px">
      {#if data.type === UniformNodeType.Float}
        <input type="number" bind:value={data.value} />
      {:else if data.type === UniformNodeType.Tex}
        src:
        <input type="text" bind:value={data.textureSrc} />
        <img src={data.textureSrc} alt="Texture preview" width="100px" />
      {:else if data.type === UniformNodeType.ViewMatrix}
        <table>
          <tr>
            <td>x:</td><td> <input type="number" bind:value={data.x} /> </td>
          </tr><tr>
            <td>y: </td><td><input type="number" bind:value={data.y} /> </td>
          </tr><tr>
            <td>z </td><td><input type="number" bind:value={data.z} /> </td>
          </tr>
          <tr>
            <td>upX: </td><td
              ><input type="number" bind:value={data.upX} />
            </td>
          </tr>
          <tr>
            <td>upY: </td><td
              ><input type="number" bind:value={data.upY} />
            </td>
          </tr>
          <tr>
            <td>upZ: </td><td
              ><input type="number" bind:value={data.upZ} />
            </td>
          </tr>
          <tr>
            <td>targetX: </td><td
              ><input type="number" bind:value={data.targetX} />
            </td>
          </tr>
          <tr>
            <td>targetY: </td><td
              ><input type="number" bind:value={data.targetY} />
            </td>
          </tr>
          <tr>
            <td>targetZ: </td><td
              ><input type="number" bind:value={data.targetZ} />
            </td>
          </tr>
        </table>
      {:else if data.type === UniformNodeType.ProjectionMatrix}
        <table>
          <tr>
            <td>fov</td><td> <input type="number" bind:value={data.fov} /> </td>
          </tr><tr>
            <td>far</td><td> <input type="number" bind:value={data.far} /> </td>
          </tr><tr>
            <td>near</td><td>
              <input type="number" bind:value={data.near} />
            </td>
          </tr>
        </table>
      {:else if data.type === UniformNodeType.TranslationMatrix}
        <table>
          <tr>
            <td>x:</td><td> <input type="number" bind:value={data.x} /> </td>
          </tr><tr>
            <td>y: </td><td><input type="number" bind:value={data.y} /> </td>
          </tr><tr>
            <td>z </td><td><input type="number" bind:value={data.z} /> </td>
          </tr>
        </table>
      {:else if data.type === UniformNodeType.Vec2}
        <table>
          <tr>
            <td>x:</td><td> <input type="number" bind:value={data.x} /> </td>
          </tr><tr>
            <td>y: </td><td><input type="number" bind:value={data.y} /> </td>
          </tr>
        </table>
      {:else if data.type === UniformNodeType.CubeMap}
        src:
        <input type="text" bind:value={data.textureSrc} />
        <img src={`${data.textureSrc}/right.png`} alt="Texture preview" width="100px" />
      {/if}
    </div>
  </div>

  <TypedHandle type="source" position={Position.Right} valueType={outputType} id="__output" />
</div>

<style>
  .uniform {
    width: 140px;
  }

  input {
    width: 60px;
  }
</style>
