export interface Presentation {
  slides: Slide[];
  previousScene?: string;
  nextScene?: string;
}

export interface Slide {
  title?: string;
  columns: Column[];
}

export enum ColumnType {
  Markdown = "markdown",
  GlWindow = "gl-window",
  CodeEditor = "shader-editor",
}

export interface Column {
  type: ColumnType;
  markdownContent?: string;
  filename?: string;
}

export const DEFAULT_PRESENTATION: Presentation = {
  slides: [
    {
      columns: [
        {
          type: ColumnType.GlWindow,
        },
        {
          type: ColumnType.CodeEditor,
        }
      ],
    },
  ]
}
