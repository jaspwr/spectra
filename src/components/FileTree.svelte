<script lang="ts">
  import { projects, selectedProject, type Project } from "../project";
  import { Shader, ShaderType } from "@/gl/shader";

  $: list =
    $projects.find((p) => p.name === $selectedProject)?.shaderFiles || [];

  $: selected = $projects.find(
    (p) => p.name === $selectedProject,
  )?.selectedShaderFile;

  const iconPath = (shader: Shader): string | null => {
    switch (shader.data.type) {
      case ShaderType.Frag:
        return "icons/file-fragment-shader.svg";
      case ShaderType.Vert:
        return "icons/file-vertex-shader.svg";
      case ShaderType.Comp:
        return "icons/file-compute-shader.svg";
      default:
        return null;
    }
  };

  const itemName = (shader: Shader): string => {
    return shader.filename;
  };

  const add = () => {
    projects.update((p) => {
      let project = p.find((p) => p.name === $selectedProject);
      if (project) {
        const name = prompt("Shader name") ?? "_.frag";
        project.shaderFiles.push(new Shader(name, ""));
      }
      return p;
    });
  };

  const remove = () => {
    projects.update((p) => {
      let project = p.find((p) => p.name === $selectedProject);
      if (project) {
        let index = project.shaderFiles.findIndex(
          (s) => s.filename === $selected,
        );

        if (index !== -1) {
          if (
            window.confirm(
              `Are you sure you want to delete ${project.shaderFiles[index].filename}?`,
            ) === false
          ) {
            return p;
          }

          project.shaderFiles.splice(index, 1);

          selected?.set(
            project.shaderFiles[index]?.filename ||
              project.shaderFiles[index - 1]?.filename ||
              "",
          );
        }
      }
      return p;
    });
  };

  const onSelect = (shader: Shader) => {
    selected?.set(shader.filename);
  };
</script>

<button on:click={add}> + </button>
<button on:click={remove}> - </button>
<ul>
  {#each list as shader}
    <li class:selected={itemName(shader) === $selected}>
      <button on:click={() => onSelect(shader)}>
        {#if iconPath(shader) !== null}
          <img class="icon" src={iconPath(shader)} alt="file" />
        {:else}
          <img class="icon" src="icons/file.svg" alt="file" />
        {/if}
        {itemName(shader)}
      </button>
    </li>
  {/each}
</ul>

<style>
  .icon {
    height: 1.2em;
    margin-right: 0.5em;
    position: relative;
    top: 0.2em;
  }

  li.selected .icon {
    filter: invert(1);
  }

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
