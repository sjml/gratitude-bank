import { writable } from "svelte/store";

export const inscriptionRect = writable<ClientRect>(null);
export const inscriptionQueue = writable<string[]>([]);

