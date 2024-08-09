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
  import { onDestroy, onMount } from "svelte";
  import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
  // @ts-ignore
  import { initVimMode } from "monaco-vim";
  import { scenes, selectedScene } from "../scene";
  import { GL_CONTEXT } from "@/utils";

  let editor: Monaco.editor.IStandaloneCodeEditor;
  let monaco: typeof Monaco;
  let editorContainer: HTMLElement;

  let vimCtx: any;
  export let vimMode = false;

  $: scene = $scenes.find((p) => p.name === $selectedScene);
  $: selectedFile = scene?.selectedShaderFile;
  $: file = scene?.shaderFiles.find((s) => s.filename === $selectedFile);
  $: console.log(selectedFile);

  $: showEditor = $selectedFile !== undefined && file;

  $: if (file) {
    editor?.setValue(file.contents);
  }

  $: if (editor) {
    if (vimMode) {
      vimCtx = initVimMode(editor, document.getElementById("my-statusbar"));
    } else {
      vimCtx?.dispose();
    }
  }

  onMount(async () => {
    monaco = (await import("../editor/monaco")).default;

    editor = monaco.editor.create(
      editorContainer,
      {
        theme: "glsl-theme",

        cursorBlinking: "smooth",

        colorDecorators: true,

        minimap: {
          enabled: false,
        },

        suggest: {
          showInlineDetails: true,
          snippetsPreventQuickSuggestions: false,
        },

        "semanticHighlighting.enabled": true,
      },
      {
        storageService: {
          get() {},
          remove() {},
          getBoolean(key: string) {
            if (key === "expandSuggestionDocs") return true;
          },
          getNumber(key: string) {},
          store() {},
          onWillSaveState() {},
          onDidChangeStorage() {},
          onDidChangeValue() {},
        },
      },
    );

    const model = monaco.editor.createModel("", "glsl");
    editor.setModel(model);

    let timeout: null | number = null;

    const decorationsCollection = editor.createDecorationsCollection();

    editor.onDidChangeModelContent(() => {
      if (!file) return;
      file.updateContents(editor.getValue());
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (GL_CONTEXT.gl === null) return;
        const lints = file.lint(GL_CONTEXT.gl);

        const newDecorations = lints
          .map((lint) => [
            {
              range: lint.range,
              options: {
                inlineClassName: `lint-${lint.severity}`,
                hoverMessage: {
                  value: lint.message,
                },
              },
            },
          ])
          .flat();
        decorationsCollection.set(newDecorations);
      }, 1500);
    });

    const styleElement = document.createElement("style");
    styleElement.textContent = `
    .lint-error {
        text-decoration: underline;
        text-decoration-color: red;
        text-decoration-style: wavy;
    }

    .lint-warning {
        text-decoration: underline;
        text-decoration-color: yellow;
        text-decoration-style: wavy;
    } 
`;
    document.head.append(styleElement);

    // https://github.com/bitburner-official/bitburner-src/pull/1470/files
    if (editorContainer.firstElementChild) {
      (editorContainer.firstElementChild as HTMLElement).style.outline = "none";
    }
  });

  onDestroy(() => {
    monaco?.editor.getModels().forEach((model) => model.dispose());
    editor?.dispose();
  });
</script>

<div class:hide={!showEditor} class="editor" bind:this={editorContainer} />

<svelte:window
  on:resize={() => {
    if (!editor || !editorContainer) return;

    editor.layout({ width: 0, height: 0 });
    window.requestAnimationFrame(() => {
      if (editorContainer?.parentElement === null) return;

      const rect = editorContainer.parentElement.getBoundingClientRect();
      editor.layout({ width: rect.width, height: rect.height });
    });
  }}
/>

<style>
  .editor {
    width: 100%;
    height: 100%;
    background-color: var(--bg-sec);
  }

  .hide {
    display: none;
  }
</style>
