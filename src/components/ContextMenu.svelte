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
  import type { DropDownListItem } from "./DropDownList/dropdownlist";
  import DropDownList from "./DropDownList/DropDownList.svelte";

  let showing = false;

  export let element: HTMLElement | null;
  export let items: DropDownListItem[];
  export let onOpen: () => void = () => {};

  let x = 0;
  let y = 0;

  const onCtxMenu = (e: MouseEvent) => {
    e.preventDefault();
    showing = true;
    x = e.clientX;
    y = e.clientY;
    onOpen();
  };

  $: if (element !== null) {
    element.oncontextmenu = onCtxMenu;
  }
</script>

{#if showing}
  <div class="container" style={`top: ${y}px; left: ${x}px;`}>
    <DropDownList {items} close={() => (showing = false)} />
  </div>
{/if}

<style>
  .container {
    position: fixed;
  }
</style>
