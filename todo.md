* Withdraw procedure
    - render to canvas, make to texture
    - rise out fire with nice effects, stay hovering in front
    - swipe or tap down to retain, swipe or tap up to release
        - if retain: mark last seen
        - if release: remove from storage
* figure out why position/aspect get screwed up when rotating device
    - think this is mostly fixed by moving height to 100vh, but not tested to the extreme
    - may need to do JS setting instead of relying on CSS :(
* UX polish
    - opening title, about page, etc.
    - social share card
    - smarter recall procedure
    - prompts on wood pile and fire at start
    - reposition camera + wood pile to accommodate smaller screens
    - ability to put log back instead of inscribing
        - reverse animation, go back to ready state
* Visual pass:
    - better 3d animations
    - UI
        - fade in/out instead of popping
        - add some shadow to text prompt (gets lost in fire)
        - button styling on mobile
        - entering log text on mobile bumps everything to the side; can it be multiline?
    - environment
        - overall lighting, sky, colors
        - trees and shrubs, little tufts of grass
        - rocks around fire
        - maybe some critters moving around? let's not get too ambitious here...
    - fire FX
        - moving light
        - sparks coming off
        - little moving globules
        - have fire briefly surge when log goes in
* Make service worker for offline use
* Build process
    - minify JSON
    - calculate hashes for every file, write to service worker
