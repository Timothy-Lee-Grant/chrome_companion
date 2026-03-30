# Implementation Roadmap

## Phase 1: Scaffolding (The Basics)
- [x] Create `manifest.json` with permissions for `<all_urls>`.
- [x] Define `content_scripts` and `web_accessible_resources` in manifest.
- [x] Create a dummy `buddy-sprites.png` (or a colorful div placeholder).
- [x] Verify the extension loads via `chrome://extensions`.

## Phase 2: Injection & Rendering
- [x] Write `content.js` to create an `<img>` or `<div>` element.
- [x] Inject the element into `document.body`.
- [x] Apply basic CSS in `styles.css` (fixed positioning, high z-index).

## Phase 3: The "Brain" (Movement & Logic)
- [x] Implement a `requestAnimationFrame` loop.
- [x] Add "Random Walk" logic (character picks a spot and moves there).
- [x] Implement `visibilitychange` listener to pause code on inactive tabs.
- [x] Add smooth "Lerp" movement to prevent jitter.

## Phase 4: Animation & Interaction
- [ ] Set up CSS `steps()` animation for the sprite sheet.
- [ ] Add a click listener to trigger a "special" animation state.
- [ ] Add a "Right-click" menu to hide/dismiss the buddy.

## Phase 5: Polishing
- [ ] Ensure the character doesn't walk "off-screen" on window resize.
- [ ] Optimize for battery usage (reduce calculation frequency).