import { get } from "svelte/store";
import { notify } from "./components/Notification/notifications";
import { Shader } from "./gl/shader";
import { PRESENTATION, type Presentation } from "./presentation";
import { deserialize, scenes, selectedScene, type Scene } from "./scene";

export async function loadProject(metaUrl: string) {
  try {
    const projectMeta = await (await fetch(metaUrl)).json() as ProjectMeta;
    const location = metaUrl.split("/").slice(0, -1).join("/");

    scenes.set(await Promise.all(projectMeta.scenes.map(s => loadScene(location, s))));
    PRESENTATION.set(projectMeta.presentation);
    selectedScene.set(get(scenes)[0]?.name ?? "");
  } catch (e) {
    notify(`Failed to load project: ${e}`);
  }
}

async function loadScene(location: string, sceneName: string): Promise<Scene> {
  const sceneLocation = `${location}/scenes/${sceneName}`;
  console.log(`${sceneLocation}/scene.json`);
  const scene = await (await fetch(`${sceneLocation}/scene.json`)).json();

  const shaders = await Promise.all(scene.shaders.map(async (s: any) => [s.filename, await loadShader(sceneLocation, s.filename)]));
  scene.shaders = shaders.map(([filename, contents]) => ({
    filename,
    contents
  }));

  return deserialize(JSON.stringify(scene));
}

async function loadShader(location: string, filename: string): Promise<string> {
  const content = await (await fetch(`${location}/${filename}`)).text();
  return content;
}

interface ProjectMeta {
  scenes: string[];
  presentation: Presentation;
}
