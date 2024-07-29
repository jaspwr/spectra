<script lang="ts">
  import { projects, selectedProject, type Project } from "../project";
  import { Shader } from "../shader";

  $: list =
    $projects.find((p) => p.name === $selectedProject)?.shaderFiles || [];

  $: selected = $projects.find(
    (p) => p.name === $selectedProject,
  )?.selectedShaderFile;

  const removeSelectedFrom = (project: Project) => {
    let index = project.shaderFiles.findIndex((s) => s.filename === $selected);

    if (index !== -1) {
      if (
        window.confirm(
          `Are you sure you want to delete ${project.shaderFiles[index].filename}?`,
        ) === false
      ) {
        return;
      }

      project.shaderFiles.splice(index, 1);

      selected?.set(
        project.shaderFiles[index]?.filename ||
          project.shaderFiles[index - 1]?.filename ||
          "",
      );
    }
  };
</script>

<button
  on:click={() => {
    projects.update((p) => {
      let project = p.find((p) => p.name === $selectedProject);
      if (project) {
        const name = prompt("Shader name") ?? "_.frag";
        project.shaderFiles.push(new Shader(name, ""));
      }
      return p;
    });
  }}
>
  +
</button>
<button
  on:click={() => {
    projects.update((p) => {
      let project = p.find((p) => p.name === $selectedProject);
      if (project) {
        removeSelectedFrom(project);
      }
      return p;
    });
  }}
>
  -
</button>
<ul>
  {#each list as shader}
    <li class:selected={shader.filename === $selected}>
      <button
        on:click={() => {
          selected?.set(shader.filename);
        }}
      >
        {shader.filename}
      </button>
    </li>
  {/each}
</ul>

<style>
  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    padding: 0.1em;
  }

  li.selected {
    background-color: var(--text-sec);
  }

  li.selected button {
    color: var(--bg-prim);
  }

  li button {
    background-color: transparent;
    border: none;
    cursor: pointer;
  }

  li button:hover {
    text-decoration: underline;
  }
</style>
