<script lang="ts" context="module">
    export const maxInputLength = 55;
</script>

<script lang="ts">
    import { fade } from "svelte/transition";

    import { State } from "./types";
    import {
        currentState,
        showSettings,
        woodPileRect,
        inscriptionRect, inscriptionQueue,
        summonRect, currentGratitude, summonResolution, gratitudeCount, woodPileReturnSignal, campfireRect
    } from "./stores";
    import { storeGratitude, releaseGratitude } from "./gratitude";
    import About from "./About.svelte";
    import Settings from "./Settings.svelte";
    import InteractionPrompt from "./InteractionPrompt.svelte";

    let modalMode = 0;
    let introRunning = true;
    let headerButtonsVisible = false;

    $: if (introRunning && $currentState != State.Preload) {
        introRunning = false;
        setTimeout(() => {
            headerButtonsVisible = true;
        }, 3500);
    }


    let inputBox: HTMLInputElement = null;
    $: {
        if (inputBox) {
            setTimeout(() => {
                inputBox.focus();
            }, 100);
        }
    }

    let inputValue: string = "";

    function inscribe() {
        if (inputValue.length == 0) {
            return;
        }

        // correcting for iOS's virtual keyboard glitchiness
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 20);

        if (inputValue.length > maxInputLength) {
            // in case any stinkers hack the input field
            inputValue = inputValue.substr(0, maxInputLength);
        }

        $inscriptionQueue = [...$inscriptionQueue, inputValue];

        storeGratitude(inputValue);

        inputValue = "";
    }

    function ret() {
        $woodPileReturnSignal = true;
    }

    function release() {
        releaseGratitude($currentGratitude.text);
        $summonResolution = "release";
    }

    function retain() {
        $summonResolution = "retain";
    }
</script>

