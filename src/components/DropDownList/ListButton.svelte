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
  import type { DropDownListItem } from "./dropdownlist";

  export let item: DropDownListItem;
  export let close: () => void;

  const flipBool =
    item.booleanOption !== undefined
      ? () => item.booleanOption?.update((b) => !b)
      : undefined;

  const action = item.action ?? flipBool ?? (() => {});

  const onClick = () => {
    action();
    close();
  };

  $: booleanOption = item.booleanOption;
</script>

<div class="item" on:click={onClick}>
  {#if booleanOption !== undefined}
    <input type="checkbox" bind:checked={$booleanOption} />
  {/if}
  {item.title}
</div>

<style>
  .item {
    display: flex;
    align-items: center;
    padding: 0 10px;
    width: 100%;
    height: 30px;
    transition: background-color 0.2s;
    cursor: pointer;
  }

  .item:hover {
    background-color: var(--bg-sec);
  }
</style>
