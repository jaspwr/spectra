<script lang="ts">
  const onDragStart = (event: DragEvent, nodeType: string) => {
    if (!event.dataTransfer) {
      return null;
    }

    event.dataTransfer.setData("application/svelteflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const nodeTypes = ["shader", "gl-program", "window", "framebuffer", "uniform", "geometry"];
</script>

<aside>
  <div class="nodes-container">
    {#each nodeTypes as nodeType}
      <div
        class="node"
        on:dragstart={(event) => onDragStart(event, nodeType)}
        draggable={true}
      >
        {nodeType}
      </div>
    {/each}
  </div>
</aside>

<style>
  aside {
    background: #f4f4f4;
    font-size: 9px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .nodes-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .node {
    margin: 0.2rem;
    border: 1px solid #111;
    padding: 0.2rem 0.4rem;
    font-weight: 700;
    border-radius: 3px;
    cursor: grab;
  }
</style>
