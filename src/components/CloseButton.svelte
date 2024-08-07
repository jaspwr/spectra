<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  export let onClose: () => void;

  const escapeListener = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  onMount(() => {
    document.addEventListener("keydown", escapeListener);
  });

  onDestroy(() => {
    document.removeEventListener("keydown", escapeListener);
  });
</script>

<img class="close" on:click={onClose} src="icons/cross.svg" alt="close" />

<style>
  .close {
    position: absolute;
    top: 10px;
    left: calc(100% - 32px);
    width: 20px;
    transition: filter 0.2s;
    cursor: pointer;
    z-index: 2000;
  }

  .close:hover {
    filter: brightness(0.4);
  }
</style>
