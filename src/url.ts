/**
 * @member {string} scene - The compressed base64 scene string.
 * @member {string} defaultSourceFile - The name of the shader file to open by default.
 * @member {boolean} startIdle - If true, the GL window will have a button saying "click to start" instead of starting automatically.
 * @member {boolean} startPaused - If true, the GL window will start paused.
 * */
interface UrlParameters {
  isEmbedded?: boolean;
  scene?: string;
  defaultSourceFile?: string;
  startIdle?: boolean;
  startPaused?: boolean;
}

const url = new URL(window.location.href);

export const URL_PARAMETERS: UrlParameters = {
  isEmbedded: url.searchParams.get("embedded") == "true",
  startIdle: url.searchParams.get("startIdle") == "true",
  scene: url.searchParams.get("scene") ?? url.searchParams.get("project") ?? undefined, // project is deprecated
  defaultSourceFile: url.searchParams.get("defaultSourceFile") ?? undefined,
  startPaused: url.searchParams.get("startPaused") == "true",
};

export function nonEmbedUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.set("embedded", "false");
  return url.toString();
}
