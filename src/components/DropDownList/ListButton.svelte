<script lang="ts">
  import type { NavBarItem } from "./navbar";

  export let item: NavBarItem;
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
