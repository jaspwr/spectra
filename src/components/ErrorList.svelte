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
  import { notify } from "./Notification/notifications";

  export let errors: string[] = [];

  notify("Compilation Failed.");
</script>

<div class="error-list">
  {#each errors as error}
    <div class="error">{error}</div>
  {/each}
</div>

<style>
  .error-list {
    overflow-y: scroll;
    height: 230px;
  }

  .error {
    color: red;
    margin: 0.5em;
  }
</style>
