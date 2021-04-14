* Store procedure:
    - store item to local storage
        - text, entered date, last seen, times seen
* Withdraw procedure
    - select item from local storage
    - render to canvas, make to texture
    - rise out fire with nice effects, stay hovering in front
    - swipe or tap down to retain, swipe or tap up to release
        - if retain: mark last seen
        - if release: remove from storage
* figure out why position/aspect get screwed up when rotating device
* UX polish
    - opening title
    - ability to put log back instead of inscribing
* Visual pass:
    - overall lighting, sky, colors
    - trees and shrubs
    - rocks around fire
    - moving light
    - sparks coming off fire
    - little moving globules in fire
    - have fire briefly surge when log goes in
    - UI fades in/out instead of popping
* Write service worker for offline use
* Build process
    - minify JSON
    - calculate hashes for every file, write to service worker
