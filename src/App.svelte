<script lang="ts">
  import PipelineEditor from "./lib/PipelineEditor/PipelineEditor.svelte";
  import {
    projects,
    selectedProject,
    serialize,
    type Project,
  } from "./project";
  import { FPS, GL_ERRORS } from "./utils";

  import CodeEditor from "./lib/CodeEditor.svelte";
  import ErrorList from "./lib/ErrorList.svelte";
  import FileTree from "./lib/FileTree.svelte";
  import GlWindow from "./lib/GlWindow.svelte";
  import Goals from "./lib/Goals.svelte";
  import { SvelteFlowProvider } from "@xyflow/svelte";

  let _selected = $selectedProject;
  $: selectedProject.set(_selected);

  let editorVimMode = false;

  $: project = $projects.find((p) => p.name === $selectedProject);
  let displayingProject: Project | null = null;

  const recompile = () => {
    GL_ERRORS.set([]);
    projects.update((p) => p);
    if (project === undefined) return;
    displayingProject = project;
  };

  let forcingRerender = false;

  const forceRerender = () => {
    forcingRerender = true;
    setTimeout(() => {
      forcingRerender = false;
    }, 10);
  };

  let preProjectName = "";
  $: if (preProjectName !== _selected) {
    preProjectName = _selected;
    recompile();
    forceRerender();
  }

  recompile();

  const save = () => {
    console.log(project !== undefined && serialize(project));
  };
</script>

<div class="layout">
  <div class="top-bar">
    <div class="top-bar-item" style="padding-left: 1rem">
      FPS: <span class="fps">{Math.round($FPS * 100) / 100}</span>
    </div>
    <div class="top-bar-item">
      <button on:click={recompile}>Recompile</button>
      <button on:click={save}>Save</button>
    </div>
    <div class="top-bar-item">
      Project:
      <select bind:value={_selected}>
        {#each $projects as project}
          <option>{project.name}</option>
        {/each}
      </select>
    </div>
    <div class="top-bar-item checkbox-and-label">
      <input type="checkbox" bind:checked={editorVimMode} />
      Vim Mode
    </div>
  </div>
  <div class="gl-window">
    <div class:hide={$GL_ERRORS.length > 0} class="gl-container">
      <GlWindow project={displayingProject} />
    </div>
    {#if $GL_ERRORS.length > 0}
      <ErrorList errors={$GL_ERRORS} />
    {/if}
  </div>
  <div class="code-editor">
    <CodeEditor vimMode={editorVimMode} />
  </div>
  <div class="pipeline-editor">
    {#if project !== undefined && !forcingRerender}
      <SvelteFlowProvider>
        <PipelineEditor
          nodes={project.pipelineGraph.nodes}
          edges={project.pipelineGraph.edges}
        />
      </SvelteFlowProvider>
    {/if}
  </div>

  <div class="sidebar">
    <div class="file-tree">
      <FileTree />
    </div>
    <div class="goals">
      <hr/>
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
    display: flex;
    align-items: center;
  }

  .top-bar-item {
    margin-right: 20px;
    border-right: 1px solid var(--text-sec);
    padding-right: 20px;
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

  .fps {
    display: inline-block;
    min-width: 40px;
  }
</style>
