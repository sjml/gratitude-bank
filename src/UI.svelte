<script lang="ts">
    import { inscriptionRect, inscriptionQueue } from "./stores";

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
        $inscriptionQueue = [...$inscriptionQueue, inputValue];
        inputValue = "";
    }
</script>

<div class="ui-layer">
    {#if $inscriptionRect != null}
        <form on:submit|preventDefault={inscribe}>
            <div class="inscription"
                style={`top: ${$inscriptionRect.top}px; left: ${$inscriptionRect.left}px; width: ${$inscriptionRect.width}px; height: ${$inscriptionRect.height}px;`}
            >
                <div>What are you grateful for?</div>
                <input class="type" type="text" maxlength=20
                    bind:this={inputBox}
                    bind:value={inputValue}
                >
                <input class="submit" type="submit" value="Inscribe" disabled={inputValue.length == 0}>
            </div>
        </form>
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

        text-align: center;
    }

    .inscription input.type {
        height: 30px;
        width: 100%;
        margin: 5px 0;

        font-size: 28px;
        font-family: monospace;
        text-align: center;

        background-color: rgba(0,0,0,0.5);
        color: white;
        border: 0px solid transparent;
        outline: none;
    }

    .inscription input.submit {
        padding: 5px 20px;
        color: white;
        background-color: rgba(0, 17, 68, 0.8);
        font-size: 20px;
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
</style>
