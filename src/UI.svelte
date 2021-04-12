<script lang="ts">
    let aboutShown = false;
</script>

<div class="about" class:shown={aboutShown}>
    <div class="aboutText">
        <h1>Gratitude Bank</h1>
        <p>by <a href="https://shaneliesegang.com" target="_blank">Shane Liesegang, SJ</a></p>

        <h2>Gratitude?</h2>
        <p>
            This is a tool meant to help you cultivate a sense of gratitude, and to remind you
            of the things in your life which draw you towards it. It only puts out what you put
            into it — think of it as a storehouse for your own experiences of gratitude.
        </p>

        <p>
            While my motivation for building this comes from my spiritual practices, there is nothing
            specifically religious about it, so if you are not inclined in that direction, you may
            still find something of value in the tool.
        </p>

        <p>
            When I was a Jesuit novice, my spiritual director was fond of reminding us to
            “go to gratitude” when faced with some challenge or spiritual bump in the road. It’s
            part of the twice-daily prayer practice of Jesuits to review our thoughts, words, and
            actions in a methodical fashion, starting with gratitude for all our experiences. The
            reflection on gratitude is a crucial step, possibly the key to the entire experience
            of Ignatian spirituality.
        </p>

        <h2>How do I use it?</h2>
        <p>
            When you find something or think of something in your life that inspires gratitude,
            take a moment to reflect on it. Inscribe it in your memory, along with why you are
            grateful for it. It can be specific or general, informative or cryptic. Whatever
            works for you. You don’t have to explain or justify your gratitude to anyone.
        </p>

        <p>
            Examples:
        </p>
        <ul>
            <li>The morning light hitting Bell Rock in Sedona</li>
            <li>Strawberry Danishes</li>
            <li>The way my cat looks embarrassed when she misses a jump</li>
            <li>My friend Sarah</li>
            <li>January 26, 2005</li>
            <li>The time my brother told me how much he respected me</li>
            <li>Road trips</li>
            <li>The sea</li>
        </ul>

        <p>
            Later, you can return to the fire when you need to be reminded of gratitude.
            It will bring back one of the things you’ve stored away, to remind you of
            something good from your life. Once you’ve seen it, you can choose to retain
            it (if you’d like to see it again) or release it (if you feel it has served its
            purpose).
        </p>

        <h2>Privacy</h2>
        <p>
            Nothing ever leaves your browser. There’s no login necessary because nothing
            is stored on any servers. I don’t need (nor want) to see what you are grateful
            for; that’s between you and the fire.
        </p>
        <p>
            The downside of that, though, is that I store the items locally on your browser,
            which means that if you clear the cache (or don’t visit the site for a long time),
            it may lose your data. That might make you sad, and that’s the last thing I want!
        </p>
        <p>
            The way to avoid that is to add this page to the home screen of your phone. On iOS,
            tap the “Share” button and select “Add to Home Screen.” On Android, tap the menu icon
            (the three dots at the top right) and choose “Add to Home screen.”
        </p>
    </div>
</div>

<style>
    .about {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 100;
        overflow-y: scroll;

        color: white;
        background-color: rgba(0,0,0,0.8);
        display: none;

        justify-content: center;
    }

    .about.shown {
        display: flex;
    }

    .aboutText {
        max-width: 600px;
        margin: 20px;
    }
</style>