<script lang="ts">
  import { PLAYING } from "@/utils";
</script>

<button on:click={() => PLAYING.update((p) => !p)}>
  <div class="button-contents">{$PLAYING ? "Pause" : "Play"}</div>
</button>
