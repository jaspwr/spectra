<script>
  import katex from "katex";

  export let text;

  export let displayMode = false;

  const options = {
    displayMode: displayMode,
    throwOnError: false,
  };

  $: katexString = katex.renderToString(text, options);
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/katex@0.16.2/dist/katex.min.css"
    integrity="sha384-bYdxxUwYipFNohQlHt0bjN/LCpueqWz13HufFEV1SUatKs1cm4L6fFgCi1jT643X"
    crossorigin="anonymous"
  />
</svelte:head>

{@html katexString}
