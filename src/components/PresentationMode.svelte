<script lang="ts">
  import type { Project } from "@/project";
  import CloseButton from "./CloseButton.svelte";
  import {
    type Presentation,
    DEFAULT_PRESENTATION,
    ColumnType,
  } from "@/presentation";
  import GlWindow from "./GlWindow.svelte";
  import CodeEditor from "./CodeEditor.svelte";
  import { marked } from "marked";
  import katex from "marked-katex-extension";
  import Markdown from "svelte-markdown";
  import KatexRenderer from "./KatexRenderer.svelte";

  marked.use(katex({ throwOnError: true }));
  const options = marked.defaults;
  const renderers = { blockKatex: KatexRenderer, inlineKatex: KatexRenderer };

  export let onClose: () => void;
  export let project: Project;
  export let recompile: () => void;

  let presentation: Presentation = project.presentation ?? DEFAULT_PRESENTATION;

  let slideIndex = 0;

  $: slide = presentation.slides[slideIndex];
</script>

<CloseButton {onClose} />

{#if slide.title !== undefined}
  <h1 class="title">{slide.title}</h1>
{/if}
<div class="content">
  {#each slide.columns as column}
    <div class="column">
      {#if column.type === ColumnType.Markdown}
        <Markdown source={column.markdownContent} {renderers} {options} />
      {:else if column.type === ColumnType.GlWindow}
        <GlWindow {project} />
        <button on:click={recompile} class="recompile">Recompile</button>
      {:else if column.type === ColumnType.CodeEditor}
        <CodeEditor />
      {/if}
    </div>
  {/each}
</div>

<div class="slide-controls">
  <button on:click={() => (slideIndex = Math.max(0, slideIndex - 1))}>&lt;</button>
  <span>{slideIndex + 1}/{presentation.slides.length}</span>
  <button on:click={() => (slideIndex = Math.min(presentation.slides.length - 1, slideIndex + 1))}>
    &gt;
  </button>
</div>

<style>
  .content {
    overflow: hidden;
    display: flex;
    gap: 2rem;
    flex-direction: row;
    justify-content: center;
    height: calc(100% - 13rem);
    width: calc(100% - 10rem);
    position: absolute;
    top: 0;
    left: 0;
    padding: 5rem;
    padding-top: 8rem;
  }

  .column {
    width: 100%;
    height: 100%;
  }

  .title {
    position: absolute;
    top: 0px;
    left: 50px;
    font-size: 3.6rem;
  }

  .slide-controls {
    position: absolute;
    bottom: 20px;
    right: 50px;
    opacity: 0.35;
    transition: opacity 0.2s;
    display: flex;
    gap: 1rem;
    align-items: center;
    font-size: 1.6rem;
  }

  .slide-controls:hover {
    opacity: 1;
  }

  .slide-controls button {
    background: none;
    border: none;
    font-size: 2rem;
    display: flex;
    align-items: center;
  }

  .recompile {
    opacity: 0.35;
    transition: opacity 0.2s;
  }

  .recompile:hover {
    opacity: 1;
  }
</style>
