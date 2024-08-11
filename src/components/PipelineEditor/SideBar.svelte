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
  const onDragStart = (event: DragEvent, nodeType: string) => {
    if (!event.dataTransfer) {
      return null;
    }

    event.dataTransfer.setData("application/svelteflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const nodeTypes = [
    "shader",
    "gl-program",
    "window",
    "framebuffer",
    "uniform",
    "geometry",
    "macro",
  ];

  export let isMacro: boolean = false;

  if (isMacro) {
    nodeTypes.push("output");
    nodeTypes.push("inputs");
  }
</script>

<aside>
  <div class="nodes-container">
    {#each nodeTypes as nodeType}
      <div
        class="node svelte-flow__node"
        on:dragstart={(event) => onDragStart(event, nodeType)}
        draggable={true}
      >
        {nodeType}
      </div>
    {/each}
  </div>
</aside>

<style>
  aside {
    background: var(--bg-sec);
    border-bottom: 1px solid var(--text-sec);
    font-size: 9px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .nodes-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .node {
    position: relative !important;
    padding: 0.3rem !important;
    margin: 0.2rem !important;
    cursor: grab;
  }
</style>
