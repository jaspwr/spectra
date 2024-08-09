<script lang="ts">
  import type { Scene } from "@/scene";
  import CloseButton from "./CloseButton.svelte";
  import {
    type Presentation,
    DEFAULT_PRESENTATION,
    ColumnType,
    PRESENTATION,
  } from "@/presentation";
  import GlWindow from "./GlWindow.svelte";
  import CodeEditor from "./CodeEditor.svelte";
  import { marked } from "marked";
  import katex from "marked-katex-extension";
  import Markdown from "svelte-markdown";
  import KatexRenderer from "./KatexRenderer.svelte";
  import { onDestroy, onMount } from "svelte";

  marked.use(katex({ throwOnError: true }));
  const options = marked.defaults;
  const renderers = { blockKatex: KatexRenderer, inlineKatex: KatexRenderer };

  export let onClose: () => void;
  export let scene: Scene;
  export let recompile: () => void;

  $: presentation = $PRESENTATION;

  let slideIndex = 0;

  $: slide = presentation.slides[slideIndex];

  $: console.log(JSON.stringify(presentation));

  const nextSlide = () => {
    slideIndex = Math.min(presentation.slides.length - 1, slideIndex + 1);
  };
  const prevSlide = () => {
    slideIndex = Math.max(0, slideIndex - 1);
  };

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === " ") {
      nextSlide();
    } else if (e.key === "ArrowLeft") {
      prevSlide();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  });

  const handleConent = (content: string | string[] | undefined): string => {
    if (content === undefined) {
      return "";
    }

    if (Array.isArray(content)) {
      return content.join("\n");
    }

    return content;
  };
</script>

<CloseButton {onClose} />

{#if slide.title !== undefined}
  <h1 class="title">{slide.title}</h1>
{/if}
<div class="content">
  {#each slide.columns as column}
    <div class="column">
      {#if column.type === ColumnType.Markdown}
        <Markdown
          source={handleConent(column.markdownContent)}
          {renderers}
          {options}
        />
      {:else if column.type === ColumnType.GlWindow}
        <GlWindow {scene} />
        <button on:click={recompile} class="recompile">Recompile</button>
      {:else if column.type === ColumnType.CodeEditor}
        <CodeEditor />
      {/if}
    </div>
  {/each}
</div>

<div class="slide-controls">
  <button on:click={prevSlide}>&lt;</button>
  <span>{slideIndex + 1}/{presentation.slides.length}</span>
  <button on:click={nextSlide}> &gt; </button>
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
