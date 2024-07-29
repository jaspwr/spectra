<script lang="ts">
  import { Handle, Position, type NodeProps } from "@xyflow/svelte";
  import { projects, selectedProject } from "@/project";
  import {
    UniformNodeType,
    type UniformNodeData,
    DEFAULT_PROJECTION,
    DEFAULT_VIEW,
  } from "./uniform";

  type $$Props = NodeProps;

  $: project = $projects.find((p) => p.name === $selectedProject);

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
      {/if}
    </div>
  </div>

  <Handle type="source" position={Position.Right} />
</div>

<style>
  .uniform {
    width: 140px;
  }

  input {
    width: 60px;
  }
</style>
