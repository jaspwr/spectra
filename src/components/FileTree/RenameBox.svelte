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

  export let initialValue: string;
  export let setValue: (v: string) => void;
  export let unselect: () => void;

  let hasSet: boolean = false;
  let renameBuffer: string = initialValue;
  let inputElem: HTMLInputElement;

  const runSetValue = () => {
    if (!hasSet) {
      setValue(renameBuffer);
      hasSet = true;
    }
  };

  const keypressListener = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      unselect();
    } else if (event.key === "Enter") {
      runSetValue();
      unselect();
    }
  };

  onMount(() => {
    document.addEventListener("keydown", keypressListener);
    inputElem.onblur = () => {
      runSetValue();
      unselect();
    };
    inputElem.focus();
  });

  onDestroy(() => {
    document.removeEventListener("keydown", keypressListener);
  });
</script>

<input
  type="text"
  class="rename"
  bind:this={inputElem}
  bind:value={renameBuffer}
/>

<style>
  .rename {
    width: 100%;
    outline: none;
    border: none;
    color: inherit;
    font-size: inherit;
    background-color: transparent;
  }
</style>
