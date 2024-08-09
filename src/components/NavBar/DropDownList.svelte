<script lang="ts">
  import { onMount } from "svelte";
  import ListButton from "./ListButton.svelte";
  import type { NavBarItem } from "./navbar";

  export let items: NavBarItem[];
  export let close: () => void;

  const escape = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
  };

  onMount(() => {
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  });
</script>

<div class="container">
  {#each items as item}
    <ListButton {item} {close} />
  {/each}
</div>
<div
  on:click={close}
  style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1500;"
></div>

<style>
  .container {
    z-index: 2000;
    position: absolute;
    top: var(--nav-bar-height);
    display: flex;
    flex-direction: column;
    background-color: var(--bg-prim);
    box-shadow: var(--shadow);
    width: 200px;
  }
</style>
