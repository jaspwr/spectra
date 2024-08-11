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
  import { NOTIFICATIONS } from "./notifications";
  import Notification from "./Notification.svelte";
</script>

<div class="container">
  {#each $NOTIFICATIONS as notification}
    <Notification {notification} />
  {/each}
</div>

<style>
  .container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 5000;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
