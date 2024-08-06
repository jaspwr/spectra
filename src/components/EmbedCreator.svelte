<script lang="ts">
  import { toUrl, type Project } from "@/project";

  export let project: Project;

  let startPaused = false;
  let startIdle = false;
  let defaultSourceFile = project.shaderFiles[0]?.filename ?? "";

  let url = new URL(window.location.href);
  url.searchParams.set("embedded", "true");

  $: {
    url.searchParams.set("startPaused", startPaused ? "true" : "false");
    url.searchParams.set("startIdle", startIdle ? "true" : "false");
    url.searchParams.set("defaultSourceFile", encodeURIComponent(defaultSourceFile));
    url.searchParams.set("project", toUrl(project));
    url = url;
  }

  $: iframeCode = `<iframe height="350" width="800" style="border:none; display: block;" src="${url.toString()}"></iframe>`;
</script>

<h1>Create Embed</h1>

<ul>
  <li class="checkbox-and-label">
    <input type="checkbox" bind:checked={startPaused} />
    Start Paused
  </li>
  <li class="checkbox-and-label">
    <input type="checkbox" bind:checked={startIdle} />
    Start Idle
  </li>
  <li class="checkbox-and-label">
    <select bind:value={defaultSourceFile}>
      {#each project.shaderFiles as file}
        <option>{file.filename}</option>
      {/each}
    </select>
    <span style="margin-left: 1rem">Default Source File</span>
  </li>
</ul>

<textarea>{iframeCode}</textarea>

<style>
  li {
    list-style-type: none;
    margin-bottom: 0.6rem;
  }

  textarea {
    width: 100%;
    height: 200px;
  }
</style>
