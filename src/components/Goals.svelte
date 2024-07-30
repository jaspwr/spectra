<script lang="ts">
  import { projects, selectedProject } from "../project";

    $: list = $projects.find((p) => p.name === $selectedProject)?.goals || [];
</script>

<h2 class="header">Goals</h2>

<div class="list">
  {#each list as { name, done }, i}
    <!-- svelte-ignore a11y-click-events-have-key-events
        a11y-no-static-element-interactions
        (This on:click is redundant as you can also use the checkbox) -->
    <div class="goal" class:done on:click={() => (done = !done)}>
      <input type="checkbox" bind:checked={done} />
      <span>{name}</span>
    </div>
  {/each}
</div>

<style>
  .header {
    margin: 0.5em;
  }

  .list {
    overflow-y: scroll;
    height: 230px;
  }

  .goal {
    display: flex;
    align-items: center;
    margin: 0.5em;
    cursor: pointer;
  }

  .goal.done {
    text-decoration: line-through;
    opacity: 0.5;
  }

  input {
    margin-right: 0.5em;
  }
</style>
