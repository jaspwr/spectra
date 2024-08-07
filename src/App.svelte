<!--
  This file is part of Spectra.

  Spectra is free software: you can redistribute it and/or modify it 
  under the terms of the GNU General Public License as published by 
  the Free Software Foundation, either version 3 of the License, or 
  (at your option) any later version.

  Spectra is distributed in the hope that it will be useful, but 
  WITHOUT ANY WARRANTY; without even the implied warranty of 
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
  General Public License for more details.

  You should have received a copy of the GNU General Public License 
  along with Spectra. If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
  import PipelineEditor from "./components/PipelineEditor/PipelineEditor.svelte";
  import {
    projects,
    selectedProject,
    serialize,
    toUrl,
    type Project,
  } from "./project";
  import { FPS, GL_ERRORS, PLAYING } from "./utils";

  import CodeEditor from "./components/CodeEditor.svelte";
  import ErrorList from "./components/ErrorList.svelte";
  import FileTree from "./components/FileTree.svelte";
  import GlWindow from "./components/GlWindow.svelte";
  import Goals from "./components/Goals.svelte";
  import { SvelteFlowProvider } from "@xyflow/svelte";
  import MacroEditor from "./components/PipelineEditor/MacroEditor.svelte";
  import Popout from "./components/Popout.svelte";
  import { nonEmbedUrl, URL_PARAMETERS } from "./url";
  import PlayPauseButton from "./components/PlayPauseButton.svelte";
  import EmbedCreator from "./components/EmbedCreator.svelte";
  import { ShaderFilesProvider } from "./filetree";
  import PresentationMode from "./components/PresentationMode.svelte";

  const isEmbedded = URL_PARAMETERS.isEmbedded;
  let presentationMode = false;

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
    document.title = _selected;
    preProjectName = _selected;
    recompile();
    forceRerender();
  }

  recompile();

  const save = () => {
    if (project === undefined) return;
    const serialized = serialize(project);
    localStorage.setItem(project.name, serialized);
    console.log(serialized);
    const url = toUrl(project);
    console.log(url);
    console.log(
      "url length",
      url.length,
      "uncompressed lenght",
      serialized.length,
    );
    console.log("compression ratio", url.length / serialized.length);
  };

  enum AppState {
    Normal,
    DevelopmentStateInfo,
    EditingMacro,
    CreatingEmbed,
  }

  let appState = URL_PARAMETERS.isEmbedded
    ? AppState.Normal
    : AppState.DevelopmentStateInfo;

  let started = false;
</script>

{#if isEmbedded}
  <div class="embed-layout">
    <div class="embed-top-bar">
      <div style="display: flex; flex-direction: row; align-items: center;">
        <button on:click={recompile}>
          <div class="button-contents">
            <img class="icon" src="icons/cog.svg" alt="recompile" />
            Recompile
          </div>
        </button>
        <div style="padding-left: 8px">
          <PlayPauseButton />
        </div>
      </div>
      <div style="display: flex; align-items: center; padding-right: 1em">
        <a href={nonEmbedUrl()} target="_blank"> View full project </a>
      </div>
    </div>
    <div class="embed-gl-window">
      {#if !URL_PARAMETERS.startIdle || started}
        <div class:hide={$GL_ERRORS.length > 0} class="gl-container">
          <GlWindow project={displayingProject} />
        </div>
        {#if $GL_ERRORS.length > 0}
          <ErrorList errors={$GL_ERRORS} />
        {/if}
      {:else}
        <div class="gl-container">
          <button class="centered" on:click={() => (started = true)}>
            <h1>Click to start</h1>
          </button>
        </div>
      {/if}
    </div>
    <div class="embed-code-editor">
      <CodeEditor vimMode={editorVimMode} />
    </div>
  </div>
{:else if presentationMode && project !== undefined}
  <PresentationMode {recompile} {project} onClose={() => presentationMode = false} />
{:else}
  <div class="layout">
    <div class="top-bar">
      <div class="top-bar-item" style="padding-left: 1rem">
        FPS: <span class="fps">{$FPS.toFixed(2)}</span>
      </div>
      <div class="top-bar-item">
        <PlayPauseButton />
      </div>
      <div class="top-bar-item">
        <button on:click={recompile}>
          <div class="button-contents">
            <img class="icon" src="icons/cog.svg" alt="recompile" />
            Recompile
          </div>
        </button>
        <button on:click={save}>
          <div class="button-contents">
            <img class="icon" src="icons/floppy.svg" alt="save" />
            Save
          </div>
        </button>
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
      <div class="top-bar-item">
        <button on:click={() => (appState = AppState.EditingMacro)}>
          <div class="button-contents">Configure Macros</div>
        </button>
        <button
          on:click={() => (appState = AppState.CreatingEmbed)}
          style="margin-left: 7px;"
        >
          <div class="button-contents">Create Embed</div>
        </button>
        <button
          on:click={() => (presentationMode = true)}
          style="margin-left: 7px;"
        >
          <div class="button-contents">Presentation Mode</div>
        </button>
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
        <FileTree provider={new ShaderFilesProvider()} />
      </div>
      <div class="goals">
        <hr />
        <Goals />
      </div>
    </div>
  </div>
{/if}

{#if appState === AppState.EditingMacro}
  <Popout
    onClose={() => {
      appState = AppState.Normal;
    }}
  >
    <MacroEditor />
  </Popout>
{:else if appState === AppState.DevelopmentStateInfo}
  <Popout
    onClose={() => {
      appState = AppState.Normal;
    }}
  >
    This application is still in development. Some features may not work as
    expected and breaking changed may be introduced.
  </Popout>
{:else if appState === AppState.CreatingEmbed && project !== undefined}
  <Popout
    onClose={() => {
      appState = AppState.Normal;
    }}
  >
    <EmbedCreator {project} />
  </Popout>
{/if}

<style>
  .embed-layout {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1.1fr 1.3fr;
    grid-template-rows: 0.2fr 1.8fr;
    grid-auto-columns: 1fr;
    grid-auto-rows: 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      "embed-top-bar embed-top-bar"
      "embed-gl-window embed-code-editor";
  }

  .embed-top-bar {
    grid-area: embed-top-bar;
    display: flex;
    justify-content: space-between;
  }

  .embed-gl-window {
    grid-area: embed-gl-window;
  }

  .embed-code-editor {
    grid-area: embed-code-editor;
  }

  .layout {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1.2fr 1.8fr 190px;
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
    min-width: 45px;
  }

  .icon {
    height: 1.2em;
  }

  .button-contents {
    display: flex;
    align-items: center;
    gap: 0.5em;
    cursor: pointer;
  }

  .centered {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }
</style>
