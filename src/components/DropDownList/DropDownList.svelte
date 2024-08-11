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
  import { onMount } from "svelte";
  import ListButton from "./ListButton.svelte";
  import type { DropDownListItem } from "./dropdownlist";

  export let items: DropDownListItem[];
  export let close: () => void;

  const escape = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
  };

  onMount(() => {
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  });
</script>

<div class="container">
  {#each items as item}
    <ListButton {item} {close} />
  {/each}
</div>
<div
  on:click={close}
  style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1500;"
></div>

<style>
  .container {
    z-index: 2000;
    position: absolute;
    top: var(--nav-bar-height);
    display: flex;
    flex-direction: column;
    background-color: var(--bg-prim);
    box-shadow: var(--shadow);
    width: 200px;
  }
</style>
