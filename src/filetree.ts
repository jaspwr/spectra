import { get, writable, type Writable } from "svelte/store";
import { Shader, ShaderType } from "./gl/shader";
import { projects, selectedProject } from "@/project";
import { MACRO_EDITOR_SELECTED_MACRO, newMacro, type Macro } from "./macro";

export abstract class FileTreeProvider<Item> {
  selected: Writable<string> = writable("");
  list: Writable<Item[]> = writable([]);

  abstract iconPath(item: Item): string | null;
  abstract itemName(item: Item): string;
  abstract add(): void;
  abstract remove(): void;
  abstract rename(item: Item, name: string): void;
}

export class ShaderFilesProvider extends FileTreeProvider<Shader> {
  constructor() {
    super();

    projects.subscribe(() => this.setList());
    selectedProject.subscribe(() => this.setList());
    projects.subscribe(() => this.setSelected());

    this.setList();
    this.setSelected();
  }

  private setList() {
    const project = get(projects).find((p) => p.name === get(selectedProject));
    if (project) {
      this.list.set(project.shaderFiles);
    }
  }

  private setSelected() {
    const project = get(projects).find((p) => p.name === get(selectedProject));
    if (project?.selectedShaderFile) {
      this.selected = project.selectedShaderFile;
    }
  }

  iconPath(shader: Shader): string | null {
    switch (shader.data.type) {
      case ShaderType.Frag:
        return "icons/file-fragment-shader.svg";
      case ShaderType.Vert:
        return "icons/file-vertex-shader.svg";
      case ShaderType.Comp:
        return "icons/file-compute-shader.svg";
      default:
        return null;
    }
  };

  itemName(shader: Shader): string {
    return shader.filename;
  };

  add() {
    projects.update((p) => {
      let project = p.find((p) => p.name === get(selectedProject));
      if (project) {
        const name = prompt("Shader name") ?? "_.frag";
        project.shaderFiles.push(new Shader(name, ""));
      }
      return p;
    });
  };

  remove() {
    projects.update((p) => {
      let project = p.find((p) => p.name === get(selectedProject));
      if (project) {
        let index = project.shaderFiles.findIndex(
          (s) => s.filename === get(this.selected),
        );

        if (index !== -1) {
          if (
            window.confirm(
              `Are you sure you want to delete ${project.shaderFiles[index].filename}?`,
            ) === false
          ) {
            return p;
          }

          project.shaderFiles.splice(index, 1);

          this.selected?.set(
            project.shaderFiles[index]?.filename ||
            project.shaderFiles[index - 1]?.filename ||
            "",
          );
        }
      }
      return p;
    });
  };

  rename(item: Shader, name: string) {
    item.updateFilename(name);
  };
}

export class MacroProvider extends FileTreeProvider<Macro> {
  constructor() {
    super();
    this.selected = MACRO_EDITOR_SELECTED_MACRO;

    projects.subscribe(() => this.setList());
    selectedProject.subscribe(() => this.setList());

    this.setList();
  }

  private setList() {
    const project = get(projects).find((p) => p.name === get(selectedProject));
    if (project) {
      this.list.set(project.macros);
    }
  }

  iconPath(_: Macro): string | null {
    return "icons/file.svg";
  }

  itemName(macro: Macro): string {
    return macro.name;
  }

  add() {
    projects.update((p) => {
      let project = p.find((p) => p.name === get(selectedProject));
      if (project) {
        const name = prompt("Macro Name") ?? "new macro";
        project.macros.push(newMacro(name));
      }
      return p;
    });
  }

  remove() {
    projects.update((p) => {
      let project = p.find((p) => p.name === get(selectedProject));
      if (project) {
        let index = project.macros.findIndex((s) => s.name === get(this.selected));

        if (index !== -1) {
          if (
            window.confirm(
              `Are you sure you want to delete ${project.macros[index].name}?`,
            ) === false
          ) {
            return p;
          }

          project.macros.splice(index, 1);

          this.selected.set(
            project.macros[index]?.name ||
            project.macros[index - 1]?.name ||
            "",
          );
        }
      }
      return p;
    });
  }

  rename(item: Macro, name: string) {
    item.name = name;
  }
}
