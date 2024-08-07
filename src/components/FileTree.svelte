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
  import { projects, selectedProject, type Project } from "../project";
  import FileTreeRenameBox from "./FileTreeRenameBox.svelte";
  import type { FileTreeProvider } from "@/filetree";

  // $: list =
  // $projects.find((p) => p.name === $selectedProject)?.shaderFiles || [];

  // $: selected = $projects.find(
  //   (p) => p.name === $selectedProject,
  // )?.selectedShaderFile;

  type Item = $$Generic;

  $: list = provider.list;
  $: selected = provider.selected;

  let renaming: string | null = null;

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
</script>

<button
  on:click={() => {
    provider.add();
    list = list;
  }}
>
  +
</button>
<button
  on:click={() => {
    provider.remove();
    list = list;
  }}
>
  -
</button>
<ul>
  {#each sortedList as shader}
    <li class:selected={provider.itemName(shader) === $selected}>
      <button
        on:click={() => onSelect(shader)}
        on:dblclick={() => {
          renaming = provider.itemName(shader);
        }}
      >
        {#if renaming === provider.itemName(shader)}
          <FileTreeRenameBox
            initialValue={provider.itemName(shader)}
            unselect={() => (renaming = null)}
            setValue={(v) => {
              provider.rename(shader, v);
              list = list;
            }}
          />
        {:else}
          {#if provider.iconPath(shader) !== null}
            <img class="icon" src={provider.iconPath(shader)} alt="file" />
          {:else}
            <img class="icon" src="icons/file.svg" alt="file" />
          {/if}
          {provider.itemName(shader)}
        {/if}
      </button>
    </li>
  {/each}
</ul>

<style>
  .icon {
    height: 1.2em;
    margin-right: 0.5em;
    position: relative;
    top: 0.2em;
  }

  li.selected .icon {
    filter: invert(1);
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    padding: 0.1em;
  }

  li.selected {
    background-color: var(--text-sec);
  }

  li.selected button {
    color: var(--bg-prim);
  }

  li button {
    background-color: transparent;
    border: none;
    cursor: pointer;
  }

  li button:hover {
    text-decoration: underline;
  }
</style>
