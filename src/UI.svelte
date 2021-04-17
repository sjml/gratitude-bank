<script lang="ts" context="module">
    export const maxInputLength = 55;
</script>

<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    import { inscriptionRect, inscriptionQueue, summonRect, currentGratitude, summonResolution } from "./stores";
    import { storeGratitude, releaseGratitude } from "./gratitude";
    import About from "./About.svelte";

    let aboutShown = false;
    let introRunning = true;
    let aboutLinkVisible = false;

    onMount(() => {
        setTimeout(() => {
            introRunning = false;
        }, 800);
        setTimeout(() => {
            aboutLinkVisible = true;
        }, 3500);
    });


    let inputBox: HTMLInputElement = null;
    $: {
        if (inputBox) {
            inputBox.focus();
        }
    }

    let inputValue: string = "";

    function inscribe() {
        if (inputValue.length == 0) {
            return;
        }

        // correcting for iOS's virtual keyboard glitchiness
        window.scrollTo(0, 0);

        if (inputValue.length > maxInputLength) {
            // in case any stinkers hack the input field
            inputValue = inputValue.substr(0, maxInputLength);
        }

        $inscriptionQueue = [...$inscriptionQueue, inputValue];

        storeGratitude(inputValue);

        inputValue = "";
    }

    function release() {
        releaseGratitude($currentGratitude.text);
        $summonResolution = "release";
    }

    function retain() {
        $summonResolution = "retain";
    }
</script>

<div class="ui-layer" class:blocking={aboutShown}>
    <div class="header"
        class:aboutShown
    >
        <div class="title"
            class:intro={introRunning}
            transition:fade|local
        >
            Gratitude
        </div>
        {#if aboutLinkVisible}
            <div class="aboutLink"
                transition:fade|local
                on:click={() => aboutShown = !aboutShown}
            >
                {#if !aboutShown}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M128.00146,23.99963a104,104,0,1,0,104,104A104.11791,104.11791,0,0,0,128.00146,23.99963ZM128.002,192a12,12,0,1,1,12-12A12,12,0,0,1,128.002,192Zm7.99951-48.891v.89551a8,8,0,1,1-16,0v-8a8.0004,8.0004,0,0,1,8-8,20,20,0,1,0-20-20,8,8,0,0,1-16,0,36,36,0,1,1,44,35.10449Z"></path></svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M128,24A104,104,0,1,0,232,128,104.12041,104.12041,0,0,0,128,24Zm37.65625,130.34375a7.99915,7.99915,0,1,1-11.3125,11.3125L128,139.3125l-26.34375,26.34375a7.99915,7.99915,0,0,1-11.3125-11.3125L116.6875,128,90.34375,101.65625a7.99915,7.99915,0,0,1,11.3125-11.3125L128,116.6875l26.34375-26.34375a7.99915,7.99915,0,0,1,11.3125,11.3125L139.3125,128Z"></path></svg>
                {/if}
            </div>
        {/if}
    </div>

    {#if aboutShown}
        <About on:closed={() => aboutShown = false} />
    {/if}

    {#if $inscriptionRect != null}
        <form on:submit|preventDefault={inscribe}>
            <div class="inscription"
                style={`top: ${$inscriptionRect.top}px; left: ${$inscriptionRect.left}px; width: ${$inscriptionRect.width}px; height: ${$inscriptionRect.height}px;`}
            >
                <div>What are you grateful for?</div>
                <input class="type" type="text" maxlength={maxInputLength}
                    bind:this={inputBox}
                    bind:value={inputValue}
                >
                <input class="submit" type="submit" value="Inscribe" disabled={inputValue.length == 0}>
            </div>
        </form>
    {:else if $summonRect != null}
        <div class="remembering"
            style={`top: ${$summonRect.top}px; left: ${$summonRect.left}px; width: ${$summonRect.width}px; height: ${$summonRect.height}px;`}
        >
            <button on:click={release}>Release</button>
            <button on:click={retain}>Retain</button>
        </div>
    {/if}
</div>

<style>
    .ui-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 30;

        pointer-events: none;

        display: flex;
        flex-direction: column;

        overflow-y: hidden;
    }
    .ui-layer.blocking {
        pointer-events: all;
    }

    .header {
        width: 100%;
        max-width: 100%;
        margin: 0 auto;

        color: white;

        display: flex;
        justify-content: space-between;

        transition-property: max-width;
        transition-duration: 500ms;
        /* transition-timing-function: ease-in-out; */
    }
    .header.aboutShown {
        max-width: 730px;
    }

    .title {
        padding: 5px 10px;
        font-family: 'Amatic_SC';
        font-size: 40px;
        letter-spacing: 5px;
        font-weight: bold;
        text-shadow: 0px 0px 5px black;
        opacity: 1.0;

        transition-property: font-size, transform, opacity;
        transition-duration: 2400ms, 2400ms, 50ms;
        transition-delay: 0ms, 0ms, 200ms;
        transition-timing-function: ease-in-out, ease-in-out, linear;
    }
    .title.intro {
        font-size: 80px;
        transform:
            translateX(calc(50vw - 50%))
            translateY(calc(50vh - 50%));
    }
    .header.aboutShown .title {
        opacity: 0.0;
        transition-property: font-size, transform, opacity;
        /* transition-duration: 2400ms, 2400ms, 1000ms; */
        transition-delay: 0ms, 0ms, 0ms;
    }

    .aboutLink {
        margin: 10px;

        color: rgba(255, 255, 255, 0.596);
        cursor: pointer;
    }

    .aboutLink svg {
        height: 50px;
        width: 50px;
    }

    .ui-layer > * {
        pointer-events: auto;
    }

    .inscription {
        position: relative;

        color: white;

        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
    }

    .inscription div {
        width: 100%;

        font-size: 30px;

        text-align: center;
    }

    .inscription input.type {
        height: 30px;
        width: 90%;
        margin: 5px 0;

        font-family: inherit;
        font-size: 28px;
        text-align: center;

        background-color: rgba(0,0,0,0.5);
        color: white;
        border: 0px solid transparent;
        outline: none;
    }

    .inscription input.submit, .remembering button {
        padding: 5px 20px;
        color: white;
        background-color: rgba(0, 17, 68, 0.8);
        font-size: 20px;
        font-family: inherit;
        border: 2px solid black;

        opacity: 1;
        transition-property: opacity;
        transition-duration: 500ms;
    }

    .inscription input.submit:disabled {
        opacity: 0;
    }

    .inscription input.submit:active {
        background-color: rgba(62, 86, 158, 0.8);
    }

    .remembering {
        position: relative;

        color: white;

        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }
</style>
