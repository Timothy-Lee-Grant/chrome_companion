# Implementation Roadmap for Step 3: Getting More Sprites & Controls

## Overview
Fix sprite flipping and facing direction bugs, implement sprite-cycling keyboard shortcut, and add zoom/scale controls for the buddy.

**Available Sprites:**
- `pig-idle.png` (64x64, 4 frames)
- `dog-bark.png` (64x64, 11 frames)
- `cat-jump.png` (64x32, 6.5 frames)

---

## Phase 1: Fix Sprite Flipping & Facing Direction
- **Issue 1 - Flip Teleportation**: Currently flipping along right/left vertical axis. Fix to flip over middle vertical axis (transform-origin or transform direction).
- **Issue 2 - Facing Direction**: Direction is inverted. Need to reverse facing logic:
  - `dx < 0` should set `facing = 1` (face right when moving left appears wrong)
  - `dx > 0` should set `facing = -1` (face left when moving right appears wrong)
  - Or check if the sprite itself is directionally asymmetric and adjust accordingly.
- Update `updateBuddyPosition()` to invert facing calculation.
- Update `updateBuddyStyle()` transform logic if needed.
- Test on multiple websites to verify smooth transitions without teleport effect.

---

## Phase 2: Implement Sprite Cycling with Keyboard Shortcut
- **Keyboard Shortcut**: `Alt+S` (arbitrary choice - cycles through next sprite)
- Add keyboard event listener in `content.js`.
- Create sprite index tracker: `currentSpriteIndex` in `buddyState`.
- Build sprite name array: `['pig-idle', 'dog-bark', 'cat-jump']`.
- On `Alt+S`:
  - Increment index (mod sprite count).
  - Update `CURRENT_SPRITE`.
  - Update sprite config in buddy element (background-image URL, frameWidth, frameHeight, frameCount, animationDuration).
  - Log sprite change event.
  - Restart animation.
- Ensure smooth transition when switching sprites mid-movement.

---

## Phase 3: Add Zoom/Scale Controls
- **Keyboard Shortcuts**:
  - `Alt+[` to shrink sprite (decrease scale by 0.2x, minimum 0.5x)
  - `Alt+]` to grow sprite (increase scale by 0.2x, maximum 2.0x)
- Add keyboard event listener for these keys.
- Track current scale in `buddyState.scale` (default 1.0).
- Update `updateBuddyStyle()` to include `scale()` in transform:
  - `transform = translate(...) scaleX(...) scale(${buddyState.scale})`
- Adjust buddy width/height dynamically based on scale (64px * scale).
- Log scale change events.
- Test that movement bounds remain correct when scaled.

---

## Phase 4: Update SPRITE_CONFIG
- Verify all sprite configurations are correct (frameCount, animationDuration).
- Ensure background-size is set correctly for all sprites (currently `auto 64px`).
- Test animation timing for each sprite on the screen.

---

## Phase 5: Testing & Validation
- Load extension in Chrome on various websites.
- Test facing direction changes smoothly without teleport effect.
- Test sprite cycling with `Alt+S` - verify sprite changes instantly.
- Test zoom with `Alt+[` and `Alt+]` - verify scale increases/decreases correctly.
- Verify movement bounds still work when scaled (buddy doesn't go off-screen).
- Check console logs for sprite changes and scale updates.
- Ensure animations loop correctly on all sprites.

---

## Phase 6: Final Polish & Commit
- Ensure all code is clean and well-commented.
- Add documentation for keyboard shortcuts in code comments.
- Verify no console errors or warnings.
- Commit with descriptive message: "Step 3: Fix sprite flipping, add sprite cycling and zoom controls" 