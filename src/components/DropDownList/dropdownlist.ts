import type { Writable } from "svelte/store";

export interface DropDownListItem {
  title: string;
  action?: () => void;
  booleanOption?: Writable<boolean>;
};
