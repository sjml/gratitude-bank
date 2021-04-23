<script>
    import { onMount } from "svelte";
    import { showSettings } from "./stores";

    onMount(() => {
        $showSettings = true;
    });

    const versionString: string = "#GRATITUDE_VERSION_STRING#";

    function getVersion() {
        // truncated to make find/replace simpler in the build process :D
        if (versionString.startsWith("#GRATITUDE_VERSION_STRING")) {
            return "[dev]";
        }
        else {
            return `version ${versionString}`;
        }
    }

    function scrollToSaving() {
        // don't want the URL to get messy
        const tgtAnchor = document.getElementById("saving-your-gratitude");
        tgtAnchor.scrollIntoView({
            behavior: "smooth",
            block:"center"
        });
        window.scrollTo(0, 0);
    }
</script>

<div class="about">
    <div class="meta">
        <div class="metaTop">
            <h1>Gratitude Bank</h1>
            <div class="versionTag">{getVersion()}</div>
        </div>
        <p class="attribution">by
            <a href="https://shaneliesegang.com" target="_blank">Shane Liesegang, SJ</a>
        </p>
    </div>

    <p>
        This is a tool meant to help you cultivate a sense of gratitude, and to remind
        you of the things in your life which draw you towards it. It only puts out
        what you put into it — think of it as a storehouse for your own experiences of
        gratitude.
    </p>
    <p>
        Note that you can add this page to your phone’s home screen and treat it like
        a regular application! See the section below on <span class="inner-link" on:click={scrollToSaving}>
        saving your gratitude</span> for details.
    </p>
    <p>
        Let me know what you think of it, especially if you like it or end up using it! The
        easiest way to reach out is my public-facing Twitter profile,
        <a href="https://twitter.com/OptimistPanda" target="_blank">@OptimistPanda</a>.
    </p>

    <h2 id="why-gratitude">Why Gratitude?</h2>
    <p>
        While my motivation for building this comes from my spiritual practices, there
        is nothing specifically religious about it, so if you are not inclined in that
        direction, you may still find something of value here.
    </p>
    <p>
        When I was a <a href="https://beajesuit.org/jesuit-formation/the-novitiate/"
        target="_blank">Jesuit novice</a>, my spiritual director was fond of reminding
        us to “go to gratitude” when faced with some challenge or spiritual bump in the
        road. It’s part of <a href="https://www.ignatianspirituality.com/ignatian-prayer/the-examen/"
        target="_blank"> the twice-daily prayer practice of Jesuits</a> to review our
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
        Things you might be grateful for...
        <ul>
            <li>The morning light hitting Cathedral Rock in Sedona</li>
            <li>Strawberry Danishes</li>
            <li>The way my cat looks embarrassed when she misses a jump</li>
            <li>My friend Sarah</li>
            <li>January 23, 2006</li>
            <li>That smell in the early morning after it rains</li>
            <li>The growth I’ve had in therapy</li>
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
        It will bring back one of the things you’ve stored away, and you can recall
        something good from your life. Once you’ve seen it, you can choose to retain
        it (if you’d like to see it again) or release it (if you feel it has served
        its purpose).
    </p>

    <h2 id="privacy">Privacy</h2>
    <p>
        No information from this page ever leaves your computer or phone. There’s no login
        necessary because nothing is stored on any servers. I don’t need (nor do I want) to
        see what you are grateful for; that’s between you and the fire.
    </p>

    <h2 id="saving-your-gratitude">Saving Your Gratitude</h2>
    <p>
        The downside of not storing your data on a server, though, is that it’s instead
        stored locally on your browser or phone. That means that if you clear the site data
        (or don’t visit for a while), it may lose your stored gratitude. That could make you
        sad, and that’s the last thing I want!
    </p>
    <p>
        The way to avoid that problem is to add this page to the home screen of your phone. On
        iOS, tap the “Share” button (the little box with the arrow coming up) and select
        “Add to Home Screen.” On Android, tap the menu icon (the three dots at the top right)
        and choose “Add to Home screen.” It should work happily even when you are offline, just
        like a normal app.
    </p>
    <p>
        (On a computer, browsers other than Safari should hold onto the data indefinitely, so
        you’re safe as long as you use Firefox/Chrome/Edge/Brave/etc. and do not intentionally
        clear the data.)
    </p>

    <h2 id="source">Source Code</h2>
    <p>
        If you’re the kind of person who cares about such things, the source code for
        this little project is on <a href="https://github.com/sjml/gratitude-bank"
        target="_blank">GitHub</a>.
    </p>
    <p>
        It uses <a href="https://www.babylonjs.com/" target="_blank">Babylon.js</a>,
        <a href="https://svelte.dev" target="_blank">Svelte</a>, and
        <a href="https://www.snowpack.dev/" target="_blank">Snowpack</a>. The fonts are
        <a href="https://nationalparktypeface.com/" target="_blank">National Park Typeface</a>
        and <a href="https://fonts.google.com/specimen/Amatic+SC#standard-styles"
        target="_blank">Amatic SC</a>. The user interface uses <a href="https://phosphoricons.com/"
        target="_blank">Phosphor Icons</a>.
    </p>

    <h2 class="future">Future</h2>
    <p>
        I consider this to be mostly done, unless some big glaring bug is found. I may come
        back and do more visual polish at some point... I am not a 3D artist (nor even much
        of a 2D artist) and it kinda shows. I hope my earnestness makes up for my lack of
        skill.
    </p>
</div>

<style>
    .about {
        padding: 25px 10px 25px 25px;
        overflow-y: scroll;
        scroll-behavior: smooth;
    }

    .inner-link {
        text-decoration: underline;
        cursor: pointer;
    }

    h1 {
        margin: 0;
        font-family: 'Amatic_SC';
        font-size: 60px;
    }

    h2 {
        margin: 40px 0 10px 0;
    }

    .meta {
        margin-bottom: 40px;
    }

    .meta p {
        margin: 0;
    }

    .metaTop {
        display: flex;
        justify-content: space-between;
    }

    .versionTag {
        opacity: 0.3;
        text-align: right;
    }

    a, a:visited {
        color: white;
    }
</style>
