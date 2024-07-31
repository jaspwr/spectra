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
<div class="popout">
  <slot />
</div>

<style>
  .popout {
    padding: 2rem;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

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
