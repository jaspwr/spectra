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
  import DropDownList from "../DropDownList/DropDownList.svelte";
  import type { NavBarSection } from "./navbar";

  export let section: NavBarSection;

  let showing = false;
</script>

<div class="section-button">
  <button on:click={() => (showing = true)} class:selected={showing}>
    {section.title}
  </button>
  {#if showing}
    <DropDownList items={section.items} close={() => (showing = false)} />
  {/if}
</div>

<style>
  .section-button {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  button {
    all: unset;
    height: var(--nav-bar-height);
    padding: 0 10px;
    transition: background-color 0.2s;
  }

  button:hover {
    background-color: var(--bg-sec);
  }

  .selected {
    background-color: var(--bg-sec);
  }
</style>