<div class="ui-layer" class:blocking={modalMode > 0}>
    {#if !headerButtonsVisible}
        <div class="fontLoader unselectable">
            because αγαπη
        </div>
    {/if}
    <div class="header"
        class:modalUp={modalMode > 0}
    >
        <div class="title unselectable"
            class:intro={introRunning}
            transition:fade|local
        >
            Gratitude
        </div>
        <div class="spacer"></div>
        {#if headerButtonsVisible && $currentState == State.Ready}
            {#if $showSettings && modalMode == 0}
                <div class="headerButton"
                    transition:fade
                    on:click={() => modalMode = 2}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M238.26562,108.35476A15.96155,15.96155,0,0,0,230.269,97.16189L209.74561,85.76883c-1.315-2.5503-2.75342-5.0459-4.29981-7.46094l.395-23.4917a15.93081,15.93081,0,0,0-5.68213-12.50977,111.53059,111.53059,0,0,0-34.03808-19.62158,15.96193,15.96193,0,0,0-13.69288,1.32862L132.2998,36.09109c-2.86816-.13623-5.749-.13916-8.61132-.00683L103.542,23.99637a15.92639,15.92639,0,0,0-13.67578-1.33448A111.52894,111.52894,0,0,0,55.854,42.32986a15.96061,15.96061,0,0,0-5.69482,12.522l.39453,23.47022c-1.55127,2.415-2.99365,4.90869-4.31152,7.45459L25.70117,97.179a15.96884,15.96884,0,0,0-8.00049,11.21436,111.54254,111.54254,0,0,0,.0337,39.25244A15.96155,15.96155,0,0,0,25.731,158.83865l20.52343,11.39307c1.31495,2.55029,2.75342,5.0459,4.29981,7.46094l-.395,23.49169a15.93079,15.93079,0,0,0,5.68213,12.50977A111.53059,111.53059,0,0,0,89.87939,233.3157a15.95994,15.95994,0,0,0,13.69288-1.32861l20.12793-12.07764c2.86816.13672,5.749.13867,8.61132.00684L152.458,232.00418a15.92909,15.92909,0,0,0,13.67578,1.33447,111.52853,111.52853,0,0,0,34.01221-19.668,15.9606,15.9606,0,0,0,5.69482-12.522l-.39453-23.47021c1.55127-2.415,2.99365-4.9087,4.31152-7.45459l20.541-11.40235a15.971,15.971,0,0,0,8.00049-11.21435A111.5426,111.5426,0,0,0,238.26562,108.35476Zm-66.26953,19.64551a44,44,0,1,1-44-44A44.04972,44.04972,0,0,1,171.99609,128.00027Z"></path></svg>
                </div>
            {/if}

            <div class="headerButton"
                transition:fade
                on:click={() => {modalMode = modalMode == 0 ? 1 : 0}}
            >
                {#if modalMode == 0}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M128.00146,23.99963a104,104,0,1,0,104,104A104.11791,104.11791,0,0,0,128.00146,23.99963ZM128.002,192a12,12,0,1,1,12-12A12,12,0,0,1,128.002,192Zm7.99951-48.891v.89551a8,8,0,1,1-16,0v-8a8.0004,8.0004,0,0,1,8-8,20,20,0,1,0-20-20,8,8,0,0,1-16,0,36,36,0,1,1,44,35.10449Z"></path></svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M128,24A104,104,0,1,0,232,128,104.12041,104.12041,0,0,0,128,24Zm37.65625,130.34375a7.99915,7.99915,0,1,1-11.3125,11.3125L128,139.3125l-26.34375,26.34375a7.99915,7.99915,0,0,1-11.3125-11.3125L116.6875,128,90.34375,101.65625a7.99915,7.99915,0,0,1,11.3125-11.3125L128,116.6875l26.34375-26.34375a7.99915,7.99915,0,0,1,11.3125,11.3125L139.3125,128Z"></path></svg>
                {/if}
            </div>
        {/if}
    </div>

    {#if modalMode > 0}
        <div class="modalHost"
            transition:fade|local
        >
            {#if modalMode == 1}
                <About />
            {:else if modalMode == 2}
                <Settings />
            {/if}
        </div>
    {/if}

    {#if $woodPileRect !== null && $woodPileRect.width > 0}
        <div class="logInteract"
            style={`top: ${$woodPileRect.top}px; left: ${$woodPileRect.left}px; width: ${$woodPileRect.width}px; height: ${$woodPileRect.height}px;`}
        >
            {#if $currentState == State.Ready && headerButtonsVisible && modalMode == 0}
                <div class="ipWrapper"
                    in:fade|local={{duration: 2000}}
                    out:fade|local={{duration: 1000}}
                >
                    <InteractionPrompt />
                </div>
            {:else if $currentState == State.Scribing}
                <div class="uiButton unselectable" on:click={ret}>Return</div>
            {/if}
        </div>
    {/if}

    {#if $campfireRect !== null && $campfireRect.width > 0}
        <div class="campfireInteract"
            style={`top: ${$campfireRect.top}px; left: ${$campfireRect.left}px; width: ${$campfireRect.width}px; height: ${$campfireRect.height}px;`}
        >
            {#if $currentState == State.Ready && headerButtonsVisible && modalMode == 0 && $gratitudeCount > 0}
                <div class="ipWrapper"
                    in:fade|local={{duration: 2000}}
                    out:fade|local={{duration: 1000}}
                >
                    <InteractionPrompt />
                </div>
            {/if}
        </div>
    {/if}

    {#if $currentState == State.Scribing && $inscriptionRect !== null }
        <form on:submit|preventDefault={inscribe}>
            <div class="inscription"
                style={`top: ${$inscriptionRect.top}px; left: ${$inscriptionRect.left}px; width: ${$inscriptionRect.width}px; height: ${$inscriptionRect.height}px;`}
                transition:fade|local
            >
                <div class="prompt unselectable">What are you grateful for?</div>
                <input class="type" type="text" maxlength={maxInputLength}
                    bind:this={inputBox}
                    bind:value={inputValue}
                >
                <div class="uiButton unselectable" on:click={inscribe} class:disabled={inputValue.length == 0}>Inscribe</div>
            </div>
        </form>
    {:else if $currentState == State.Remembering && $summonRect !== null }
        <div class="remembering"
            style={`top: ${$summonRect.top}px; left: ${$summonRect.left}px; width: ${$summonRect.width}px; height: ${$summonRect.height}px;`}
            transition:fade|local
        >
            <div class="uiButton unselectable" on:click={release}>Release</div>
            <div class="uiButton unselectable" on:click={retain}>Retain</div>
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
        overflow-y: hidden;

        display: flex;
        flex-direction: column;
    }
    .ui-layer.blocking {
        pointer-events: all;
    }

    .unselectable {
        -webkit-user-select: none;
         -khtml-user-select: none;
           -moz-user-select: none;
            -ms-user-select: none;
                user-select: none;
    }

    .fontLoader {
        font-family: 'Open Sans Condensed Greek', 'Open Sans Condensed';
        position: fixed;
        top: 0;
        left: 0;
        color: rgb(16, 16, 50, 0.1);
    }

    .header {
        width: 100%;
        max-width: 100%;
        margin: 0 auto;

        color: white;
        transition-property: max-width;
        transition-duration: 500ms;
        /* transition-timing-function: ease-in-out; */

        display: flex;
        justify-content: space-between;
    }
    .header.modalUp {
        max-width: 730px;
    }

    .modalHost {
        position: relative;
        max-width: 700px;
        max-height: 85%;
        margin: 0 auto;

        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        font-size: 20px;

        display: flex;
        flex-direction: column;
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
        font-size: 100px;
        transform: translate3d(calc(50vw - 50%), calc(50vh - 50%), 0);
    }
    .header.modalUp .title {
        opacity: 0.0;

        transition-property: font-size, transform, opacity;
        /* transition-duration: 2400ms, 2400ms, 1000ms; */
        transition-delay: 0ms, 0ms, 0ms;
    }

    .header .spacer {
        flex-grow: 2;
    }

    .headerButton {
        margin: 10px;

        height: 50px;
        width: 50px;
        color: rgba(255, 255, 255, 0.596);
        cursor: pointer;
    }

    .ui-layer > * {
        pointer-events: auto;
    }

    .inscription {
        position: absolute;

        color: white;
        padding-top: 20px;

        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .inscription .prompt {
        width: 100%;

        font-size: 30px;
        text-align: center;
        text-shadow: 0px 0px 8px black;
    }

    .inscription input.type {
        height: 30px;
        width: 90%;
        max-width: 85vw;
        margin: 5px 0;

        font-family: inherit;
        font-size: 28px;
        text-align: center;
        background-color: rgba(0,0,0,0.5);
        color: white;
        border: 0px solid transparent;
        outline: none;
    }

    .uiButton {
        width: auto;

        padding: 5px 20px;
        color: white;
        background-color: rgba(28, 46, 99, 0.8);
        border: 2px solid rgb(133, 133, 133);
        font-size: 20px;
        font-family: inherit;
        text-shadow: 0px 0px 8px black;
        pointer-events: all;
        cursor: default;
        opacity: 1;

        transition-property: opacity;
        transition-duration: 500ms;
    }

    .uiButton.disabled {
        opacity: 0;
    }

    .uiButton:active {
        background-color: rgba(95, 114, 173, 0.8)
    }

    .remembering {
        position: absolute;

        color: white;

        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }

    .remembering .uiButton {
        margin: 30px;
    }

    .logInteract {
        position: absolute;
        pointer-events: none;

        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
    }

    .campfireInteract {
        position: absolute;
        pointer-events: none;

        display: flex;
        justify-content: center;
    }

    .campfireInteract .ipWrapper {
        position: relative;
        top: 75px;
        left: -23px;
    }

    @media only screen and (max-width: 414px) {
        .logInteract .uiButton {
            position: relative;
            left: 45px;
        }

        .inscription {
            padding-top: 0px;
        }
    }
</style>
