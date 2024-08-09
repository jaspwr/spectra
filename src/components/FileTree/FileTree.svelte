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
  import type { FileTreeProvider } from "@/filetree";
  import ListItem from "./ListItem.svelte";

  type Item = $$Generic;

  $: list = provider.list;
  $: selected = provider.selected;

  export let provider: FileTreeProvider<Item>;

  $: sortedList = [...$list].sort((a, b) => {
    if (provider.itemName(a) < provider.itemName(b)) {
      return -1;
    } else if (provider.itemName(a) > provider.itemName(b)) {
      return 1;
    } else {
      return 0;
    }
  });

  const onSelect = (item: Item) => {
    provider.selected.set(provider.itemName(item));
  };

  const rerenderList = () => {
    list = list;
  };
</script>

<div class="add-remove-container">
  <button
    class="add-remove"
    on:click={() => {
      provider.add();
      list = list;
    }}
  >
    +
  </button>
  <button
    class="add-remove"
    on:click={() => {
      if (confirm("Are you sure you want to delete this item?") === false) {
        return;
      }

      provider.remove();
      list = list;
    }}
  >
    -
  </button>
</div>
<ul>
  {#each sortedList as shader}
    <ListItem {shader} {provider} {onSelect} {rerenderList} {selected} />
  {/each}
</ul>

<style>
  ul {
    list-style-type: none;
    padding: 0;
  }

  .add-remove-container {
    display: flex;
    flex-direction: row;
  }

  .add-remove {
    margin: 0.3rem;
    font-size: 1.5em;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
