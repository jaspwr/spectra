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
  import { notify } from "../Notification/notifications";
  import type { DropDownListItem } from "../DropDownList/dropdownlist";
  import { get, type Writable } from "svelte/store";
  import RenameBox from "./RenameBox.svelte";
  import type { FileTreeProvider } from "@/filetree";
  import ContextMenu from "../ContextMenu.svelte";

  let itemElem: HTMLElement | null = null;

  type T = $$Generic;

  export let shader: T;
  export let provider: FileTreeProvider<T>;
  export let onSelect: (shader: T) => void;
  export let rerenderList: () => void;
  export let selected: Writable<string>;

  let renaming: boolean = false;

  const ctxMenuItems: DropDownListItem[] = [
    { title: "Duplicate", action: () => provider.duplicate(shader) },
    { title: "Rename", action: () => (renaming = true) },
    {
      title: "Delete",
      action: () => {
        selected.set(provider.itemName(shader));
        if (!confirm("Are you sure you want to delete this item?")) {
          return;
        }
        provider.remove();
      },
    },
  ];

  const onOpenCtxMenu = () => {
    onSelect(shader);
  };
</script>

<li class:selected={provider.itemName(shader) === $selected}>
  <button
    bind:this={itemElem}
    on:click={() => onSelect(shader)}
    on:dblclick={() => {
      renaming = true;
    }}
  >
    {#if renaming}
      <RenameBox
        initialValue={provider.itemName(shader)}
        unselect={() => (renaming = false)}
        setValue={(v) => {
          if (v === "") {
            notify("Name cannot be empty.");
            return;
          }

          if (v === provider.itemName(shader)) {
            return;
          }

          if (
            get(provider.list).find((s) => provider.itemName(s) === v) !==
            undefined
          ) {
            notify("Item already exists.");
            return;
          }

          provider.rename(shader, v);
          rerenderList();
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
<ContextMenu element={itemElem} items={ctxMenuItems} onOpen={onOpenCtxMenu} />

<style>
  .icon {
    height: 1.2em;
    margin-right: 0.5em;
  }

  li.selected .icon {
    filter: invert(1);
  }

  li.selected button {
    color: var(--bg-prim);
  }

  li button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
  }

  li {
    padding: 0.1em;
    transition: background-color 0.1s;
  }

  li:hover {
    background-color: var(--bg-sec);
  }

  li.selected {
    background-color: var(--text-sec);
  }
</style>
