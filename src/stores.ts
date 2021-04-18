import { writable } from "svelte/store";
import type { Gratitude } from "./gratitude";
import { State } from "./types";

export const inscriptionRect = writable<ClientRect>(null);
export const inscriptionQueue = writable<string[]>([]);

export const currentGratitude = writable<Gratitude>(null);
export const summonRect = writable<ClientRect>(null);

// HACKHACK
export const summonResolution = writable<string>("");
export const woodPileReturnSignal = writable<boolean>(false);

export const woodPileRect = writable<ClientRect>(null);
export const currentState = writable<State>(State.Preload);
export const gratitudeCount = writable<number>(0);
