* Store procedure:
    - log animates from pile to center of view
    - text prompt and input
    - render onto log... somehow? 😬
    - log goes in fire and disappears (fire briefly surges)
    - store item to local storage
        - text, entered date, last seen, times seen
* Withdraw procedure
    - select item from local storage
    - render to canvas, make to texture
    - rise out fire with nice effects, stay hovering in front
    - swipe or tap down to retain, swipe or tap up to release
        - if retain: mark last seen
        - if release: remove from storage
* Interface polish (opening title, font choices, etc.)
* Write service worker for offline use
* Build process
    - minify JSON
    - calculate hashes for every file, write to service worker
