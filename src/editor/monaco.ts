import * as monaco from "monaco-editor";

import "./glsl";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
self.MonacoEnvironment = {
  getWorker: (_, label: string) => new editorWorker(),
};

export default monaco;
