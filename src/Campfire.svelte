<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { Engine } from "@babylonjs/core/Engines/engine";
    import type { Scene } from "@babylonjs/core/scene";
    import { Vector3 } from "@babylonjs/core/Maths/math.vector";

    import "@babylonjs/core/Loading/Plugins/babylonFileLoader";
    import "@babylonjs/core/Loading/loadingScreen";
    import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
    import type { Mesh } from "@babylonjs/core/Meshes/mesh";

    import "@babylonjs/core/Cameras/universalCamera";
    import "@babylonjs/materials";

    import "@babylonjs/core/Lights/pointLight";
    import "@babylonjs/core/Particles";

    import { ActionManager } from "@babylonjs/core/Actions/actionManager";
    import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";

    let loadingDone = false;
    let renderCanvas: HTMLCanvasElement;
    let engine: Engine = null;
    let scene: Scene = null;

    const woodPile = [
        "AnimLog",
        "Log.005",
        "Log.006",
        "Log.007",
        "Log.008",
        "Log.009",
    ];
    let movingLog: Mesh = null;
    let startingPosition: Vector3 = null;
    let startingRotation: Vector3 = null;
    let presentationPosition: Vector3 = new Vector3(2.0, 0.95, 0.86);
    let presentationRotation: Vector3 = new Vector3(4.1, 1.1, 0.0);

    function CustomLoadingScreen() {
    }
    CustomLoadingScreen.prototype.displayLoadingUI = () => {
    };
    CustomLoadingScreen.prototype.hideLoadingUI = () => {
        loadingDone = true;
    };

    async function init() {
        engine = new Engine(renderCanvas, true, {disableWebGL2Support: true});
        engine.loadingScreen = new CustomLoadingScreen();
        scene = await SceneLoader.LoadAsync("", "./assets/campfire/campfire_set.babylon", engine);
        await SceneLoader.AppendAsync("", "./assets/campfire/fire.babylon", scene);

        const drawAction = new ExecuteCodeAction(ActionManager.OnPickTrigger, function() {
            // presentLog();
        });

        woodPile.forEach((tgtName: string) => {
            const tgtMesh = scene.getMeshByName(tgtName);
            if (tgtMesh == null) {
                console.error("Could not find woodpile object: " + tgtName);
            }
            else {
                tgtMesh.actionManager = new ActionManager(scene);
                tgtMesh.actionManager.registerAction(drawAction);
            }
        });

        movingLog = scene.getMeshByName(woodPile[0]) as Mesh;
        startingPosition = movingLog.position;
        startingRotation = movingLog.rotation;

        engine.runRenderLoop(() => {
            scene.render();
        });
    }

    async function teardown() {
        scene.dispose();
        engine.dispose();

        scene = null;
        engine = null;
    }

    function handleResize() {
        if (engine !== null) {
            engine.resize();
        }
    }

    onMount(() => {
        init();
    });

    onDestroy(() => {
        teardown();
    });


    function presentLog() {
        movingLog.position = presentationPosition;
        movingLog.rotation = presentationRotation;
    }

</script>

<svelte:window on:resize={handleResize} />

<div class="curtain" class:risen={loadingDone}></div>

<canvas
    bind:this={renderCanvas}
    class="renderCanvas"
    touch-action="none"
/>

<style>
    .curtain {
        position: absolute;
        width: 100%;
        height: 100%;
        touch-action: none;
        pointer-events: none;

        background-color: black;
        z-index: 50;
    }
    .curtain.risen {
        opacity: 0.0;
        transition-property: opacity;
        transition-delay: 500ms;
        transition-duration: 3000ms;
    }

    .renderCanvas {
        width: 100%;
        height: 100%;
        touch-action: none;
    }
</style>
