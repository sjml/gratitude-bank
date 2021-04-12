<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { Engine } from "@babylonjs/core/Engines/engine";
    import type { Scene } from "@babylonjs/core/scene";
    import "@babylonjs/core/Loading/Plugins/babylonFileLoader";
    import "@babylonjs/core/Loading/loadingScreen";
    import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";

    import "@babylonjs/core/Cameras/universalCamera";
    import "@babylonjs/materials";

    import "@babylonjs/core/Lights/pointLight";
    import "@babylonjs/core/Particles";


    let loadingDone = false;
    let renderCanvas: HTMLCanvasElement;
    let engine: Engine = null;
    let scene: Scene = null;

    function CustomLoadingScreen() {
    }
    CustomLoadingScreen.prototype.displayLoadingUI = () => {
    };
    CustomLoadingScreen.prototype.hideLoadingUI = () => {
        console.log("loading done");
        loadingDone = true;
    };

    async function init() {
        engine = new Engine(renderCanvas, true, {disableWebGL2Support: true});
        engine.loadingScreen = new CustomLoadingScreen();
        scene = await SceneLoader.LoadAsync("", "./assets/campfire/campfire.babylon", engine);

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
    })
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
