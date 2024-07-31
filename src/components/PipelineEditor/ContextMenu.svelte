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
  import { useEdges, useNodes } from "@xyflow/svelte";

  export let onClick: () => void;
  export let id: string;
  export let top: number | undefined;
  export let left: number | undefined;
  export let right: number | undefined;
  export let bottom: number | undefined;

  const nodes = useNodes();
  const edges = useEdges();

  function duplicateNode() {
    const node = $nodes.find((node) => node.id === id);
    if (node) {
      $nodes.push({
        ...node,
        // You should use a better id than this in production
        id: `${id}-copy${Math.random()}`,
        position: {
          x: node.position.x,
          y: node.position.y + 50,
        },
      });
    }
    $nodes = $nodes;
  }

  function deleteNode() {
    $nodes = $nodes.filter((node) => node.id !== id);
    $edges = $edges.filter((edge) => edge.source !== id && edge.target !== id);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events
  a11y-no-static-element-interactions -->
<div
  style="top: {top}px; left: {left}px; right: {right}px; bottom: {bottom}px;"
  class="context-menu"
  on:click={onClick}
>
  <button on:click={duplicateNode}>duplicate</button>
  <button on:click={deleteNode}>delete</button>
</div>

<style>
  .context-menu {
    background: white;
    border-style: solid;
    box-shadow: 10px 19px 20px rgba(0, 0, 0, 10%);
    position: absolute;
    z-index: 10;
  }

  .context-menu button {
    border: none;
    display: block;
    padding: 0.5em;
    text-align: left;
    width: 100%;
  }

  .context-menu button:hover {
    background: white;
  }
</style>
