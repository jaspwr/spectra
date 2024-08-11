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
  import { FPS } from "@/utils";
  import PlayPauseButton from "@/components/PlayPauseButton.svelte";
  import BarButton from "./BarButton.svelte";
  import type { NavBarSection } from "./navbar";
  import { writable } from "svelte/store";

  export let navbar: NavBarSection[] = [];
</script>

<!-- <div class="top-bar-item checkbox-and-label"> -->
<!--   <input type="checkbox" bind:checked={editorVimMode} /> -->
<!--   Vim Mode -->
<!-- </div> -->
<!-- <div class="top-bar-item"> -->
<!--   <button on:click={() => (appState = AppState.EditingMacro)}> -->
<!--     <div class="button-contents">Configure Macros</div> -->
<!--   </button> -->
<!--   <button -->
<!--     on:click={() => (appState = AppState.CreatingEmbed)} -->
<!--     style="margin-left: 7px;" -->
<!--   > -->
<!--     <div class="button-contents">Create Embed</div> -->
<!--   </button> -->
<!--   <button on:click={() => (presentationMode = true)} style="margin-left: 7px;"> -->
<!--     <div class="button-contents">Presentation Mode</div> -->
<!--   </button> -->
<!-- </div> -->
<!-- <button on:click={save}> -->
<!--   <div class="button-contents"> -->
<!--     <img class="icon" src="icons/floppy.svg" alt="save" /> -->
<!--     Save -->
<!--   </div> -->
<!-- </button> -->

<div class="navbar">
  {#each navbar as section}
    <BarButton {section} />
  {/each}
</div>

<style>
  div {
    --nav-bar-height: 40px;
  }

  .navbar {
    height: var(--nav-bar-height);
    display: flex;
    align-items: center;
  }
</style>
