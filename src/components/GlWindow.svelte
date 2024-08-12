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
  import { onDestroy, onMount } from "svelte";
  import { PipeLine } from "../pipeline";
  import type { Scene } from "../scene";
  import { WINDOW_ASPECT, WINDOW_HEIGHT, WINDOW_WIDTH } from "@/gl/utils";
  import { FPS, GL_CONTEXT, PLAYING } from "../utils";
  import { notify } from "./Notification/notifications";

  export let scene: Scene | null;

  let pipeline: PipeLine | null = null;

  $: console.log(pipeline);

  // When the scene is recompiled or the window size changes,
  // the window is rererended even if paused.
  let pausedNeedsUpdate = true;

  $: {
    if (scene !== null && gl !== null) {
      notify("Recompiling...");
      pipeline = new PipeLine(scene, gl);
    }
    pausedNeedsUpdate = true;
  }

  let canv: HTMLCanvasElement;

  let gl: WebGL2RenderingContext | null = null;

  let lastTime = 0;

  let frameTimeSum = 0;
  let frameSumSamples = 0;
  let FPS_INTEGRATION_TIME = 30; // frames

  const destroyed = { value: false };

  function loop(currentTime: DOMHighResTimeStamp) {
    if (destroyed.value) return;

    if (($PLAYING || pausedNeedsUpdate) && pipeline !== null && gl !== null) {
      pausedNeedsUpdate = false;

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

    pausedNeedsUpdate = true;
  };

  onMount(() => {
    gl = canv.getContext("webgl2");
    if (!gl) throw new Error("WebGL not supported");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    const floatTexExt = gl.getExtension("EXT_color_buffer_float");
    if (!floatTexExt) {
      notify("HDR framebuffers not supported in your browser.");
    }

    resize();

    requestAnimationFrame(loop);

    if (GL_CONTEXT.gl === null) {
      GL_CONTEXT.gl = gl;
    }
  });

  onDestroy(() => {
    gl = null;
    destroyed.value = true;
  });
</script>

<canvas bind:this={canv} width="800" height="500"></canvas>

<svelte:window
  on:resize={() => {
    resize();
  }}
/>
