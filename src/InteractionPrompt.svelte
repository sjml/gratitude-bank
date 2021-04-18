<script></script>

<div class="interaction-anim">
    <div></div>
    <div></div>
</div>

<style>
    .interaction-anim {
        display: inline-block;
        position: relative;
        width: 80px;
        height: 80px;
    }

    .interaction-anim div {
        position: absolute;
        border: 4px solid #fff;
        opacity: 0;
        border-radius: 50%;
        animation: interaction-anim 3s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }

    .interaction-anim div:nth-child(2) {
        animation-delay: -1.4s;
    }

    @keyframes interaction-anim {
        0% {
            top: 36px;
            left: 36px;
            width: 0;
            height: 0;
            opacity: 0;
        }
        5% {
            top: 36px;
            left: 36px;
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            top: 0px;
            left: 0px;
            width: 72px;
            height: 72px;
            opacity: 0;
        }
    }
</style>
