<script lang="ts">
  import { NOTIFICATIONS } from "./notifications";
  import Notification from "./Notification.svelte";
</script>

<div class="container">
  {#each $NOTIFICATIONS as notification}
    <Notification {notification} />
  {/each}
</div>

<style>
  .container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 5000;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
