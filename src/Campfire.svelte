<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { State } from "./types";
    import {
        hiResSetting,
        currentState, gratitudeCount,
        campfireRect, woodPileRect,
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

        const cfRect = getClientRectFromMesh(
                                scene.getMeshByName("CampfireClickTarget") as BABYLON.Mesh,
                                scene,
                                renderCanvas
                            );
        $campfireRect = cfRect;
    }

    function runAnim(mesh: BABYLON.Mesh, animName: string, callback: () => void = null, reverse: boolean = false): AnimData {
        pd("trying to animate", animName, "on", mesh.name, mesh);
        let animRange = mesh.getAnimationRange(animName).clone();

        // I cannot for the life of me determine why thie is necessary.
        //   The Blender to Babylon exporter is very mysterious, especially when it comes
        //   to animations. Without this off-by-one correction there's jumps as it underruns
        //   the correct animation, so what is the returned range supposed to indicate?
        animRange.from += 1;

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
            await setInscription("");
            await setSummonDisplay("");
            summonAnimData = null;

            // make sure anim log is in place
            let animRes = runAnim(animLog, "PresentLog");
            animRes.animHandle.stop();
            animRes.animHandle.goToFrame(animRes.animRange.from);

            // make sure summon is set below ground
            animRes = runAnim(summonDisplay, "SummonBaked");
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

            await setSummonDisplay($currentGratitude.text);

            summonAnimData = runAnim(summonDisplay, "SummonBaked", () => setState(State.Remembering));
        }

        else if ($currentState == State.Remembering) {
            summonAnimData = null;
            updateMeshRects();
        }

        else if ($currentState == State.Retaining) {
            summonAnimData = runAnim(summonDisplay, "SummonBaked", () => setState(State.Ready), true);
        }

        else if ($currentState == State.Releasing) {
            await new Promise((res) => setTimeout(res, 900));
            summonAnimData = runAnim(summonDisplay, "ReleaseBaked", () => setState(State.Ready));
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

        if ($hiResSetting) {
            const pixelRatio = window.devicePixelRatio;
            engine.setHardwareScalingLevel(1.0 / pixelRatio);
        }

        engine.loadingScreen = new CustomLoadingScreen();
        scene = await BABYLON.SceneLoader.LoadAsync("", "./assets/campfire_set.babylon", engine);
        await BABYLON.SceneLoader.AppendAsync("", "./assets/lights.babylon", scene);
        await BABYLON.SceneLoader.AppendAsync("", "./assets/fire.babylon", scene);
        await BABYLON.SceneLoader.AppendAsync("", "./assets/summon.babylon", scene);
        await BABYLON.SceneLoader.AppendAsync("", "./assets/anim_log.babylon", scene);

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
            "./assets/shaders/summon",
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
            else if (($currentState == State.Retaining) && summonAnimData != null) {
                const currFrame = summonAnimData.animHandle.masterFrame;
                const comp = (currFrame - summonAnimData.animRange.from) / (summonAnimData.animRange.to - summonAnimData.animRange.from);
                summonMat.setFloat("comp", 1.0 - comp);
            }
            else if ($currentState == State.Releasing && summonAnimData != null) {
                const currFrame = summonAnimData.animHandle.masterFrame;
                const comp = (currFrame - summonAnimData.animRange.from) / (summonAnimData.animRange.to - summonAnimData.animRange.from);
                summonMat.setFloat("comp", 1.0 - (comp*1.7));
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
            setTimeout(() => {
                updateMeshRects();
            }, 100);
        }
        var a = "../dist/assets/fire.babylon";
        a.replace(/\.\.\/dist/, ".");
    }

    onMount(() => {
        init();
    });

    onDestroy(() => {
        teardown();
    });

    // too many parameters here, but meh
    function breakTextForCanvas(inputString: string,
                       baseFontSize: number, // a more clever algorithm would be able to calculate this itself
                       formatString: string, // has to be specially formatted
                       ctx: CanvasRenderingContext2D,
                       maxBreaks: number,
                       maxWidthMultiplier: number
                    ) {
        // for more arbitrary text inputs it would be better to just measure each
        //   word and accumulate lines up to the max width, but we don't want to leave
        //   any orphans know the general size of the input range so this kind of backflip
        //   is a little bit better visually.
        // there is probably some clever algorithm out there that would do this better, though.

        if (maxBreaks !== 2 && maxBreaks !== 3) {
            // limited input and arbitrary text wrapping is a hard problem
            console.error("Only handling maxBreaks of 2 and 3");
            return null;
        }

        const widthGrace = ctx.canvas.width * 0.1; // canvas will do some squishing automatically,
                                                   // and it can look pretty ok
        const maxWidth = ctx.canvas.width * maxWidthMultiplier;

        inputString = inputString.trim();
        ctx.font = formatString.replace("#FONTSIZE#", baseFontSize.toFixed(0));
        const textWidth = ctx.measureText(inputString).width;
        if (textWidth - widthGrace <= maxWidth) {
            return {fontSize: baseFontSize, snippets: [inputString]};
        }

        let matches = inputString.matchAll(/[\s-—\.;/]/g);
        let breaks: {[key: string]: number} = {};
        for (const match of matches) {
            breaks[String(match.index)] = Math.abs(Math.floor(inputString.length / 2) - match.index);
        }

        let line1: string = "";
        let line2: string = "";
        let line3: string = "";
        if (Object.keys(breaks).length == 0) {
            // no spaces; try a little squeeze first
            if (textWidth - (widthGrace*2) <= maxWidth) {
                return {fontSize: baseFontSize, snippets: [inputString]};
            }
            // ok let's just just try splitting it in two
            const middle = Math.floor(inputString.length / 2);
            line1 = inputString.substring(0, middle).trim();
            line2 = inputString.substring(middle).trim();

            ctx.font = formatString.replace("#FONTSIZE#", (baseFontSize / 2).toFixed(0));
            const w1 = ctx.measureText(line1).width;
            const w2 = ctx.measureText(line2).width;
            if (  (maxBreaks == 2) || ( (w1 - widthGrace <= maxWidth) && (w2 - widthGrace <= maxWidth) )  ) {
                // either it works ok OR we're only allowed to break in two
                return {fontSize: baseFontSize / 2, snippets: [line1 + "-", line2]};
            }

            // try for thirds and hope for the best
            const third = Math.floor(inputString.length / 3);
            line1 = inputString.substring(0, third).trim();
            line2 = inputString.substring(third, third*2);
            line3 = inputString.substring(third*2);
            return {fontSize: baseFontSize / 3, snippets: [line1 + "-", line2 + "-", line3]};
        }

        // find the space closest to the center of the line
        const breakStr = Object.keys(breaks).reduce((a, b) => breaks[a] < breaks[b] ? a : b);
        let breakIdx = parseInt(breakStr);
        if (inputString.charAt(breakIdx).trim() !== "") {
            breakIdx += 1;
        }

        // split it at that point
        line1 = inputString.substring(0, breakIdx).trim();
        line2 = inputString.substring(breakIdx).trim();

        if (maxBreaks == 2) {
            return {fontSize: baseFontSize / 2, snippets: [line1, line2]};
        }

        // was the break sufficient?
        ctx.font = formatString.replace("#FONTSIZE#", (baseFontSize / 2).toFixed(0));
        const w1 = ctx.measureText(line1).width;
        const w2 = ctx.measureText(line2).width;
        if ((w1 - widthGrace <= maxWidth) && (w2 - widthGrace <= maxWidth)) {
            return {fontSize: baseFontSize / 2, snippets: [line1, line2]};
        }

        // we tried 2 lines, but they're still too wide; we're allowed 3 so let's do it
        matches = inputString.matchAll(/[\s-—\.;/]/g);
        const thirdBreaks: {[key: string]: number} = {};
        const twoThirdBreaks: {[key: string]: number} = {};
        for (const match of matches) {
            thirdBreaks[String(match.index)] = Math.abs(Math.floor(inputString.length / 3) - match.index);
            twoThirdBreaks[String(match.index)] = Math.abs((Math.floor(inputString.length / 3) * 2) - match.index);
        }
        // closest break to 1/3
        const earlyBreakStr = Object.keys(thirdBreaks).reduce((a, b) => thirdBreaks[a] < thirdBreaks[b] ? a : b);
        const earlyBreakDist = thirdBreaks[earlyBreakStr];

        // closest break to 2/3
        const lateBreakStr = Object.keys(twoThirdBreaks).reduce((a, b) => twoThirdBreaks[a] < twoThirdBreaks[b] ? a : b);
        const lateBreakDist = twoThirdBreaks[lateBreakStr];

        if (earlyBreakDist <= lateBreakDist) {
            // break at the first third
            breakIdx = parseInt(earlyBreakStr);
            if (inputString.charAt(breakIdx).trim() !== "") {
                breakIdx += 1;
            }
            line1 = inputString.substring(0, breakIdx).trim();
            line2 = inputString.substring(breakIdx).trim();

            // break remainder in half
            matches = line2.matchAll(/[\s-—\.;/]/g);
            breaks = {};
            for (const match of matches) {
                breaks[String(match.index)] = Math.abs((Math.floor(line2.length / 2)) - match.index);
            }
            if (Object.keys(breaks).length == 0) {
                line3 = line2.substring(Math.floor(line2.length / 2)).trim();
                line2 = line2.substring(0, Math.floor(line2.length / 2)).trim() + "-";
            }
            else {
                let remBreakStr = Object.keys(breaks).reduce((a, b) => breaks[a] < breaks[b] ? a : b);
                let remBreakIdx = parseInt(remBreakStr);
                if (line2.charAt(remBreakIdx).trim() !== "") {
                    remBreakIdx += 1;
                }
                line3 = line2.substring(remBreakIdx).trim();
                line2 = line2.substring(0, remBreakIdx).trim();
            }
        }
        else {
            // break at the last third
            breakIdx = parseInt(lateBreakStr);
            if (inputString.charAt(breakIdx).trim() !== "") {
                breakIdx += 1;
            }
            line1 = inputString.substring(0, breakIdx).trim();
            line2 = inputString.substring(breakIdx).trim();
            line3 = line2;

            // break remainder in half
            matches = line1.matchAll(/[\s-—\.;/]/g);
            breaks = {};
            for (const match of matches) {
                breaks[String(match.index)] = Math.abs(Math.floor(line1.length / 2) - match.index);
            }
            if (Object.keys(breaks).length == 0) {
                line2 = line1.substring(Math.floor(line1.length / 2)).trim();
                line1 = line1.substring(0, Math.floor(line1.length / 2)).trim();
            }
            else {
                let remBreakStr = Object.keys(breaks).reduce((a, b) => breaks[a] < breaks[b] ? a : b);
                let remBreakIdx = parseInt(remBreakStr);
                if (line1.charAt(remBreakIdx).trim() !== "") {
                    remBreakIdx += 1;
                }
                line2 = line1.substring(remBreakIdx).trim();
                line1 = line1.substring(0, remBreakIdx).trim();
            }
        }

        return {fontSize: baseFontSize / 3, snippets: [line1, line2, line3]};
    }

    function stuffText(snippets: string[],
                    maxWidthMultiplier: number,
                    originOffset: number[],
                    ctx: CanvasRenderingContext2D
            ){
        const origin = {
            x: (ctx.canvas.width  / 2) + originOffset[0],
            y: (ctx.canvas.height / 2) + originOffset[1],
        }
        const maxWidth = ctx.canvas.width * maxWidthMultiplier;
        const metrics = ctx.measureText(snippets[0]);
        const lineHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        const spacerSize = 0.7; // magic number

        if (snippets.length == 1) {
            ctx.fillText(snippets[0], origin.x, origin.y, maxWidth);
        }
        else if (snippets.length == 2) {
            ctx.fillText(snippets[0],
                origin.x,
                origin.y - (lineHeight * spacerSize),
                maxWidth
            );
            ctx.fillText(snippets[1],
                origin.x,
                origin.y + (lineHeight * spacerSize),
                maxWidth
            );
        }
        else if (snippets.length == 3) {
            ctx.fillText(snippets[0],
                origin.x,
                origin.y - (lineHeight * spacerSize * 1.5),
                maxWidth
            );
            ctx.fillText(snippets[1], origin.x, origin.y, maxWidth);
            ctx.fillText(snippets[2],
                origin.x,
                origin.y + (lineHeight * spacerSize * 1.5),
                maxWidth
            );
        }
        else {
            console.error("Should only be max of 3 snippets.");
        }
    }

    async function setInscription(inputString: string) {
        const format = "#FONTSIZE#px 'National Park', sans-serif";
        const ctx = inscriptionTexture.getContext();
        ctx.fillStyle = inscriptionBaseColor.toHexString();
        ctx.fillRect(0, 0, inscriptionTextureDimensions.width, inscriptionTextureDimensions.height);

        const lineBreakRes = breakTextForCanvas(
            inputString,
            250,
            format,
            ctx,
            3,
            0.9
        );

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.font = format.replace("#FONTSIZE#", lineBreakRes.fontSize.toFixed(0));

        await document.fonts.load(ctx.font);
        stuffText(lineBreakRes.snippets, 0.8, [0,15], ctx);

        inscriptionTexture.update();
    }

    async function setSummonDisplay(inputString: string) {
        const format = "#FONTSIZE#px 'Open Sans Condensed Greek', 'Amatic_SC_Bold', 'Open Sans Condensed', sans-serif";

        const ctx = summonTexture.getContext();
        ctx.clearRect(0, 0, summonTextureDimensions.width, summonTextureDimensions.height);

        const lineBreakRes = breakTextForCanvas(
            inputString,
            800,
            format,
            ctx,
            3,
            0.9
        );

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = format.replace("#FONTSIZE#", lineBreakRes.fontSize.toFixed(0));

        await document.fonts.load(ctx.font);
        stuffText(lineBreakRes.snippets, 0.9, [0,0], ctx);

        summonTexture.update(true, true);
    }

    $: {
        if ($hiResSetting && engine) {
            pd("hi res on");
            const pixelRatio = window.devicePixelRatio;
            engine.setHardwareScalingLevel(1.0 / pixelRatio);
        }
        else if (engine) {
            pd("hi res off");
            engine.setHardwareScalingLevel(1.0);
        }
    }

    $: if ($inscriptionQueue.length > 0) {
        // not actually treating as a queue for now
        const inscription = $inscriptionQueue[0];

        setInscription(inscription).then(() => {
            setState(State.Contemplating);
            $inscriptionQueue = [];
        });
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
