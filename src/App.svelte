<script lang="ts">
    import UI from "./UI.svelte";

    let Campfire: any;
    import("./Campfire.svelte").then(res => Campfire = res.default);
</script>

<UI/>

{#if Campfire}
    <svelte:component this={Campfire}/>
{/if}

<style>
</style>
