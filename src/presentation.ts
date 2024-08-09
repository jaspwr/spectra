import { writable, type Writable } from "svelte/store";

export interface Presentation {
  slides: Slide[];
}

export interface Slide {
  title?: string;
  project: string;
  columns: Column[];
}

export enum ColumnType {
  Markdown = "markdown",
  GlWindow = "gl-window",
  CodeEditor = "shader-editor",
}

export interface Column {
  type: ColumnType;
  markdownContent?: string | string[];
  filename?: string;
}

export const DEFAULT_PRESENTATION: Presentation = {
  slides: [
    {
      title: "Hello, World!",
      project: "Intro",
      columns: [
        {
          type: ColumnType.Markdown,
          markdownContent: `# Welcome to the *presentation*!`
        },
        {
          type: ColumnType.GlWindow,
        },
        {
          type: ColumnType.CodeEditor,
          filename: "main.frag",
        }
      ],
    },
  ]
}

export const PRESENTATION: Writable<Presentation> = writable(DEFAULT_PRESENTATION);
