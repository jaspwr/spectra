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
  import { onMount } from "svelte";
  import { PipeLine } from "../pipeline";
  import type { Project } from "../project";
  import { WINDOW_ASPECT, WINDOW_HEIGHT, WINDOW_WIDTH } from "@/gl/utils";
  import { FPS } from "../utils";

  export let project: Project | null;

  let pipeline: PipeLine | null = null;

  $: if (project !== null && gl !== null) {
    pipeline = new PipeLine(project, gl);
  }

  let canv: HTMLCanvasElement;

  let gl: WebGL2RenderingContext | null = null;

  let lastTime = 0;

  let frameTimeSum = 0;
  let frameSumSamples = 0;
  let FPS_INTEGRATION_TIME = 30; // frames

  function loop(currentTime: DOMHighResTimeStamp) {
    if (pipeline !== null && gl !== null) {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      frameTimeSum += deltaTime;
      frameSumSamples += 1;
      if (frameSumSamples >= FPS_INTEGRATION_TIME) {
        FPS.set(1000 / (frameTimeSum / frameSumSamples));
        frameTimeSum = 0;
        frameSumSamples = 0;
      }

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      pipeline.render(gl, deltaTime);
    }

    requestAnimationFrame(loop);
  }

  const resize = () => {
    if (!canv) return;
    canv.width = 0;
    canv.height = 0;

    let parent = canv.parentElement;
    if (!parent) return;
    canv.width = parent.clientWidth;
    canv.height = parent.clientHeight;

    WINDOW_ASPECT.value = canv.height / canv.width;
    WINDOW_HEIGHT.value = canv.height;
    WINDOW_WIDTH.value = canv.width;

    if (gl !== null) {
      gl.viewport(0, 0, canv.width, canv.height);
    }
  };

  onMount(() => {
    gl = canv.getContext("webgl2");
    if (!gl) throw new Error("WebGL not supported");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // const ext = gl.getExtension("WEBGL_depth_texture");
    // if (!ext) {
    //   return alert("WEBGL_depth_texture not supported. Try another browser.");
    // }

    resize();

    requestAnimationFrame(loop);
  });
</script>

<canvas bind:this={canv} width="800" height="500"></canvas>

<svelte:window
  on:resize={() => {
    resize();
  }}
/>
