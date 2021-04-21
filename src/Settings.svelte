<script lang="ts">
    import { hiResSetting, showTargetsSetting } from "./stores";
    import Checkbox from "./Checkbox.svelte";
</script>

<div class="settings">
    <div class="setting">
        <div class="settingRow">
            <Checkbox
                isOn={$hiResSetting}
                on:click={() => $hiResSetting = !$hiResSetting}
            />
            <div class="name">High Resolution</div>
        </div>
        <div class="explanation">
            Uses every pixel on your screen to render the campfire and
            its surrounding area. Looks better, but might make your computer
            fans spin or use a lot of battery if you have an older device.
        </div>
    </div>
    <div class="setting">
        <div class="settingRow">
            <Checkbox
                isOn={$showTargetsSetting}
                on:click={() => $showTargetsSetting = !$showTargetsSetting}
            />
            <div class="name">Show Interaction Prompts</div>
        </div>
        <div class="explanation">
            Shows the prompts for where you can touch or click to interact
            with the world. Very helpful when you’re first learning how it
            works, but might be distracting once you know.
        </div>
    </div>
</div>


<style>
    .settings {
        width: 100%;

        overflow-y: scroll;
        display: flex;
        flex-direction: column;
    }

    .setting {
        margin-bottom: 10px;

        padding: 10px;

        display: flex;
        flex-direction: column;
    }

    .settingRow {
        width: 100%;
        display: flex;
        flex-direction: row;

        align-items: center;
    }

    .settingRow .name {
        margin-left: 20px;

        font-weight: bold;
        font-size: 130%;
    }

    .explanation {
        margin: 5px 10px;
    }
</style>
