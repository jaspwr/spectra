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
  import { scenes, selectedScene } from "../scene";

    $: list = $scenes.find((p) => p.name === $selectedScene)?.goals || [];
</script>

<h2 class="header">Goals</h2>

<div class="list">
  {#each list as { name, done }, i}
    <!-- svelte-ignore a11y-click-events-have-key-events
        a11y-no-static-element-interactions
        (This on:click is redundant as you can also use the checkbox) -->
    <div class="goal" class:done on:click={() => (done = !done)}>
      <input type="checkbox" bind:checked={done} />
      <span>{name}</span>
    </div>
  {/each}
</div>

<style>
  .header {
    margin: 0.5em;
  }

  .list {
    overflow-y: scroll;
    height: 230px;
  }

  .goal {
    display: flex;
    align-items: center;
    margin: 0.5em;
    cursor: pointer;
  }

  .goal.done {
    text-decoration: line-through;
    opacity: 0.5;
  }

  input {
    margin-right: 0.5em;
  }
</style>
