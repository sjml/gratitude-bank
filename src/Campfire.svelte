<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { inscriptionRect, inscriptionQueue } from "./stores";
    import { getClientRectFromMesh } from "./util";


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
    import { ExecuteCodeAction, SetStateAction } from "@babylonjs/core/Actions/directActions";

    let loadingDone = false;
    let renderCanvas: HTMLCanvasElement;
    let engine: Engine = null;
    let scene: Scene = null;

    enum State {
        Ready = 1,
        Drawing = 2,
        Scribing = 3,
        Placing = 4,
        Summoning = 5,
        Remembering = 6,
        Dismissing = 7,
    }
    let currentState: State;

    function setState(newState: State) {
        currentState = newState;

        if (currentState == State.Ready) {
            const drawAction = new ExecuteCodeAction(ActionManager.OnPickTrigger, function() {
                setState(State.Drawing);
                const movingLog = scene.getMeshByName(woodPile[0]) as Mesh;
                const ar = movingLog.getAnimationRange("PresentLog");
                scene.beginAnimation(
                    movingLog, // target
                    ar.from, ar.to, // range
                    false, // loop
                    1.0, // speed ratio
                    () => setState(State.Scribing) // on complete
                );
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
        }

        else if (currentState == State.Drawing) {
            woodPile.forEach((tgtName: string) => {
                const tgtMesh = scene.getMeshByName(tgtName);
                if (tgtMesh == null) {
                    console.error("Could not find woodpile object: " + tgtName);
                }
                else {
                    tgtMesh.actionManager.dispose();
                    tgtMesh.actionManager = null;
                }
            });
        }

        else if (currentState == State.Scribing) {
            $inscriptionRect = getClientRectFromMesh(
                                    scene.getMeshByName(woodPile[0]) as Mesh,
                                    scene,
                                    renderCanvas
                               );
        }
    }


    const woodPile = [
        "AnimLog",
        "Log.005",
        "Log.006",
        "Log.007",
        "Log.008",
        "Log.009",
    ];

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

        setState(State.Ready);

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
            if (currentState == State.Scribing) {
                $inscriptionRect = getClientRectFromMesh(
                                        scene.getMeshByName(woodPile[0]) as Mesh,
                                        scene,
                                        renderCanvas
                                   );
            }
        }
    }

    onMount(() => {
        init();
    });

    onDestroy(() => {
        teardown();
    });

    $: if ($inscriptionQueue.length > 0) {
        // not actually treating as a queue for now
        const inscription = $inscriptionQueue[0];



        $inscriptionQueue = [];
    }

</script>

<svelte:window on:resize={handleResize} />

<div class="scene">
    <div class="curtain" class:risen={loadingDone}></div>

    <canvas
        bind:this={renderCanvas}
        class="renderCanvas"
        touch-action="none"
    />
</div>

<style>
    .scene {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .curtain {
        position: absolute;
        top: 0;
        left: 0;
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
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        touch-action: none;
    }
</style>
