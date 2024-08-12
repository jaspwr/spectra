import { get, writable, type Writable } from "svelte/store";
import { Shader, ShaderType } from "./gl/shader";
import {
  deserialize,
  scenes,
  selectedScene,
  serialize,
  type Scene,
} from "@/scene";
import { MACRO_EDITOR_SELECTED_MACRO, newMacro, type Macro } from "./macro";
import { notify } from "./components/Notification/notifications";

export abstract class FileTreeProvider<Item> {
  selected: Writable<string> = writable("");
  list: Writable<Item[]> = writable([]);

  abstract iconPath(item: Item): string | null;
  abstract itemName(item: Item): string;
  abstract add(): void;
  abstract remove(): void;
  abstract rename(item: Item, name: string): void;
  abstract duplicate(item: Item): void;
}

export class ShaderFilesProvider extends FileTreeProvider<Shader> {
  constructor() {
    super();

    scenes.subscribe(() => {
      this.setList()
      this.setSelected();
    });
    selectedScene.subscribe(() => {
      this.setList();
      this.setSelected();
    });

    this.setList();
    this.setSelected();
  }

  private setList() {
    const scene = get(scenes).find((p) => p.name === get(selectedScene));
    if (scene) {
      this.list.set(scene.shaderFiles);
    }
  }

  private setSelected() {
    const scene = get(scenes).find((p) => p.name === get(selectedScene));
    if (scene?.selectedShaderFile) {
      this.selected = scene.selectedShaderFile;
      this.setList();
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
  }

  itemName(shader: Shader): string {
    return shader.filename;
  }

  add() {
    scenes.update((p) => {
      let scene = p.find((p) => p.name === get(selectedScene));
      if (scene) {
        const name = prompt("Shader name") ?? "_.frag";
        scene.shaderFiles.push(new Shader(name, ""));
      }
      return p;
    });
  }

  remove() {
    scenes.update((p) => {
      let scene = p.find((p) => p.name === get(selectedScene));
      if (scene) {
        let index = scene.shaderFiles.findIndex(
          (s) => s.filename === get(this.selected),
        );

        if (index !== -1) {
          scene.shaderFiles.splice(index, 1);

          this.selected?.set(
            scene.shaderFiles[index]?.filename ||
            scene.shaderFiles[index - 1]?.filename ||
            "",
          );
        }
      }
      return p;
    });
  }

  rename(item: Shader, name: string) {
    item.updateFilename(name);
    scenes.update((p) => p);
  }

  duplicate(item: Shader) {
    scenes.update((p) => {
      let scene = p.find((p) => p.name === get(selectedScene));
      if (scene) {
        const fileName = item.filename.split(".").slice(0, -1).join(".");
        const ext = item.filename.split(".").slice(-1)[0];

        let number = 1;
        const newName = () => `${fileName}_${number}.${ext}`;
        while (scene.shaderFiles.find((s) => s.filename === newName()) !== undefined) {
          number += 1;
        }

        scene.shaderFiles.push(new Shader(newName(), item.contents));
      }
      return p;
    });
  }
}

export class MacroProvider extends FileTreeProvider<Macro> {
  constructor() {
    super();
    this.selected = MACRO_EDITOR_SELECTED_MACRO;

    scenes.subscribe(() => this.setList());
    selectedScene.subscribe(() => this.setList());

    this.setList();
  }

  private setList() {
    const scene = get(scenes).find((p) => p.name === get(selectedScene));
    if (scene) {
      this.list.set(scene.macros);
    }
  }

  iconPath(_: Macro): string | null {
    return "icons/file.svg";
  }

  itemName(macro: Macro): string {
    return macro.name;
  }

  add() {
    scenes.update((p) => {
      let scene = p.find((p) => p.name === get(selectedScene));
      if (scene) {
        const name = prompt("Macro Name") ?? "new macro";
        scene.macros.push(newMacro(name));
      }
      return p;
    });
  }

  remove() {
    scenes.update((p) => {
      let scene = p.find((p) => p.name === get(selectedScene));
      if (scene) {
        let index = scene.macros.findIndex(
          (s) => s.name === get(this.selected),
        );

        if (index !== -1) {
          scene.macros.splice(index, 1);

          this.selected.set(
            scene.macros[index]?.name || scene.macros[index - 1]?.name || "",
          );
        }
      }
      return p;
    });
  }

  rename(item: Macro, name: string) {
    item.name = name;
  }

  duplicate(item: Macro) {
    notify("Unimplemented");
  }
}

export class SceneProvider extends FileTreeProvider<Scene> {
  constructor() {
    super();
    this.list = scenes;
  }

  iconPath(_: Scene): string | null {
    return "icons/teapot.svg";
  }

  itemName(scene: Scene): string {
    return scene.name;
  }

  add() {
    scenes.update((p) => {
      const name = prompt("Scene Name") ?? "new scene";
      p.push({
        name,
        goals: [],
        shaderFiles: [],
        pipelineGraph: {
          nodes: writable([]),
          edges: writable([]),
        },
        macros: [],
        selectedShaderFile: writable(""),
      });
      return p;
    });
  }

  remove() {
    scenes.update((p) => {
      let index = p.findIndex((s) => s.name === get(this.selected));
      if (index !== -1) {
        p.splice(index, 1);

        this.selected.set(p[index]?.name || p[index - 1]?.name || "");
      }
      return p;
    });
  }

  rename(item: Scene, name: string) {
    item.name = name;
    scenes.update((p) => p);
  }

  duplicate(item: Scene) {
    const cpy = deserialize(JSON.stringify(serialize(item)));

    let number = 1;
    const newName = () => `${item.name}_${number}`;
    while (get(this.list).find((s) => s.name === newName()) !== undefined) {
      number += 1;
    }

    cpy.name = newName();
    scenes.update((p) => {
      p.push(cpy);
      return p;
    });
  }
}
