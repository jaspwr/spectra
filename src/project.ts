import { get } from "svelte/store";
import { notify } from "./components/Notification/notifications";
import { Shader } from "./gl/shader";
import { PRESENTATION, type Presentation } from "./presentation";
import {
  deserialize,
  scenes,
  selectedScene,
  serialize,
  type Scene,
} from "./scene";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function loadProject(metaUrl: string) {
  try {
    const projectMeta = (await (await fetch(metaUrl)).json()) as ProjectMeta;
    const location = metaUrl.split("/").slice(0, -1).join("/");
    const urlParams = metaUrl.includes("?") ? metaUrl.slice(metaUrl.indexOf("?")) : "";

    scenes.set(
      await Promise.all(projectMeta.scenes.map((s) => loadScene(location, s, urlParams))),
    );
    PRESENTATION.set(projectMeta.presentation);
    selectedScene.set(get(scenes)[0]?.name ?? "");
  } catch (e) {
    notify(`Failed to load project: ${e}`);
  }
}

async function loadScene(location: string, sceneName: string, urlParams: string): Promise<Scene> {
  console.log("Loading scene", sceneName);
  const sceneLocation = `${location}/scenes/${sceneName}`;
  const scene = await (await fetch(`${sceneLocation}/scene.json${urlParams}`)).json();

  const shaders = await Promise.all(
    scene.shaders.map(async (s: any) => [
      s.filename,
      await loadShader(sceneLocation, s.filename, urlParams),
    ]),
  );
  scene.shaders = shaders.map(([filename, contents]) => ({
    filename,
    contents,
  }));

  return deserialize(JSON.stringify(scene));
}

async function loadShader(location: string, filename: string, urlParams: string): Promise<string> {
  const content = await (await fetch(`${location}/${filename}${urlParams}`)).text();
  return content;
}

interface ProjectMeta {
  scenes: string[];
  presentation: Presentation;
}

export function exportProject() {
  try {
    const zip = new JSZip();

    const sceneNames: string[] = [];
    const scenesFolder = zip.folder("scenes");

    if (scenesFolder === null)
      throw new Error("Failed to create folder in zip");
    for (const scene of get(scenes)) {
      const serializedScene = serialize(scene);
      const folder = scenesFolder.folder(scene.name);

      if (folder === null) throw new Error("Failed to create folder in zip");

      for (const shader of serializedScene.shaders) {
        folder.file(shader.filename, shader.contents);
      }

      folder.file("scene.json", JSON.stringify(serializedScene));
      sceneNames.push(scene.name);
    }
    const presentation = get(PRESENTATION);

    const projectMeta: ProjectMeta = {
      scenes: sceneNames,
      presentation,
    };

    zip.file("project.json", JSON.stringify(projectMeta));

    zip.generateAsync({ type: "blob" }).then(function(content) {
      saveAs(content, "project.zip");
    });
  } catch (e) {
    notify(`Failed to export project: ${e}`);
  }
}
