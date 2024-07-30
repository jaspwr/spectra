<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
  // @ts-ignore
  import { initVimMode } from "monaco-vim";
  import { projects, selectedProject } from "../project";

  let editor: Monaco.editor.IStandaloneCodeEditor;
  let monaco: typeof Monaco;
  let editorContainer: HTMLElement;

  let vimCtx: any;
  export let vimMode = false;

  $: project = $projects.find((p) => p.name === $selectedProject);
  $: selectedFile = project?.selectedShaderFile;
  $: file = project?.shaderFiles.find((s) => s.filename === $selectedFile);

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

    editor.onDidChangeModelContent(() => {
      if (!file) return;
      file.updateContents(editor.getValue());
    });
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
