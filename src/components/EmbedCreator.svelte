<!--
  This file is part of Spectra.

  Spectra is free software: you can redistribute it and/or modify it 
  under the terms of the GNU General Public License as published by 
  the Free Software Foundation, either version 3 of the License, or 
  (at your option) any later version.

  Spectra is distributed in the hope that it will be useful, but 
  WITHOUT ANY WARRANTY; without even the implied warranty of 
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
  General Public License for more details.

  You should have received a copy of the GNU General Public License 
  along with Spectra. If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
  import { toUrl, type Scene } from "@/scene";

  export let scene: Scene;

  let startPaused = false;
  let startIdle = false;
  let defaultSourceFile = scene.shaderFiles[0]?.filename ?? "";

  let url = new URL(window.location.href);
  url.searchParams.set("embedded", "true");

  $: {
    url.searchParams.set("startPaused", startPaused ? "true" : "false");
    url.searchParams.set("startIdle", startIdle ? "true" : "false");
    url.searchParams.set(
      "defaultSourceFile",
      encodeURIComponent(defaultSourceFile),
    );
    url.searchParams.set("scene", toUrl(scene));
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
      {#each scene.shaderFiles as file}
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
