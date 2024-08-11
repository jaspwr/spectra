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
  import { selectedScene, type Scene } from "@/scene";
  import CloseButton from "./CloseButton.svelte";
  import { ColumnType, PRESENTATION } from "@/presentation";
  import GlWindow from "./GlWindow.svelte";
  import CodeEditor from "./CodeEditor.svelte";
  import { marked } from "marked";
  import katex from "marked-katex-extension";
  import Markdown from "svelte-markdown";
  import KatexRenderer from "./KatexRenderer.svelte";
  import { onMount } from "svelte";
  import { scenes } from "@/scene";

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

  const onSlideChange = () => {
    slide = presentation.slides[slideIndex];
    selectedScene.set(slide.project);
    const scene = $scenes.find((s) => s.name === slide.project);
    if (scene === undefined) return;

    const sourceFile: string | null = null;

    for (const col of slide.columns) {
      if (col.type === ColumnType.CodeEditor && col.filename !== undefined) {
        scene.selectedShaderFile.set(col.filename);
        break;
      }
    }

    if (sourceFile === null) return;

    scene.selectedShaderFile.set(sourceFile);
  };

  const nextSlide = () => {
    slideIndex = Math.min(presentation.slides.length - 1, slideIndex + 1);
    onSlideChange();
  };
  const prevSlide = () => {
    slideIndex = Math.max(0, slideIndex - 1);
    onSlideChange();
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

  const styles = {
    textPrimary: "#fff",
    textSecondary: "#adadad",
    background: "#0d0d0d",
    icon: "progsoc.png",
  };
</script>

<CloseButton {onClose} />
<h1 class="title" style="color: {styles.textPrimary}">
  {#if styles.icon !== undefined}
    <img class="icon" src="progsoc.png" alt="icon" />
  {/if}
  {#if slide.title !== undefined}
    {slide.title}
  {/if}
</h1>

<div
  class="content"
  style="background: {styles.background}; color: {styles.textSecondary};"
>
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
    z-index: 100;
    display: flex;
    align-items: center;
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

  .icon {
    width: 4rem;
    margin-right: 3rem;
  }
</style>
