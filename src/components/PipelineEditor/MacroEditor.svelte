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
  import { SvelteFlowProvider } from "@xyflow/svelte";
  import PipelineEditor from "./PipelineEditor.svelte";
  import { MACRO_EDITOR_SELECTED_MACRO, newMacro } from "@/macro";
  import FileTree from "@/components/FileTree/FileTree.svelte";
  import { scenes, selectedScene, type Scene } from "@/scene";
  import { MacroProvider } from "@/filetree";

  $: scene = $scenes.find((p) => p.name === $selectedScene);
  $: macro = scene?.macros.find((m) => m.name === $MACRO_EDITOR_SELECTED_MACRO);

  $: inputLabels = macro?.inputLabels;

  let forcingRerender = false;

  const forceRerender = () => {
    forcingRerender = true;
    setTimeout(() => {
      forcingRerender = false;
    }, 10);
  };

  $: inputLabels?.subscribe(() => {
    forceRerender();
  });

  MACRO_EDITOR_SELECTED_MACRO.subscribe(forceRerender);

  $: if (macro === undefined && (scene?.macros.length ?? 0 > 0)) {
    MACRO_EDITOR_SELECTED_MACRO.set(scene!.macros[0].name);
    macro = scene?.macros.find((m) => m.name === $MACRO_EDITOR_SELECTED_MACRO);
  }
</script>

<div class="layout">
  <div class="file-tree">
    <FileTree provider={new MacroProvider()} />
  </div>
  {#if macro === undefined}
    <div class="center">
      <p>No macros found in the scene.</p>
    </div>
  {:else}
    <div class="macro-meta">
      {#if inputLabels !== undefined && $inputLabels !== undefined}
        <h1>Macro Editor</h1>
        <hr />
        <button
          on:click={() => {
            inputLabels.update((l) => {
              l.push("new input");
              return l;
            });
          }}>Add Input</button
        >
        {#each $inputLabels as inputLabel, i}
          <br />
          <input type="text" bind:value={inputLabel} />
          <button
            on:click={() => {
              inputLabels.update((l) => {
                l.splice(i, 1);
                return l;
              });
            }}>Remove</button
          >
        {/each}
        <hr />
      {/if}
    </div>
    <div class="macro-node-editor">
      {#if !forcingRerender}
        <SvelteFlowProvider>
          <PipelineEditor
            nodes={macro.nodes}
            edges={macro.edges}
            isMacro={true}
          />
        </SvelteFlowProvider>
      {/if}
    </div>
  {/if}
</div>

<style>
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .layout {
    position: static;
    width: calc(100%);
    height: calc(100%);

    display: grid;
    grid-template-columns: 1.8fr 210px;
    grid-template-rows: 0.6fr 1.4fr;
    grid-auto-columns: 1fr;
    grid-auto-rows: 1fr;
    gap: 0px 0px;
    grid-auto-flow: row;
    grid-template-areas:
      "macro-meta file-tree"
      "macro-node-editor file-tree";
  }

  .file-tree {
    grid-area: file-tree;
    background-color: var(--bg-sec);
  }

  .macro-meta {
    padding: 20px;
    grid-area: macro-meta;
    overflow-y: scroll;
    background-color: var(--bg-sec);
  }

  .macro-node-editor {
    grid-area: macro-node-editor;
  }
</style>
