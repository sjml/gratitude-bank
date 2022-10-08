<script lang="ts">
    import { gratitudeCount, hiResSetting, showTargetsSetting } from "./stores";
    import { getGratitudeList } from "./gratitude";
    import Checkbox from "./Checkbox.svelte";

    let copying = false;
    function copyData() {
        const gratData = getGratitudeList();
        const gratDataOut = gratData.map((gd) => {
            return {
                text: gd.text,
                storedOn: new Date(gd.storedOn).toISOString(),
                lastSeen: gd.lastSeen == null ? gd.lastSeen : new Date(gd.lastSeen).toISOString(),
                timesSeen: gd.timesSeen,
            }
        });
        navigator.clipboard.writeText(JSON.stringify(gratDataOut, null, 2));
        copying = true;
        setTimeout(() => {
            copying = false;
        }, 500);
    }

    function summonShare() {
        navigator.share({
            title: "Gratitude Bank",
            text: "A small tool to help you remember things that inspire gratitude, so you can recall them later when you need to. Created by Shane Liesegang, SJ.",
            url: "https://shaneliesegang.com/projects/gratitude"
        });
    }
</script>

<div class="settings">
    <div class="setting">
        <div class="settingRow">
            <Checkbox
                isOn={$hiResSetting}
                on:click={() => $hiResSetting = !$hiResSetting}
            />
            <div class="name"
                on:click={() => $hiResSetting = !$hiResSetting}
            >
                High Resolution
            </div>
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
            <div class="name"
                on:click={() => $showTargetsSetting = !$showTargetsSetting}
            >
                Show Interaction Prompts
            </div>
        </div>
        <div class="explanation">
            Shows the prompts for where you can touch or click to interact
            with the world. Very helpful when you’re first learning how it
            works, but might be distracting once you know.
        </div>
    </div>
    {#if navigator.share}
    <div class="setting">
        <div class="clickAction"
            on:click={summonShare}
        >
            <div class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><polyline points="86 58 128 16 170 58" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline><line x1="128" y1="128" x2="128" y2="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><path d="M176,96h24a8,8,0,0,1,8,8V208a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V104a8,8,0,0,1,8-8H80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path></svg>            </div>
            <div class="explanation">
                Click or tap here to share this tool with someone else who might like it.
            </div>
        </div>
    </div>
    {/if}
    {#if navigator.clipboard && $gratitudeCount > 0}
    <div class="setting">
        <div class="clickAction"
            on:click={copyData}
        >
            <div class="icon">
                {#if copying}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M215.99414,31.99316h-128a8.0004,8.0004,0,0,0-8,8v40.001h-40.001a8.0004,8.0004,0,0,0-8,8v128a8.0004,8.0004,0,0,0,8,8h128a8.00039,8.00039,0,0,0,8-8v-40.001h40.001a8.00039,8.00039,0,0,0,8-8v-128A8.0004,8.0004,0,0,0,215.99414,31.99316Zm-8,128h-32.001v-71.999a8.00039,8.00039,0,0,0-8-8h-71.999v-32.001h112Z"></path></svg>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><polyline points="168 167.993 216 167.993 216 39.993 88 39.993 88 87.993" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></polyline><rect x="39.99902" y="87.99414" width="128" height="128" stroke-width="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"></rect></svg>
                {/if}
            </div>
            <div class="explanation">
                Click or tap here to copy your gratitude data in JSON format so you can
                paste it somewhere else if you want to.
            </div>
        </div>
    </div>
    {/if}
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
        -webkit-user-select: none;
         -khtml-user-select: none;
           -moz-user-select: none;
            -ms-user-select: none;
                user-select: none;
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

    .clickAction {
        margin-right: 20px;
        width: 75%;
        margin: 0 auto;
        cursor: pointer;

        display: flex;
        align-items: center;
    }

    .clickAction .icon {
        min-width: 40px;
        max-width: 40px;
    }
</style>
