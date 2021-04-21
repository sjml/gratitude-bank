<script lang="ts">
    export let isOn: boolean;
</script>

<div class="checkbox"
    on:click
>
    {#if isOn}
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M208.00146,32h-160a16.01582,16.01582,0,0,0-16,16V208a16.01583,16.01583,0,0,0,16,16h160a16.01582,16.01582,0,0,0,16-16V48A16.01581,16.01581,0,0,0,208.00146,32ZM177.5249,109.78125l-58.67187,56a7.98451,7.98451,0,0,1-11.04688,0l-29.32812-28a7.99571,7.99571,0,1,1,11.04687-11.5625l23.80469,22.71875L166.478,98.21875a7.99571,7.99571,0,1,1,11.04687,11.5625Z"></path></svg>
    {:else}
        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><rect x="40" y="40" width="176" height="176" rx="8" stroke-width="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"></rect></svg>
    {/if}
</div>

<style>
    .checkbox {
        width: 40px;
    }
</style>
