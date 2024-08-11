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
  import type { Notification } from "./notifications";

  export let notification: Notification;

  let containerElem: HTMLDivElement;

  const TRANSITION_TIME = 300;

  onMount(() => {
    setTimeout(() => {
      if (!containerElem) return;
      containerElem.style.right = "0";
      containerElem.style.opacity = "1";
    }, 100);
    setTimeout(() => {
      if (!containerElem) return;
      containerElem.style.right = "-100px";
      containerElem.style.opacity = "0";
    }, notification.duration - TRANSITION_TIME);
  });
</script>

<div class="container" bind:this={containerElem}>
  {notification.message}
</div>

<style>
  .container {
    position: relative;
    right: -100px;
    opacity: 0;
    padding: 1rem;
    background-color: var(--bg-sec);
    color: var(--text-sec);
    box-shadow: var(--shadow);
    transition: all 0.3s ease-in-out;
    pointer-events: none;
  }
</style>
