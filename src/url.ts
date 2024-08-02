interface UrlParameters {
  isEmbedded?: boolean;
  project?: string;
  defaultSourceFile?: string;
}

const url = new URL(window.location.href);

export const URL_PARAMETERS: UrlParameters = {
  isEmbedded: url.searchParams.get("embedded") == "true",
  project: url.searchParams.get("project") ?? undefined,
  defaultSourceFile: url.searchParams.get("defaultSourceFile") ?? undefined,
};
