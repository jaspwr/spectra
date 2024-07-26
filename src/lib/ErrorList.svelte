<script lang="ts">
  export let errors: string[] = [];
</script>

<div class="error-list">
  {#each errors as error}
    <div class="error">{error}</div>
  {/each}
</div>

<style>
  .error-list {
    overflow-y: scroll;
    height: 230px;
  }

  .error {
    color: red;
    margin: 0.5em;
  }
</style>
