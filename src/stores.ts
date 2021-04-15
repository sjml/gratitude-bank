import { writable } from "svelte/store";
import type { Gratitude } from "./util";

export const inscriptionRect = writable<ClientRect>(null);
export const inscriptionQueue = writable<string[]>([]);

export const currentGratitude = writable<Gratitude>(null);
export const summonRect = writable<ClientRect>(null);
export const summonResolution = writable<string>("");
