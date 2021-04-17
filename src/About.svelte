<script>
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";

    const dispatch = createEventDispatcher();
</script>

<div class="about"
    transition:fade|local
>
    <div class="nav">
        <div class="close" on:click={() => dispatch("closed")}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"></rect><path d="M128,24A104,104,0,1,0,232,128,104.12041,104.12041,0,0,0,128,24Zm37.65625,130.34375a7.99915,7.99915,0,1,1-11.3125,11.3125L128,139.3125l-26.34375,26.34375a7.99915,7.99915,0,0,1-11.3125-11.3125L116.6875,128,90.34375,101.65625a7.99915,7.99915,0,0,1,11.3125-11.3125L128,116.6875l26.34375-26.34375a7.99915,7.99915,0,0,1,11.3125,11.3125L139.3125,128Z"></path></svg>
        </div>
    </div>

    <div class="aboutContent">
        <h1>Gratitude Bank</h1>
        <p class="attribution">by <a href="https://shaneliesegang.com" target="_blank">Shane Liesegang, SJ</a></p>

        <h2 id="why-gratitude">Why Gratitude?</h2>
        <p>
            This is a tool meant to help you cultivate a sense of gratitude, and to remind
            you of the things in your life which draw you towards it. It only puts out
            what you put into it — think of it as a storehouse for your own experiences of
            gratitude.
        </p>
        <p>
            While my motivation for building this comes from my spiritual practices, there
            is nothing specifically religious about it, so if you are not inclined in that
            direction, you may still find something of value here.
        </p>
        <p>
            When I was a <a href="https://beajesuit.org/jesuit-formation/the-novitiate/" target="_blank">
            Jesuit novice</a>, my spiritual director was fond of reminding us to
            “go to gratitude” when faced with some challenge or spiritual bump in the
            road. It’s part of <a href="https://www.ignatianspirituality.com/ignatian-prayer/the-examen/" target="_blank">
            the twice-daily prayer practice of Jesuits</a> to review our
            thoughts, words, and actions in a methodical fashion, starting with gratitude
            for all our experiences. The reflection on gratitude is a crucial step,
            possibly the key to the entire experience of Ignatian spirituality.
        </p>

        <h2 id="how-to-use-it">How to use it</h2>
        <p>
            When you find something or think of something in your life that inspires
            gratitude, take a moment to reflect on it. Tap on the wood pile to inscribe
            into the rememberance fire, and make sure to place your context of gratitude into
            your own biological memory. It can be specific or general, informative or cryptic.
            Whatever works for you. You don’t have to explain or justify your gratitude to anyone.
        </p>

        <div>
            Things you might want to remember...
            <ul>
                <li>The morning light hitting Bell Rock in Sedona</li>
                <li>Strawberry Danishes</li>
                <li>The way my cat looks embarrassed when she misses a jump</li>
                <li>My friend Sarah</li>
                <li>January 23, 2006</li>
                <li>Sitting on the porch with grandpa</li>
                <li>Road trips</li>
                <li>The sea</li>
                <li>🔮🍦</li>
                <li>منقوشه زعتر و جبنة</li>
                <li>渋谷交差点</li>
            </ul>
        </div>

        <p>
            Later, you can tap on the fire when you need to be reminded of gratitude.
            It will bring back one of the things you’ve stored away, to remind you of
            something good from your life. Once you’ve seen it, you can choose to retain
            it (if you’d like to see it again) or release it (if you feel it has served
            its purpose).
        </p>

        <h2 id="privacy">Privacy</h2>
        <p>
            Nothing ever leaves your browser. There’s no login necessary because nothing
            is stored on any servers. I don’t need (nor want) to see what you are grateful
            for; that’s between you and the fire.
        </p>
        <p>
            The downside of that, though, is that I store the items locally on your
            browser. That means that if you clear the cache (or don’t visit the site for a
            while), it may lose your data. That might make you sad, and that’s the last
            thing I want!
        </p>
        <p>
            The way to avoid that is to add this page to the home screen of your phone. On
            iOS, tap the “Share” button and select “Add to Home Screen.” On Android, tap
            the menu icon (the three dots at the top right) and choose “Add to Home
            screen.”
        </p>

        <h2 id="source">Source</h2>
        <p>
            If you’re the kind of person who cares about such things, the source code for
            this little project is on <a href="https://github.com/sjml/gratitude" target="_blank">GitHub</a>.
        </p>
        <p>
            It uses <a href="https://www.babylonjs.com/" target="_blank">Babylon.js</a>,
            <a href="https://svelte.dev" target="_blank">Svelte</a>, and
            <a href="https://www.snowpack.dev/" target="_blank">Snowpack</a>.
        </p>
    </div>
</div>

<style>
    .about {
        position: relative;
        max-width: 700px;
        height: 90vh;
        margin: auto;

        background-color: rgba(0, 0, 0, 0.6);
        color: white;
        font-size: 20px;

        display: flex;
        flex-direction: column;
    }

    .nav {
        width: 100%;

        display: flex;
        justify-content: flex-end;
    }

    .close {
        cursor: pointer;
    }

    .close svg {
        height: 40px;
        width: 40px;
    }

    .aboutContent {
        overflow-y: scroll;

        padding: 25px 10px 25px 25px;
    }

    h1 {
        margin: 0;
        font-family: 'Amatic_SC';
    }

    h2 {
        margin: 40px 0 10px 0;
    }

    p.attribution {
        margin-top: 0;
    }

    a, a:visited {
        color: white;
    }

    /* mix of scrollbar directives to work across browsers */
    .aboutContent {
        scrollbar-width: thin;
        scrollbar-color: rgb(185, 185, 185) black;
    }

    .aboutContent::-webkit-scrollbar {
        width: 12px;
    }

    .aboutContent::-webkit-scrollbar-track {
        background: transparent;
    }

    .aboutContent::-webkit-scrollbar-thumb {
        background-color: rgb(185, 185, 185);
        border-radius: 20px;
        border: 3px solid black;
    }
</style>
