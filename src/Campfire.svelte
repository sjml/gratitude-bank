<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { inscriptionRect, inscriptionQueue } from "./stores";
    import { getClientRectFromMesh, getGratitudeCount, recallGratitude } from "./util";


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

    let animLog: BABYLON.Mesh = null;
    let inscriptionTexture: BABYLON.DynamicTexture = null;
    let inscriptionBaseColor: BABYLON.Color3 = null;
    const inscriptionTextureDimensions = {width: 2048, height: 512};

    enum State {
        Ready = 1,
        Drawing = 2,
        Scribing = 3,
        Contemplating = 4,
        Placing = 5,
        Summoning = 6,
        Remembering = 7,
        Dismissing = 8,
    }
    let currentState: State;

    async function setState(newState: State) {
        currentState = newState;

        // disable opening click targets if not in Ready state
        if (currentState !== State.Ready) {
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

            const clickTgt = scene.getMeshByName("CampfireClickTarget");
            if (clickTgt == null) {
                console.error("Could not find campfire click target");
            }
            else {
                if (clickTgt.actionManager !== null) {
                    clickTgt.actionManager.dispose();
                    clickTgt.actionManager = null;
                }
            }
        }

        // handle state transitions
        if (currentState == State.Ready) {
            setInscription("");

            const drawAction = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                setState(State.Drawing);
            });

            const summonAction = new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                setState(State.Summoning);
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

            if (getGratitudeCount() > 0) {
                const clickTgt = scene.getMeshByName("CampfireClickTarget");
                if (clickTgt == null) {
                    console.error("Could not find campfire click target");
                }
                else {
                    clickTgt.actionManager = new BABYLON.ActionManager(scene);
                    clickTgt.actionManager.registerAction(summonAction);
                }
            }
        }

        else if (currentState == State.Drawing) {
            const ar = animLog.getAnimationRange("PresentLog");
            scene.beginAnimation(
                animLog, // target
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

        else if (currentState == State.Contemplating) {
            $inscriptionRect = null;
            setTimeout(() => {
                setState(State.Placing);
            }, 1500);
        }

        else if (currentState == State.Placing) {
            console.log("placing...");
            const ar = animLog.getAnimationRange("PlaceLog");
            scene.beginAnimation(
                animLog, // target
                ar.from, ar.to, // range
                false, // loop
                1.0, // speed ratio
                () => setState(State.Ready) // on complete
            );
        }

        else if (currentState == State.Summoning) {
            const gratitudeObj = recallGratitude();
            console.log(gratitudeObj);

        }
    }


    const woodPile = [
        "AnimLog",
        "AnimLogProxy",
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

        animLog = scene.getMeshByName(woodPile[0]) as BABYLON.Mesh;

        const inscSurf = scene.getMeshByName("InscriptionSurface");
        const inscMat = inscSurf.material as BABYLON.PBRMaterial;
        inscriptionBaseColor = inscMat.albedoColor;

        inscriptionTexture = new BABYLON.DynamicTexture("Inscription", inscriptionTextureDimensions, scene, true);
        inscMat.albedoTexture = inscriptionTexture;

        // doesn't seem to be a way to export StandardMaterials out of Blender, so some switcheroo here
        const cfEmpty = scene.getMeshByName("CampfireBB");
        const secretCube = BABYLON.MeshBuilder.CreateBox("CampfireClickTarget", {}, scene);
        secretCube.position = cfEmpty.position;
        secretCube.rotation = cfEmpty.rotation;
        secretCube.scaling = cfEmpty.scaling.scale(2.0);
        const invisibleMaterial = new BABYLON.StandardMaterial("InvisibleMaterial", scene);
        invisibleMaterial.alpha = 0.0;
        secretCube.material = invisibleMaterial;

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

    function setInscription(inputString: string) {
        const ctx = inscriptionTexture.getContext();
        ctx.fillStyle = inscriptionBaseColor.toHexString();
        ctx.fillRect(0, 0, inscriptionTextureDimensions.width, inscriptionTextureDimensions.height);

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
                inscriptionTextureDimensions.height / 2 + 15,
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
                (inscriptionTextureDimensions.height / 2 + 15) - (height * 0.7),
                inscriptionTextureDimensions.width * 0.8
            );
            ctx.fillText(line2,
                inscriptionTextureDimensions.width / 2,
                (inscriptionTextureDimensions.height / 2 + 15) + (height * 0.7),
                inscriptionTextureDimensions.width * 0.8
            );
        }

        inscriptionTexture.update();
    }

    $: if ($inscriptionQueue.length > 0) {
        // not actually treating as a queue for now
        const inscription = $inscriptionQueue[0];

        setInscription(inscription);
        setState(State.Contemplating);

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
