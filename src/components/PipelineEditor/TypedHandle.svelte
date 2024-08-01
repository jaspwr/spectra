<script lang="ts">
  import { typeCol, type PipelineConnectionType } from "@/type";
  import { registerNodeHandleType } from "@/utils";
  import { Handle, Position } from "@xyflow/svelte";
  import { getContext } from "svelte";

  export let type: "source" | "target";
  export let position: Position;
  export let top: number | undefined = undefined;
  export let id: string | undefined = undefined;
  export let valueType: PipelineConnectionType;

  $: style = `background: ${typeCol(valueType)};`;

  $: if (top !== undefined) {
    style += `top:${top}px;`;
  }

  const nodeId = getContext<string>("svelteflow__node_id");

  if (id !== undefined) {
    registerNodeHandleType(nodeId, id, valueType);
  }
</script>

<Handle {type} {position} {style} {id} />
