<script lang="ts">
  import { typeCol, type PipelineConnectionType } from "@/type";
  import { Handle, Position } from "@xyflow/svelte";

  export let type: "source" | "target";
  export let position: Position;
  export let top: number | undefined = undefined;
  export let id: string | undefined = undefined;
  export let valueType: PipelineConnectionType;

  $: style = `background: ${typeCol(valueType)};`;

  $: if (top !== undefined) {
    style += `top:${top}px;`;
  }
</script>

<Handle {type} {position} {style} {id} />
