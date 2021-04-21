<script>
    import { showTargetsSetting } from "./stores";
    import { pd } from "./util";

    $: {
        if ($showTargetsSetting) {
            pd("show targets on");
        }
        else {
            pd("show targets off")
        }
    }
</script>

{#if $showTargetsSetting}
    <div class="interaction-anim" on:click>
        <div class="base"></div>
        <div class="mover"></div>
    </div>
{/if}

<style>
    .interaction-anim {
        position: relative;
        width: 50px;
        height: 50px;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .base {
        position: absolute;
        width: 15%;
        height: 15%;
        background-color: white;
        border-radius: 50%;
    }

    .mover {
        width: 100%;
        height: 100%;
        background-color: white;
        border-radius: 50%;
        opacity: 1;
        animation: interaction-anim 2.8s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }

    @keyframes interaction-anim {
        0% {
            transform: scale(0.0);
            opacity: 1;
        }
        90% {
            transform: scale(1.0);
            opacity: 0;
        }
        100% {
            transform: scale(1.0);
            opacity: 0;
        }
    }
</style>
