<script lang="ts">
  import { projects, selectedProject } from "@/project";
  import { MACRO_EDITOR_SELECTED_MACRO, newMacro, type Macro } from "./macro";

  $: list = $projects.find((p) => p.name === $selectedProject)?.macros || [];

  $: selected = MACRO_EDITOR_SELECTED_MACRO;

  const itemName = (shader: Macro): string => {
    return shader.name;
  };

  const add = () => {
    projects.update((p) => {
      let project = p.find((p) => p.name === $selectedProject);
      if (project) {
        const name = prompt("Macro Name") ?? "new macro";
        project.macros.push(newMacro(name));
      }
      return p;
    });
  };

  const remove = () => {
    projects.update((p) => {
      let project = p.find((p) => p.name === $selectedProject);
      if (project) {
        let index = project.macros.findIndex((s) => s.name === $selected);

        if (index !== -1) {
          if (
            window.confirm(
              `Are you sure you want to delete ${project.macros[index].name}?`,
            ) === false
          ) {
            return p;
          }

          project.macros.splice(index, 1);

          selected?.set(
            project.macros[index]?.name ||
              project.macros[index - 1]?.name ||
              "",
          );
        }
      }
      return p;
    });
  };

  const onSelect = (shader: Macro) => {
    selected?.set(shader.name);
  };
</script>

<button on:click={add}> + </button>
<button on:click={remove}> - </button>
<ul>
  {#each list as item}
    <li class:selected={itemName(item) === $selected}>
      <button on:click={() => onSelect(item)}>
        <img class="icon" src="icons/file.svg" alt="file" />
        {itemName(item)}
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
