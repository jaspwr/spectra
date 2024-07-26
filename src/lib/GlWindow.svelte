<script lang="ts">
  import { onMount } from "svelte";
  import { PipeLine } from "../gl";
  import type { Project } from "../project";

  export let project: Project | null;
  export let setErrors: (errors: string[]) => void;

  let pipeline: PipeLine | null = null;

  $: if (project !== null && gl !== null) {
    try {
      pipeline = new PipeLine(project, gl);
      setErrors([]);
      console.log(pipeline)
    } catch (e) {
      let errors = e as string[];
      setErrors(errors);
    }
  }

  let canv: HTMLCanvasElement;

  let gl: WebGLRenderingContext | null = null;

  let lastTime = 0;

  function loop(currentTime: DOMHighResTimeStamp) {
    if (pipeline !== null && gl !== null) {
      currentTime *= 0.001;

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

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

    if (gl !== null) {
      gl.viewport(0, 0, canv.width, canv.height);
    }
  };

  onMount(() => {
    gl = canv.getContext("webgl");
    if (!gl) throw new Error("WebGL not supported");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

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
