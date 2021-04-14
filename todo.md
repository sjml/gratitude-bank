* Withdraw procedure
    - select item from local storage
        - pull list, sort by last seen, then by number of times seen, then pick randomly
        - record seen data for chosen item, re-store the list
    - render to canvas, make to texture
    - rise out fire with nice effects, stay hovering in front
    - swipe or tap down to retain, swipe or tap up to release
        - if retain: mark last seen
        - if release: remove from storage
* figure out why position/aspect get screwed up when rotating device
* UX polish
    - opening title
    - ability to put log back instead of inscribing
    - UI fades in/out instead of popping
    - prompts on wood pile and fire at start
* Visual pass:
    - better animations
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
