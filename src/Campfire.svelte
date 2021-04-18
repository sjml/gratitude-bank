<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { State } from "./types";
    import {
        currentState, gratitudeCount,
        woodPileRect,
        inscriptionRect, inscriptionQueue,
        summonRect, currentGratitude, summonResolution, woodPileReturnSignal } from "./stores";
    import { pd, getClientRectFromMesh, lerp } from "./util";
    import { getGratitudeCount, recallGratitude } from "./gratitude";

    // Snowpack's tree-shaking is good enough that we can get
    //   away without doing individual imports. This way we don't
    //   have to track down where every friggin' declaration is.
    //   Means the final build takes a smidge longer, but it's only
    //   for deployment, so I'll take easier development.
    import * as BABYLON from "@babylonjs/core/Legacy/legacy";

    type AnimData = {
        animHandle: BABYLON.Animatable,
        animRange: BABYLON.AnimationRange
    }


    let loadingDone = false;
    let renderCanvas: HTMLCanvasElement;
    let engine: BABYLON.Engine = null;
    let scene: BABYLON.Scene = null;

    let animLog: BABYLON.Mesh = null;
    let inscriptionTexture: BABYLON.DynamicTexture = null;
    let inscriptionBaseColor: BABYLON.Color3 = null;
    const inscriptionTextureDimensions = {width: 2048, height: 512};

    let summonDisplay: BABYLON.Mesh = null;
    let summonTexture: BABYLON.DynamicTexture = null
    let summonAnimData: AnimData = null;
    const summonTextureDimensions = {width: 2048, height: 2048};

    let startTimeStampMS: number = 0;
    let elapsedSeconds: number = 0;
    let fireLight: BABYLON.PointLight = null;

    const woodPile = [
        "AnimLog",
        "AnimLogProxy",
        "Log.005",
        "Log.006",
        "Log.007",
        "Log.008",
        "Log.009",
    ];

    function addAction(meshName: string, action: BABYLON.Action) {
        const tgtMesh = scene.getMeshByName(meshName);
        if (tgtMesh == null) {
            pd("Could not find mesh for action assignment:", meshName);
        }
        else {
            if (tgtMesh.actionManager == null) {
                tgtMesh.actionManager = new BABYLON.ActionManager(scene);
            }
            tgtMesh.actionManager.registerAction(action);
        }
    }

    function clearActions(meshName: string) {
        const tgtMesh = scene.getMeshByName(meshName);
        if (tgtMesh == null) {
            pd("Could not find mesh for action clearing:", meshName);
        }
        else {
            if (tgtMesh.actionManager !== null) {
                tgtMesh.actionManager.dispose();
                tgtMesh.actionManager = null;
            }
        }
    }

    function updateMeshRects() {
        pd("updating meshes");
        const woodRect = getClientRectFromMesh(
                                animLog,
                                scene,
                                renderCanvas
                            );
        woodRect.left += 8; // accounting for offset shape of wood
        $inscriptionRect = woodRect;

        const sRect = getClientRectFromMesh(
                                summonDisplay,
                                scene,
                                renderCanvas
                            );
        $summonRect = sRect;

        const wpRect = getClientRectFromMesh(
                                scene.getMeshByName("AnimLogProxy") as BABYLON.Mesh,
                                scene,
                                renderCanvas
                           );
        $woodPileRect = wpRect;
    }

    function runAnim(mesh: BABYLON.Mesh, animName: string, callback: () => void = null, reverse: boolean = false): AnimData {
        pd("trying to animate", animName, "on", mesh.name);
        let animRange = mesh.getAnimationRange(animName).clone();
        if (reverse) {
            [animRange.from, animRange.to] = [animRange.to, animRange.from];
        }
        let animHandle = scene.beginAnimation(
            mesh, // target
            animRange.from, animRange.to, // range
            false, // loop
            1.0, // speed ratio
            callback,
        );
        return {animHandle, animRange};
    }

    function initialRectSet() {
        if ($inscriptionRect == null || isNaN($inscriptionRect.width) || $inscriptionRect.width == 0) {
            updateMeshRects();
        }
        else {
            scene.unregisterBeforeRender(initialRectSet);
        }
    }

    async function setState(newState: State) {
        pd("Setting state:", State[newState]);
        $currentState = newState;

        // disable opening click targets if not in Ready state
        if ($currentState !== State.Ready) {
            woodPile.forEach((tgtName: string) => {
                clearActions(tgtName);
            });

            clearActions("CampfireClickTarget");
        }

        // handle state transitions
        if ($currentState == State.Ready) {
            // reset displays
            setInscription("");
            setSummonDisplay("");
            summonAnimData = null;

            // make sure anim log is in place
            let animRes = runAnim(animLog, "PresentLog");
            animRes.animHandle.stop();
            animRes.animHandle.goToFrame(animRes.animRange.from);

            // make sure summon is set below ground
            animRes = runAnim(summonDisplay, "Summon");
            animRes.animHandle.stop();
            animRes.animHandle.goToFrame(animRes.animRange.from);

            updateMeshRects();

            const drawAction = new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger, () => {
                    setState(State.Drawing);
                }
            );

            woodPile.forEach((tgtName: string) => {
                addAction(tgtName, drawAction);
            });


            const summonAction = new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger, () => {
                    setState(State.Summoning);
                }
            );

            if (getGratitudeCount() > 0) {
                addAction("CampfireClickTarget", summonAction);
            }
        }

        else if ($currentState == State.Drawing) {
            runAnim(animLog, "PresentLog", () => setState(State.Scribing));
        }

        else if ($currentState == State.Scribing) {
            updateMeshRects();
        }

        else if ($currentState == State.Returning) {
            runAnim(animLog, "PresentLog", () => setState(State.Ready), true);
        }

        else if ($currentState == State.Contemplating) {
            setTimeout(() => {
                setState(State.Placing);
            }, 1500);
        }

        else if ($currentState == State.Placing) {
            runAnim(animLog, "PlaceLog", () => setState(State.Ready));
        }

        else if ($currentState == State.Summoning) {
            $currentGratitude = recallGratitude();

            setSummonDisplay($currentGratitude.text);

            summonAnimData = runAnim(summonDisplay, "Summon", () => setState(State.Remembering));
        }

        else if ($currentState == State.Remembering) {
            summonAnimData = null;
            updateMeshRects();
        }

        else if ($currentState == State.Retaining) {
            summonAnimData = runAnim(summonDisplay, "Summon", () => setState(State.Ready), true);
        }

        else if ($currentState == State.Releasing) {
            setState(State.Ready);
        }
    }


    class CustomLoadingScreen implements BABYLON.ILoadingScreen {
        public loadingUIBackgroundColor: string;
        public loadingUIText: string = "";
        constructor() {}
        public displayLoadingUI() {}
        public hideLoadingUI() {
            loadingDone = true;
        }
    }

    async function init() {
        $gratitudeCount = getGratitudeCount();

        engine = new BABYLON.Engine(renderCanvas, true);

        const pixelRatio = window.devicePixelRatio;
        engine.setHardwareScalingLevel(1.0 / pixelRatio);

        engine.loadingScreen = new CustomLoadingScreen();
        scene = await BABYLON.SceneLoader.LoadAsync("", "./assets/campfire/campfire_set.babylon", engine);
        await BABYLON.SceneLoader.AppendAsync("", "./assets/campfire/lights.babylon", scene);
        await BABYLON.SceneLoader.AppendAsync("", "./assets/campfire/fire.babylon", scene);

        startTimeStampMS = new Date().getTime();
        scene.registerBeforeRender(() => {
            elapsedSeconds = (startTimeStampMS - new Date().getTime()) / 1000;
        });

        // environment setup
        scene.fogEnabled = true;
        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogColor = new BABYLON.Color3(
            scene.clearColor.r,
            scene.clearColor.g,
            scene.clearColor.b,
        );
        scene.fogStart = 4.0;
        scene.fogEnd = 10.0;

        // setup inscription surface
        animLog = scene.getMeshByName(woodPile[0]) as BABYLON.Mesh;

        const inscSurf = scene.getMeshByName("InscriptionSurface");
        const inscMat = inscSurf.material as BABYLON.PBRMaterial;
        inscriptionBaseColor = inscMat.albedoColor;

        inscriptionTexture = new BABYLON.DynamicTexture("Inscription", inscriptionTextureDimensions, scene, true);
        inscMat.albedoTexture = inscriptionTexture;


        // setup summoning rendering
        summonDisplay = scene.getMeshByName("SummoningDisplay") as BABYLON.Mesh;

        const summonMat = new BABYLON.ShaderMaterial("SummonMaterial", scene,
            "./assets/campfire/shaders/summon",
            {
                attributes: ["position", "uv"],
                uniforms: ["worldViewProjection", "elapsedTime", "comp"],
                needAlphaBlending: true,
            }
        );
        scene.registerBeforeRender(() => {
            summonMat.setFloat("elapsedTime", elapsedSeconds);
            // HACKHACK
            if (($currentState == State.Summoning) && summonAnimData != null) {
                const currFrame = summonAnimData.animHandle.masterFrame;
                const comp = (currFrame - summonAnimData.animRange.from) / (summonAnimData.animRange.to - summonAnimData.animRange.from);
                summonMat.setFloat("comp", comp);
            }
            else if ($currentState == State.Retaining && summonAnimData != null) {
                const currFrame = summonAnimData.animHandle.masterFrame;
                const comp = (currFrame - summonAnimData.animRange.from) / (summonAnimData.animRange.to - summonAnimData.animRange.from);
                summonMat.setFloat("comp", 1.0 - comp);
            }
        });
        summonTexture = new BABYLON.DynamicTexture("Summon", summonTextureDimensions, scene, true);
        summonTexture.hasAlpha = true;
        summonMat.setTexture("textSampler", summonTexture);
        summonDisplay.material = summonMat;


        // setup fire light animation
        fireLight = scene.getLightByName("FireLight") as BABYLON.PointLight;
        scene.registerBeforeRender(() => {
            const rate = 1;
            const x = rate * elapsedSeconds;

            // kinda ad-hoc fire movement/flickering made by screwing around in Desmos
            //  until it looked ok. works fine; could be better.

            fireLight.intensity =
                (3 * Math.sin(x) + 9) +
                (Math.sin(10 * x)) +
                (Math.cos(5 * x)) +
            0;

            fireLight.position.x =
                (
                    Math.sin(x * 3) +
                    Math.cos(x * 1.2)
                )
             * .05;

             fireLight.position.z =
                Math.cos(x) * 0.04;
        });


        // setup campfire click target
        // doesn't seem to be a way to export StandardMaterials out of Blender, so some switcheroo here
        const cfEmpty = scene.getMeshByName("CampfireBB");
        const secretCube = BABYLON.BoxBuilder.CreateBox("CampfireClickTarget", {}, scene);
        secretCube.position = cfEmpty.position;
        secretCube.rotation = cfEmpty.rotation;
        secretCube.scaling = cfEmpty.scaling.scale(2.0);
        const invisibleMaterial = new BABYLON.StandardMaterial("InvisibleMaterial", scene);
        invisibleMaterial.alpha = 0.0;
        secretCube.material = invisibleMaterial;


        scene.registerBeforeRender(initialRectSet);

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
            updateMeshRects();
        }
        var a = "../dist/assets/campfire/fire.babylon";
        a.replace(/\.\.\/dist/, ".");
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
        ctx.clearRect(0, 0, summonTextureDimensions.width, summonTextureDimensions.height);

        const maxWidth = summonTextureDimensions.width * 0.9;
        const widthGrace = 100; // canvas will do some squishing automatically,
                                // and it can look pretty ok
        const baseFontSize = 500;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
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

    // HACKHACK
    $: {
        if ($summonResolution == "release") {
            setState(State.Releasing);
        }
        else if ($summonResolution == "retain") {
            setState(State.Retaining);
        }
        $summonResolution = "";
    }

    // HACKHACK
    $: {
        if ($woodPileReturnSignal) {
            setState(State.Returning);
            $woodPileReturnSignal = false;
        }
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
        z-index: 10;
    }
    .curtain.risen {
        opacity: 0.0;
        transition-property: opacity;
        transition-delay: 500ms;
        transition-duration: 3000ms;
    }
</style>
