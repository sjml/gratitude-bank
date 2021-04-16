<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { inscriptionRect, inscriptionQueue, summonRect, currentGratitude, summonResolution } from "./stores";
    import { getClientRectFromMesh, getGratitudeCount, recallGratitude } from "./util";


    //// can switch this on temporarily if figuring out the location of specific imports is a pain
    // import * as BABYLON from "@babylonjs/core/Legacy/legacy";

    import { Engine } from "@babylonjs/core/Engines/engine";
    import type { Scene } from "@babylonjs/core/scene";
    import type { Color3 } from "@babylonjs/core/Maths/math.color";
    import { BoxBuilder } from "@babylonjs/core/Meshes/Builders/boxBuilder";

    import "@babylonjs/core/Loading/Plugins/babylonFileLoader";
    import type { ILoadingScreen } from "@babylonjs/core/Loading";
    import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
    import type { Mesh } from "@babylonjs/core/Meshes/mesh";

    import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
    import "@babylonjs/core/Particles";

    import "@babylonjs/core/Cameras/universalCamera";
    import "@babylonjs/materials";
    import type { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
    import { Texture } from "@babylonjs/core/Materials/Textures/texture";
    import { DynamicTexture, StandardMaterial } from "@babylonjs/core";

    import { ActionManager } from "@babylonjs/core/Actions/actionManager";
    import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions";

    let initDone = false;

    let loadingDone = false;
    let renderCanvas: HTMLCanvasElement;
    let engine: Engine = null;
    let scene: Scene = null;

    let animLog: Mesh = null;
    let inscriptionTexture: DynamicTexture = null;
    let inscriptionBaseColor: Color3 = null;
    const inscriptionTextureDimensions = {width: 2048, height: 512};

    let summonDisplay: Mesh = null;
    let summonTexture: DynamicTexture = null
    const summonTextureDimensions = {width: 2048, height: 2048};

    enum State {
        Preload = 0,
        Ready = 1,
        Drawing = 2,
        Scribing = 3,
        Contemplating = 4,
        Placing = 5,
        Summoning = 6,
        Remembering = 7,
        Retaining = 8,
        Releasing = 9,
    }
    let currentState: State = State.Preload;

    async function setState(newState: State) {
        console.log("Setting state:", State[newState]);
        currentState = newState;

        // disable opening click targets if not in Ready state
        if (currentState !== State.Ready) {
            $inscriptionRect = null;
            $summonRect = null;

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
            // reset displays
            setInscription("");
            setSummonDisplay("");

            if (initDone) {
                // make sure anim log is in place
                let ar = animLog.getAnimationRange("PresentLog");
                let an = scene.beginAnimation(
                    animLog, // target
                    ar.from, ar.to, // range
                    false, // loop
                    1.0, // speed ratio
                );
                an.stop();
                an.goToFrame(ar.from);

                // make sure summon is set below ground
                ar = summonDisplay.getAnimationRange("Summon");
                an = scene.beginAnimation(
                    summonDisplay, // target
                    ar.from, ar.to, // range
                    false, // loop
                    1.0, // speed ratio
                );
                an.stop();
                an.goToFrame(ar.from);
            }


            const drawAction = new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                setState(State.Drawing);
            });

            const summonAction = new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
                setState(State.Summoning);
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

            if (getGratitudeCount() > 0) {
                const clickTgt = scene.getMeshByName("CampfireClickTarget");
                if (clickTgt == null) {
                    console.error("Could not find campfire click target");
                }
                else {
                    clickTgt.actionManager = new ActionManager(scene);
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
                                animLog,
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
            $currentGratitude = recallGratitude();

            setSummonDisplay($currentGratitude.text);

            const ar = summonDisplay.getAnimationRange("Summon");
            scene.beginAnimation(
                summonDisplay, // target
                ar.from, ar.to, // range
                false, // loop
                1.0, // speed ratio
                () => setState(State.Remembering) // on complete
            );
        }

        else if (currentState == State.Remembering) {
            const meshRect = getClientRectFromMesh(
                                summonDisplay,
                                scene,
                                renderCanvas
                             );
            $summonRect = meshRect;
        }

        else if (currentState == State.Retaining) {
            $summonRect = null;
            const ar = summonDisplay.getAnimationRange("Summon");
            scene.beginAnimation(
                summonDisplay, // target
                ar.to, ar.from, // range
                false, // loop
                1.0, // speed ratio
                () => setState(State.Ready) // on complete
            );
        }

        else if (currentState == State.Releasing) {
            $summonRect = null;
            const ar = summonDisplay.getAnimationRange("Summon");
            scene.beginAnimation(
                summonDisplay, // target
                ar.from, ar.from, // range
                false, // loop
                1.0, // speed ratio
                () => setState(State.Ready) // on complete
            );
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


    class CustomLoadingScreen implements ILoadingScreen {
        public loadingUIBackgroundColor: string;
        public loadingUIText: string = "";
        constructor() {}
        public displayLoadingUI() {}
        public hideLoadingUI() {
            loadingDone = true;
        }
    }

    async function init() {
        engine = new Engine(renderCanvas, true, {disableWebGL2Support: true});

        const pixelRatio = window.devicePixelRatio;
        engine.setHardwareScalingLevel(1.0 / pixelRatio);

        engine.loadingScreen = new CustomLoadingScreen();
        scene = await SceneLoader.LoadAsync("", "./assets/campfire/campfire_set.babylon", engine);
        await SceneLoader.AppendAsync("", "./assets/campfire/lights.babylon", scene);
        await SceneLoader.AppendAsync("", "./assets/campfire/fire.babylon", scene);

        animLog = scene.getMeshByName(woodPile[0]) as Mesh;

        const inscSurf = scene.getMeshByName("InscriptionSurface");
        const inscMat = inscSurf.material as PBRMaterial;
        inscriptionBaseColor = inscMat.albedoColor;

        inscriptionTexture = new DynamicTexture("Inscription", inscriptionTextureDimensions, scene, true);
        inscMat.albedoTexture = inscriptionTexture;

        // doesn't seem to be a way to export StandardMaterials out of Blender, so some switcheroo here
        const cfEmpty = scene.getMeshByName("CampfireBB");
        const secretCube = BoxBuilder.CreateBox("CampfireClickTarget", {}, scene);
        secretCube.position = cfEmpty.position;
        secretCube.rotation = cfEmpty.rotation;
        secretCube.scaling = cfEmpty.scaling.scale(2.0);
        const invisibleMaterial = new StandardMaterial("InvisibleMaterial", scene);
        invisibleMaterial.alpha = 0.0;
        secretCube.material = invisibleMaterial;

        summonDisplay = scene.getMeshByName("SummoningDisplay") as Mesh;

        const summonMat = new StandardMaterial("SummonMaterial", scene);
        summonTexture = new DynamicTexture("Summon", summonTextureDimensions, scene, true);
        summonMat.emissiveTexture = summonTexture;
        summonMat.disableLighting = true;
        summonDisplay.material = summonMat;

        setState(State.Ready);

        engine.runRenderLoop(() => {
            scene.render();
        });

        initDone = true;
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
                                    animLog,
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

    // these two functions (putting text into a dynamic texture)
    //   could probably be abstracted a bit, but this is the extent
    //   of the functionality and life is short.

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
                maxWidth
            );
        }
        else {
            // thankfully the input is limited so only have to handle a single linebreak

            // find the space closest to the center of the line
            const matches = inputString.matchAll(/\s/g);
            const breaks: {[key: string]: number} = {};
            for (const match of matches) {
                breaks[String(match.index)] = Math.abs((inputString.length / 2) - match.index);
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
                maxWidth
            );
            ctx.fillText(line2,
                inscriptionTextureDimensions.width / 2,
                (inscriptionTextureDimensions.height / 2 + 15) + (height * 0.7),
                maxWidth
            );
        }

        inscriptionTexture.update();
    }

    function setSummonDisplay(inputString: string) {
        const ctx = summonTexture.getContext();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, summonTextureDimensions.width, summonTextureDimensions.height);

        const maxWidth = summonTextureDimensions.width * 0.9;
        const widthGrace = 100; // canvas will do some squishing automatically,
                                // and it can look pretty ok
        const baseFontSize = 500;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.font = `bold ${baseFontSize}px 'Amatic_SC', sans-serif`;

        inputString = inputString.trim();
        const textWidth = ctx.measureText(inputString).width;
        if (textWidth - widthGrace <= maxWidth) {
            ctx.fillText(inputString,
                summonTextureDimensions.width / 2,
                summonTextureDimensions.height / 2,
                maxWidth
            );
        }
        else {
            // thankfully the input is limited so only have to handle a single linebreak

            // find the space closest to the center of the line
            const matches = inputString.matchAll(/\s/g);
            const breaks: {[key: string]: number} = {};
            for (const match of matches) {
                breaks[match.index] = Math.abs((inputString.length / 2) - match.index);
            }
            if (Object.keys(breaks).length == 0) {
                ctx.fillText(inputString,
                    summonTextureDimensions.width / 2,
                    summonTextureDimensions.height / 2,
                    maxWidth
                );
            }
            else {
                const breakStr = Object.keys(breaks).reduce((a, b) => breaks[a] < breaks[b] ? a : b);
                const breakIdx = parseInt(breakStr);

                const line1 = inputString.substring(0, breakIdx).trim();
                const line2 = inputString.substring(breakIdx+1).trim();

                ctx.font = `bold ${baseFontSize / 2}px 'Amatic_SC', sans-serif`;

                const metrics = ctx.measureText(line1);
                const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

                ctx.fillText(line1,
                    summonTextureDimensions.width / 2,
                    (summonTextureDimensions.height / 2) - (height * 0.7),
                    maxWidth
                );
                ctx.fillText(line2,
                    summonTextureDimensions.width / 2,
                    (summonTextureDimensions.height / 2) + (height * 0.7),
                    summonTextureDimensions.width
                );
            }

        }

        summonTexture.update();
    }

    $: if ($inscriptionQueue.length > 0) {
        // not actually treating as a queue for now
        const inscription = $inscriptionQueue[0];

        setInscription(inscription);
        setState(State.Contemplating);

        $inscriptionQueue = [];
    }

    $: {
        if ($summonResolution == "release") {
            setState(State.Releasing);
        }
        else if ($summonResolution == "retain") {
            setState(State.Retaining);
        }
        $summonResolution = "";
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
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    .renderCanvas {
        width: 100%;
        height: 100%;
        touch-action: none;
    }

    .curtain {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        touch-action: none;
        pointer-events: none;

        background-color: rgb(16, 16, 50);
        z-index: 50;
    }
    .curtain.risen {
        opacity: 0.0;
        transition-property: opacity;
        transition-delay: 500ms;
        transition-duration: 3000ms;
    }
</style>
