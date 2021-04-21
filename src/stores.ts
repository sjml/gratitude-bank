import { writable } from "svelte/store";
import type { Gratitude } from "./gratitude";
import { State } from "./types";

const settingsDefault = {hiRes: true, showTargets: true, showSettings: false};
const settingsStr = localStorage.getItem("gratitude_settings_v1");
const settings: {[key: string]: any} = JSON.parse(settingsStr) || settingsDefault;

export const hiResSetting = writable<boolean>(settings["hiRes"]);
hiResSetting.subscribe((val) => {
    settings.hiRes = val;
    localStorage.setItem("gratitude_settings_v1", JSON.stringify(settings));
});
export const showTargetsSetting = writable<boolean>(settings["showTargets"]);
showTargetsSetting.subscribe((val) => {
    settings.showTargets = val;
    localStorage.setItem("gratitude_settings_v1", JSON.stringify(settings));
});
export const showSettings = writable<boolean>(settings["showSettings"]);
showSettings.subscribe((val) => {
    settings.showSettings = val;
    localStorage.setItem("gratitude_settings_v1", JSON.stringify(settings));
});

export const inscriptionRect = writable<ClientRect>(null);
export const inscriptionQueue = writable<string[]>([]);

export const currentGratitude = writable<Gratitude>(null);
export const summonRect = writable<ClientRect>(null);
export const campfireRect = writable<ClientRect>(null);

export const woodPileRect = writable<ClientRect>(null);
export const currentState = writable<State>(State.Preload);
export const gratitudeCount = writable<number>(0);

// HACKHACK
export const summonResolution = writable<string>("");
export const woodPileReturnSignal = writable<boolean>(false);

