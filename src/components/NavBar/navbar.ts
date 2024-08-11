import type { Writable } from "svelte/store";
import type { DropDownListItem } from "../DropDownList/dropdownlist";

export interface NavBarSection {
  title: string;
  items: DropDownListItem[];
}
