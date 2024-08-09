<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  export let initialValue: string;
  export let setValue: (v: string) => void;
  export let unselect: () => void;

  let renameBuffer: string = initialValue;
  let inputElem: HTMLInputElement;

  const keypressListener = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      unselect();
    } else if (event.key === "Enter") {
      setValue(renameBuffer);
      unselect();
    }
  };

  onMount(() => {
    document.addEventListener("keydown", keypressListener);
    inputElem.onblur = () => {
      setValue(renameBuffer);
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
