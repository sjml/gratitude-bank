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
