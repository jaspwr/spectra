/**
 * This file is part of Spectra.
 *
 * Spectra is free software: you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by 
 * the Free Software Foundation, either version 3 of the License, or 
 * (at your option) any later version.
 *
 * Spectra is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License 
 * along with Spectra. If not, see <https://www.gnu.org/licenses/>.
 * */

import { type Node as SvelteFlowNode, type Edge as SvelteFlowEdge } from "@xyflow/svelte";
import { writable, type Writable } from "svelte/store";

export interface Macro {
  name: string;
  nodes: Writable<SvelteFlowNode[]>;
  edges: Writable<SvelteFlowEdge[]>;
  inputLabels: Writable<string[]>;
}

export function newMacro(name: string): Macro {
  const inputLabels = writable([]);
  return {
    name,
    nodes: writable([{
      id: "0",
      type: "output",
      data: {},
      position: { x: 300, y: 0 },
    },
    {
      id: "1",
      type: "inputs",
      data: {
        inputLabels
      },
      position: { x: 0, y: 0 },
    }
    ]),
    edges: writable([]),
    inputLabels: inputLabels,
  };
}

export const MACRO_EDITOR_SELECTED_MACRO: Writable<string> = writable("");
export const MACOR_EDITOR_INPUT_LABELS: Writable<string[]> = writable([]);

export function expandMacros(nodes: SvelteFlowNode[], edges: SvelteFlowEdge[], macros: Macro[]): { ns: SvelteFlowNode[], es: SvelteFlowEdge[] } {
  let ns = [...nodes];
  let es = [...edges];

  for (let i = 0; i < ns.length; i++) {
    const macroNode = ns[i];
    if (macroNode.type !== "macro") continue;

    const macro = macros.find((m) => m.name === macroNode.data.name);
    if (!macro) continue;
    const { nodes, edges } = getMacroNodesAndEdges(macro);

    // Remove the macro node
    ns.splice(i, 1);

    const inputNode = nodes.find((n) => n.type === "inputs");
    const outputNode = nodes.find((n) => n.type === "output");

    ns.push(...nodes);
    es.push(...edges);

    const connectedToMacroNode = es.filter((e) => e.target === macroNode.id);
    const connectedFromMacroNode = es.filter((e) => e.source === macroNode.id);

    const connectedToInputNode = edges.filter((e) => e.source === inputNode?.id);
    const connectedToOutputNode = edges.filter((e) => e.target === outputNode?.id);

    for (const e of connectedToMacroNode) {
      const inputName = e.targetHandle;
      const connectedToInput = connectedToInputNode.filter((e) => e.sourceHandle === inputName);

      for (const inputE of connectedToInput) {
        es.push({
          id: Math.random().toString(),
          source: e.source,
          target: inputE.target,
          sourceHandle: e.sourceHandle,
          targetHandle: inputE.targetHandle,
        });
      }
    }

    for (const e of connectedFromMacroNode) {
      for (const outputE of connectedToOutputNode) {
        es.push({
          id: Math.random().toString(),
          source: outputE.source,
          target: e.target,
          sourceHandle: outputE.sourceHandle,
          targetHandle: e.targetHandle,
        });
      }
    }
  }

  ns = ns.filter(n => !(n.type === "output" || n.type === "inputs"));
  es = es.filter(e => !(ns.find(n => n.id === e.source) === undefined || ns.find(n => n.id === e.target) === undefined));

  return { ns, es };
}

export function getMacroNodesAndEdges(macro: Macro): { nodes: SvelteFlowNode[], edges: SvelteFlowEdge[] } {
  // Evil value stealing
  let nodes: SvelteFlowNode[] | undefined, edges: SvelteFlowEdge[] | undefined;
  macro.nodes.update((n) => {
    nodes = [...n].map(n => ({...n}));
    return n;
  });
  macro.edges.update((e) => {
    edges = [...e].map(e => ({...e}));
    return e;
  });

  if (nodes === undefined || edges === undefined)
    throw new Error("Error in graph data");

  shuffleIds(nodes, edges);

  return { nodes: nodes, edges: edges };
}

export function shuffleIds(ns: SvelteFlowNode[], es: SvelteFlowEdge[]) {
  const idMap = new Map<string, string>();
  for (const n of ns) {
    idMap.set(n.id, Math.random().toString());
  }
  for (const e of es) {
    e.source = idMap.get(e.source) ?? e.source;
    e.target = idMap.get(e.target) ?? e.target;
  }
  for (const n of ns) {
    n.id = idMap.get(n.id) ?? n.id;
  }
}
