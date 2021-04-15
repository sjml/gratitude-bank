1. Viewport sizing fixes
    - remove about/UI stuff
    - just figure out overall sizing of 3d and how it works with rotations
    - then add UI back in
        - revamp so it goes from title to about with smooth anims
            - title starts over curtain; moves to spot after load; about link fades in
            - on about, title moves to become header, about link becomes close and moves in
            - about text fades in
2. UX pass
    - social share card, icon
    - smarter recall procedure
    - reposition camera + wood pile to accommodate smaller screens
    - ability to put log back instead of inscribing
3. Offline enable
    - create service worker
    - build process hooks in with generated JSON hash for each file
    - JavaScript template? 
4. Art pass
    - UI
        - fade in/out instead of popping
        - add some shadow to text prompt (gets lost in fire)
        - button styling on mobile
        - entering log text on mobile bumps everything to the side; can it be multiline?
        - positioning relative to log is pretty hinky overall...
    - smarter text packing into textures
        - the way fitty does it looks pretty simple...
    - better 3d animations
    - summon FX
        - have smoke come up and it rises out, or something else that looks decent
        - continue rise (release)
        - fall back in (retain)
    - fire FX
        - moving light
        - sparks coming off
        - little moving globules
    - environment
        - lighting, sky, colors
        - trees and shrubs, little tufts of grass
        - rocks around fire
5. Stretches
    - prompts on wood pile and fire at start
    - fire FX
        - have fire briefly surge when log goes in
