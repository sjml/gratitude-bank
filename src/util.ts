import * as BABYLON from "@babylonjs/core/Legacy/legacy";

export function pd(...output: any[]) {
    if (import.meta.env.MODE === "development") {
        console.log(...output);
    }
}

export function lerp(val1: number, val2: number, t: number): number {
    return val1 + ((val2 - val1) * t);
}
