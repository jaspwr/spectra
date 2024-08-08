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
  import CloseButton from "./CloseButton.svelte";

  export let onClose: () => void;
</script>

<div class="popout">
  <CloseButton {onClose} />
  <slot />
</div>
<div class="background" on:click={onClose}></div>

<style>
  .popout {
    padding: 2rem;
    position: fixed;
    top: 40px;
    left: 40px;
    width: calc(100% - 180px);
    height: calc(100% - 180px);
    background-color: var(--bg-prim);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.9);
    z-index: 1000;
  }

  .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
