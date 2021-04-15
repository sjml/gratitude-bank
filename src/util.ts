import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";


export function getClientRectFromMesh(mesh: Mesh, scene: Scene, canvas: HTMLCanvasElement): ClientRect {
    const meshVectors = mesh.getBoundingInfo().boundingBox.vectors;

    const worldMatrix = mesh.getWorldMatrix();
    const transformMatrix = scene.getTransformMatrix();
    const viewport = scene.activeCamera!.viewport;

    const coordinates = meshVectors.map(v => {
        const proj = Vector3.Project(v, worldMatrix, transformMatrix, viewport);
        proj.x = proj.x * canvas.clientWidth;
        proj.y = proj.y * canvas.clientHeight;
        return proj;
    });

    const minX = Math.min(...coordinates.map(c => c.x));
    const maxX = Math.max(...coordinates.map(c => c.x));
    const minY = Math.min(...coordinates.map(c => c.y));
    const maxY = Math.max(...coordinates.map(c => c.y));

    const rect: ClientRect = {
        width: maxX - minX,
        height: maxY - minY,
        left: minX,
        top: minY,
        right: maxX,
        bottom: maxY,
    }

    return rect;
}

export type Gratitude = {
    text: string,
    storedOn: number,
    lastSeen: number|null,
    timesSeen: number,
};

function _getGratitudeList() : Gratitude[] {
    const gratitudeStr = localStorage.getItem("gratitude_storage_v1");
    let gratitude = [];
    if (gratitudeStr !== null) {
        gratitude = JSON.parse(gratitudeStr);
    }
    return gratitude;
}

export function storeGratitude(text: string) {
    const gratitude = _getGratitudeList();

    const existingIdx = gratitude.findIndex(o => o.text == text);
    if (existingIdx == -1) {
        gratitude.push({
            text: text,
            storedOn: Date.now(),
            lastSeen: null,
            timesSeen: 0
        });

        localStorage.setItem("gratitude_storage_v1", JSON.stringify(gratitude));
    }
}

export function recallGratitude() : Gratitude {
    const gratitude = _getGratitudeList();

    // for now just sorting by least recently seen; can get more clever later
    gratitude.sort((a,b) => {
        if (a.lastSeen == null && b.lastSeen == null) {
            if (a.storedOn < b.storedOn) {
                return -1;
            }
            else if (a.storedOn === b.storedOn) {
                return 0;
            }
            else {
                return 1;
            }
        }

        if (a.lastSeen == null) {
            return -1;
        }
        if (b.lastSeen == null) {
            return 1;
        }

        if (a.lastSeen < b.lastSeen) {
            return -1;
        }
        else if (a.lastSeen === b.lastSeen) {
            return 0;
        }
        else {
            return 1;
        }
    });

    gratitude[0].lastSeen = Date.now();
    gratitude[0].timesSeen += 1;

    localStorage.setItem("gratitude_storage_v1", JSON.stringify(gratitude));

    return gratitude[0];
}

export function releaseGratitude(text: string) {
    let gratitude = _getGratitudeList();

    gratitude = gratitude.filter((g) => g.text != text);

    localStorage.setItem("gratitude_storage_v1", JSON.stringify(gratitude));
}

export function getGratitudeCount() {
    const gratitude = _getGratitudeList();
    return gratitude.length;
}
