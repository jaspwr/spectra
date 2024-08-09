<script lang="ts">
  import { onMount } from "svelte";
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
