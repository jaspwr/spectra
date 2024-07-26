<script lang="ts">
  import PipelineEditor from "./lib/PipelineEditor.svelte";
  import { projects, selectedProject, type Project } from "./project";

  import CodeEditor from "./lib/CodeEditor.svelte";
  import ErrorList from "./lib/ErrorList.svelte";
  import FileTree from "./lib/FileTree.svelte";
  import GlWindow from "./lib/GlWindow.svelte";
  import Goals from "./lib/Goals.svelte";

  let _selected = $selectedProject;
  $: selectedProject.set(_selected);

  let editorVimMode = false;
  let errors: string[] = [];

  $: project = $projects.find((p) => p.name === $selectedProject);
  let displayingProject: Project | null = null;

  const recompile = () => {
    projects.update((p) => p);
    if (project === undefined) return;
    displayingProject = project;
  };

  const setErrors = (errs: string[]) => {
    errors = errs;
  };

  let preProjectName = "";
  $: if (preProjectName !== _selected) {
    preProjectName = _selected;
    recompile();
  }

  $: console.log(errors);

  recompile();
</script>

<div class="layout">
  <div class="top-bar">
    Project:
    <select bind:value={_selected}>
      {#each $projects as project}
        <option>{project.name}</option>
      {/each}
    </select>

    Vim Mode
    <input type="checkbox" bind:checked={editorVimMode} />

    <button on:click={recompile}>Recompile</button>
  </div>
  <div class="gl-window">
    <div class:hide={errors.length > 0} class="gl-container">
      <GlWindow project={displayingProject} {setErrors} />
    </div>
    {#if errors.length > 0}
      <ErrorList {errors} />
    {/if}
  </div>
  <div class="code-editor">
    <CodeEditor vimMode={editorVimMode} />
  </div>
  <div class="pipeline-editor">
    <PipelineEditor />
  </div>

  <div class="sidebar">
    <div class="file-tree">
      <FileTree />
    </div>
    <div class="goals">
      <Goals />
    </div>
  </div>
</div>

<style>
  .layout {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1.2fr 1.8fr 0.4fr;
    grid-template-rows: 0.12fr 1.5fr 1.4fr;
    grid-auto-columns: 1fr;
    grid-auto-rows: 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      "top-bar top-bar top-bar"
      "gl-window code-editor sidebar"
      "pipeline-editor code-editor sidebar";
  }

  .gl-window {
    grid-area: gl-window;
  }

  .code-editor {
    grid-area: code-editor;
  }

  .pipeline-editor {
    grid-area: pipeline-editor;
  }

  .top-bar {
    grid-area: top-bar;
  }

  .sidebar {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      "file-tree"
      "goals";
    grid-area: sidebar;
  }

  .file-tree {
    grid-area: file-tree;
  }

  .goals {
    grid-area: goals;
  }

  .gl-container {
    width: 100%;
    height: 100%;
  }

  .hide {
    display: none;
  }
</style>
