<script lang="ts">
  import DropDownList from "./DropDownList.svelte";
  import type { NavBarSection } from "./navbar";

  export let section: NavBarSection;

  let showing = false;
</script>

<div class="section-button">
  <button on:click={() => (showing = true)}>
    {section.title}
  </button>
  {#if showing}
    <DropDownList items={section.items} close={() => (showing = false)} />
  {/if}
</div>

<style>
  .section-button {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  button {
    all: unset;
    height: var(--nav-bar-height);
    padding: 0 10px;
  }

  button:hover {
    background-color: var(--bg-sec);
  }
</style>
