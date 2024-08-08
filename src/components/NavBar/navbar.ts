import type { Writable } from "svelte/store";

export interface NavBarSection {
  title: string;
  items: NavBarItem[];
};

export interface NavBarItem {
  title: string;
  action?: () => void;
  booleanOption?: Writable<boolean>;
};
