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
  import { onDestroy, onMount } from "svelte";

  export let onClose: () => void;

  const escapeListener = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  onMount(() => {
    document.addEventListener("keydown", escapeListener);
  });

  onDestroy(() => {
    document.removeEventListener("keydown", escapeListener);
  });
</script>

<img class="close" on:click={onClose} src="icons/cross.svg" alt="close" />

<style>
  .close {
    position: absolute;
    top: 10px;
    left: calc(100% - 32px);
    width: 20px;
    transition: filter 0.2s;
    cursor: pointer;
    z-index: 2000;
  }

  .close:hover {
    filter: brightness(0.4);
  }
</style>
