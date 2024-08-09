<script lang="ts">
  import { onMount } from "svelte";
  import type { Notification } from "./notifications";

  export let notification: Notification;

  let containerElem: HTMLDivElement;

  const TRANSITION_TIME = 300;

  onMount(() => {
    setTimeout(() => {
      if (!containerElem) return;
      containerElem.style.right = "0";
      containerElem.style.opacity = "1";
    }, 100);
    setTimeout(() => {
      if (!containerElem) return;
      containerElem.style.right = "-100px";
      containerElem.style.opacity = "0";
    }, notification.duration - TRANSITION_TIME);
  });
</script>

<div class="container" bind:this={containerElem}>
  {notification.message}
</div>

<style>
  .container {
    position: relative;
    right: -100px;
    opacity: 0;
    padding: 1rem;
    background-color: var(--bg-sec);
    color: var(--text-sec);
    box-shadow: var(--shadow);
    transition: all 0.3s ease-in-out;
  }
</style>
