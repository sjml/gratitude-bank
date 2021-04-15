<script lang="ts" context="module">
    export const maxInputLength = 55;
</script>

<script lang="ts">
    import { inscriptionRect, inscriptionQueue, summonRect, currentGratitude, summonResolution } from "./stores";
    import { storeGratitude, releaseGratitude } from "./util";

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

<div class="ui-layer">
    <div class="title">Gratitude</div>

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
    }

    .title {
        position: absolute;
        top: 0;
        left: 0;

        color: white;
        padding: 5px 10px;
        font-family: 'Amatic_SC';
        font-size: 40px;
        letter-spacing: 5px;
        font-weight: bold;
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
