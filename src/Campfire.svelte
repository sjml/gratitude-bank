<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { inscriptionRect, inscriptionQueue } from "./stores";
    import { getClientRectFromMesh } from "./util";


    import * as BABYLON from "@babylonjs/core/Legacy/legacy";

    //// will eventually restore these piece-wise imports for smaller build file,
    ////   but trackign down all the bloody import locations was killing me

    // import { Engine } from "@babylonjs/core/Engines/engine";
    // import type { Scene } from "@babylonjs/core/scene";
    // import { Vector3 } from "@babylonjs/core/Maths/math.vector";

    // import "@babylonjs/core/Loading/Plugins/babylonFileLoader";
    // import "@babylonjs/core/Loading/loadingScreen";
    // import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
    // import type { Mesh } from "@babylonjs/core/Meshes/mesh";

    // import "@babylonjs/core/Cameras/universalCamera";
    // import "@babylonjs/materials";

    // import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
    // import "@babylonjs/core/Particles";

    // import { ActionManager } from "@babylonjs/core/Actions/actionManager";
    // import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";
    // import type { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
    // import { Texture } from "@babylonjs/core/Materials/Textures/texture";
    // import { DynamicTexture, StandardMaterial } from "@babylonjs/core";
    // import { Color3 } from "@babylonjs/core/Maths/math.color";

    let loadingDone = false;
    let renderCanvas: HTMLCanvasElement;
    let engine: BABYLON.Engine = null;
    let scene: BABYLON.Scene = null;

    let inscriptionTexture: BABYLON.DynamicTexture = null;
    let inscriptionBaseColor: BABYLON.Color3 = null;
    const inscriptionTextureDimensions = {width: 2048, height: 512};

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

    async function setState(newState: State) {
        currentState = newState;

        if (currentState == State.Ready) {
            const drawAction = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function() {
                setState(State.Drawing);
            });

            woodPile.forEach((tgtName: string) => {
                const tgtMesh = scene.getMeshByName(tgtName);
                if (tgtMesh == null) {
                    console.error("Could not find woodpile object: " + tgtName);
                }
                else {
                    tgtMesh.actionManager = new BABYLON.ActionManager(scene);
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
                    if (tgtMesh.actionManager !== null) {
                        tgtMesh.actionManager.dispose();
                        tgtMesh.actionManager = null;
                    }
                }
            });

            const ctx = inscriptionTexture.getContext();
            ctx.fillStyle = inscriptionBaseColor.toHexString();
            ctx.fillRect(0, 0, inscriptionTextureDimensions.width, inscriptionTextureDimensions.height);

            let inputString = "The way my cat looks embarrassed when she misses a jump";
            const maxWidth = inscriptionTextureDimensions.width * 0.8;
            const widthGrace = 200; // canvas will do some squishing automatically,
                                    // and it can look pretty ok
            const baseFontSize = 250;

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "black";
            ctx.font = `${baseFontSize}px 'National Park', sans-serif`;

            inputString = inputString.trim();
            const textWidth = ctx.measureText(inputString).width;
            if (textWidth - widthGrace <= maxWidth) {
                ctx.fillText(inputString,
                    inscriptionTextureDimensions.width / 2,
                    inscriptionTextureDimensions.height / 2 + 25,
                    inscriptionTextureDimensions.width * 0.8
                );
            }
            else {
                // thankfully the input is limited so only have to handle a single linebreak

                // find the space closest to the center of the line
                const matches = inputString.matchAll(/\s/g);
                const breaks = {};
                for (const match of matches) {
                    breaks[match.index] = Math.abs((inputString.length / 2) - match.index);
                }
                const breakStr = Object.keys(breaks).reduce((a, b) => breaks[a] < breaks[b] ? a : b);
                const breakIdx = parseInt(breakStr);

                const line1 = inputString.substring(0, breakIdx).trim();
                const line2 = inputString.substring(breakIdx+1).trim();

                ctx.font = `${baseFontSize / 2}px 'National Park', sans-serif`;

                const metrics = ctx.measureText(line1);
                const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

                ctx.fillText(line1,
                    inscriptionTextureDimensions.width / 2,
                    (inscriptionTextureDimensions.height / 2 + 25) - (height * 0.7),
                    inscriptionTextureDimensions.width * 0.8
                );
                ctx.fillText(line2,
                    inscriptionTextureDimensions.width / 2,
                    (inscriptionTextureDimensions.height / 2 + 25) + (height * 0.7),
                    inscriptionTextureDimensions.width * 0.8
                );
            }

            inscriptionTexture.update();


            const movingLog = scene.getMeshByName(woodPile[0]) as BABYLON.Mesh;
            const ar = movingLog.getAnimationRange("PresentLog");
            scene.beginAnimation(
                movingLog, // target
                ar.from, ar.to, // range
                false, // loop
                1.0, // speed ratio
                () => setState(State.Scribing) // on complete
            );
        }

        else if (currentState == State.Scribing) {
            const woodRect = getClientRectFromMesh(
                                scene.getMeshByName(woodPile[0]) as BABYLON.Mesh,
                                scene,
                                renderCanvas
                             );
            woodRect.left += 8; // accounting for offset shape of wood
            $inscriptionRect = woodRect;
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
        engine = new BABYLON.Engine(renderCanvas, true, {disableWebGL2Support: true});

        const pixelRatio = window.devicePixelRatio;
        engine.setHardwareScalingLevel(1.0 / pixelRatio);

        engine.loadingScreen = new CustomLoadingScreen();
        scene = await BABYLON.SceneLoader.LoadAsync("", "./assets/campfire/campfire_set.babylon", engine);
        await BABYLON.SceneLoader.AppendAsync("", "./assets/campfire/lights.babylon", scene);
        await BABYLON.SceneLoader.AppendAsync("", "./assets/campfire/fire.babylon", scene);

        const inscSurf = scene.getMeshByName("InscriptionSurface");
        const inscMat = inscSurf.material as BABYLON.PBRMaterial;
        inscriptionBaseColor = inscMat.albedoColor;

        inscriptionTexture = new BABYLON.DynamicTexture("Inscription", inscriptionTextureDimensions, scene, true);
        inscriptionTexture.update(); // texture's not visible yet, but loading never finishes otherwise
        inscMat.albedoTexture = inscriptionTexture;

        setState(State.Drawing);

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
                const woodRect = getClientRectFromMesh(
                                    scene.getMeshByName(woodPile[0]) as BABYLON.Mesh,
                                    scene,
                                    renderCanvas
                                 );
                woodRect.left += 8; // accounting for offset shape of wood
                $inscriptionRect = woodRect;
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
