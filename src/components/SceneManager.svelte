<script>
  import { SceneProvider } from "@/filetree";
  import FileTree from "./FileTree/FileTree.svelte";
</script>

<FileTree provider={new SceneProvider()} />
