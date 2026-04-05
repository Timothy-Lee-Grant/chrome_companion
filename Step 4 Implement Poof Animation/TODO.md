# Implementation Roadmap for Step 4: Implement Poof Animation

## Overview
Implement a "poof" cloud animation that plays when the user clicks the buddy while it's exploring. The poof cloud builds over the buddy, teleports the buddy to the corner at frame 6, then continues the animation as the cloud dissipates. This only triggers when clicking to go to corner (not when resuming from corner).

**Poof Sprite Details:**
- File: `Poof_Animation_2.png` (448x32px, 14 frames in single row)
- Frame layout: 14 columns (x: 0-13), 1 row
- Frame sequence: Left to right (0 to 13)
- Frame size: 32x32px each (448/14 = 32)
- Total frames: 14
- Animation timing: ~0.8 seconds total (adjust based on feel)

---

## Phase 1: Add Poof Sprite Configuration
- **Add to SPRITE_CONFIG**: Create entry for 'poof-cloud' with:
  - `url`: `chrome.runtime.getURL('assets/sprites/Poof_Animation_2.png')`
  - `frameWidth`: 32
  - `frameHeight`: 32
  - `frameCount`: 14
  - `animationDuration`: 0.8 (or adjust for smooth playback)
  - `defaultState`: 'poof'
- **Update SPRITE_LIST**: Do NOT add 'poof-cloud' to cycling list (it's not a buddy sprite)
- **Verify sprite loading**: Ensure manifest.json includes the poof sprite in web_accessible_resources

---

## Phase 2: Create Poof Overlay Element
- **Create poofElement**: Similar to buddy element, but for the cloud animation
- **Positioning**: Positioned absolutely over the buddy's current location
- **Styling**: Same shadow DOM approach as buddy
- **Visibility**: Hidden by default, shown only during poof animation
- **Z-index**: Higher than buddy (z-index: 999998) so it covers the buddy
- **Size**: 32x32px (matches frame size)
- **Animation**: Uses steps(14) for frame-by-frame playback

---

## Phase 3: Implement Poof Animation Logic
- **Poof state management**: Add `buddyState.isPoofing = false` to track poof state
- **Animation keyframes**: Generate dynamic keyframes for poof sprite (similar to buddy walk)
- **Timing control**: Use setTimeout or animation events to trigger teleport at frame 6
- **Frame calculation**: Frame 6 corresponds to ~42.9% through 14-frame animation (6/14 ≈ 0.4286)
- **Teleport timing**: At 0.4286 * animationDuration seconds, move buddy to corner
- **Animation completion**: Hide poof element and reset states when animation ends

---

## Phase 4: Modify onClick for Poof Trigger
- **Condition check**: Only trigger poof if `!buddyState.inCorner` (exploring mode)
- **Poof sequence**:
  1. Set `buddyState.isPoofing = true`
  2. Show poof element at buddy's current position
  3. Start poof animation
  4. Schedule teleport to corner at frame 6 timing
  5. Set `buddyState.inCorner = true` and stop movement
  6. On animation end: hide poof, reset states
- **Skip wave animation**: When poofing, don't play the wave/surprised animation
- **Position sync**: Ensure poof element follows buddy position during build-up phase

---

## Phase 5: Handle Poof Positioning and Movement
- **Initial position**: Poof starts at buddy's current (x,y) position
- **During build-up**: If buddy moves slightly before teleport, poof should stay centered
- **Teleport sync**: When buddy teleports to corner, poof continues at original position
- **Z-index management**: Ensure poof covers buddy during animation
- **Cleanup**: Remove poof element from DOM when not in use, recreate as needed

---

## Phase 6: Integrate with Existing Systems
- **Shadow DOM**: Add poof element to same shadow root as buddy
- **Animation conflicts**: Ensure poof animation doesn't interfere with buddy walk animation
- **State consistency**: Update all relevant states (moving, targetX/Y, nextDecisionTime)
- **Event handling**: Prevent multiple clicks during poof animation
- **Console logging**: Add debug logs for poof start, teleport, and completion

---

## Phase 7: Testing and Refinement
- **Basic functionality**: Click buddy while exploring → poof builds → teleport at frame 6 → poof dissipates
- **Corner click**: Click buddy in corner → no poof, just resume exploring
- **Animation timing**: Verify teleport happens at correct frame (visual inspection)
- **Positioning**: Ensure poof covers buddy properly, teleport works
- **Edge cases**: Test rapid clicking, window resize during poof, sprite changes during poof
- **Performance**: Ensure smooth 60fps animation, no jank
- **Cross-browser**: Test in Chrome (primary), check Firefox/Safari compatibility

---

## Phase 8: Polish and Final Commit
- **Code cleanup**: Remove debug logs, add comments for poof logic
- **Error handling**: Add try/catch for animation failures
- **Accessibility**: Consider screen reader announcements (optional)
- **Documentation**: Update code comments with poof behavior
- **Commit message**: "Step 4: Implement poof cloud animation on exploration click with teleport timing"


## Phase 9: Change Poof_Animation to Poof_Animation_2:
Poof png information:
timothy@timothy-System-Product-Name:~/Desktop/Personal_Practice_Projects/chrome_companion/assets/sprites$ identify Poof_Animation_2.png 
Poof_Animation_2.png PNG 448x32 448x32+0+0 8-bit sRGB 1332B 0.000u 0:00.000

Animation is from left to right. Poof_Animation_2 has 14 frames in it.

Change the animation, to now implement this png as the poof instead of the previous Poof_Animation.png (which was a 4x4 grid png). This updated Poof_Animation_2.png is a single row of 14 frames.

---

## Phase 10: Update Poof Animation to Use Poof_Animation_2.png
- **Update SPRITE_CONFIG**: Modify the 'poof-cloud' entry to use the new sprite:
  - Change `url` to `chrome.runtime.getURL('assets/sprites/Poof_Animation_2.png')`
  - Update `frameCount` from 16 to 14
  - Keep `frameWidth`: 32 (448px total width / 14 frames = 32px per frame)
  - Keep `frameHeight`: 32
  - Adjust `animationDuration` if needed (consider keeping ~0.8s or calculate as 14 frames at desired fps)
- **Recalculate teleport timing**: Original teleport at frame 6 of 16 (37.5%). For 14 frames, frame 6 is ~42.9% (6/14 ≈ 0.4286). Update the teleport delay calculation in `startPoofAnimation()` to use `0.4286 * animationDuration * 1000` ms
- **Update manifest.json**: Ensure `web_accessible_resources` includes `"assets/sprites/Poof_Animation_2.png"` (remove old Poof_Animation.png if no longer needed)
- **Verify sprite loading**: Test that the new sprite loads correctly and animation plays smoothly with 14 frames
- **Adjust animation keyframes**: The keyframes generation should work the same since it's still left-to-right, but confirm totalWidth calculation: `14 * 32 = 448px`
- **Test teleport timing**: Ensure buddy teleports at the correct visual frame (around frame 6 of 14) for smooth effect
- **Update documentation**: Modify sprite details in this TODO.md and any code comments to reflect the new 14-frame single-row sprite
- **Commit changes**: "Update poof animation to use Poof_Animation_2.png with 14 frames and adjusted teleport timing"


## Phase 11:
- I am noticing that the location which the cloud appears is not correct. The poof animation cloud should align with my character. The center of the poof frame should always be at the center of my character frame.

---

## Phase 12: Fix Poof Cloud Positioning to Center on Buddy
- **Analyze positioning issue**: Current code positions poof at buddy's top-left corner, but since buddy sizes vary (64x64 for pig, 32x32 for others) and poof is always 32x32, the poof needs to be offset to center on the buddy
- **Calculate centering offset**: In `startPoofAnimation()`, get the current sprite config and compute:
  - `offsetX = (currentSpriteConfig.frameWidth - 32) / 2`
  - `offsetY = (currentSpriteConfig.frameHeight - 32) / 2`
- **Update poof positioning**: Set `poofElement.style.left = \`${buddyState.x + offsetX}px\`` and `poofElement.style.top = \`${buddyState.y + offsetY}px\``
- **Test centering**: Verify poof appears centered on buddy for all sprite types (pig 64x64 → offset 16px, smaller sprites 32x32 → offset 0px)
- **Update documentation**: Add note in code comments about centering logic
- **Commit changes**: "Fix poof cloud positioning to center on buddy character regardless of sprite size"

## Phase 13: 
- Poof animation should follow character as charicter is moving along the screen. 
- The poof seems to be correctly centered horizontally to the character, but in the vertical axis, the poof's center is at the top of the character's frame. The vertical centers should also be aligned.

---

## Phase 14: Make Poof Follow Character and Adjust Vertical Centering
- **Add position tracking**: To make the poof follow the character during the animation, add a setInterval to update the poof position every 100ms until the teleport occurs
- **Implement update function**: Create `updatePoofPosition()` that recalculates the offset based on current sprite and updates poof element position
- **Clear interval on teleport**: Stop the position updates when the buddy teleports to the corner
- **Adjust vertical centering**: Modify offsetY calculation to better align the poof center with the character center - try `offsetY = currentSpriteConfig.frameHeight / 2 - 16` (same as current) or adjust if needed
- **Test following**: Verify poof stays centered on moving character during the ~0.34s before teleport
- **Test vertical alignment**: Check that poof center aligns with character center vertically
- **Update documentation**: Add comments about position tracking logic
- **Commit changes**: "Make poof animation follow character movement and refine vertical centering" 


## Phase 15:
- When my character is in the corner not exploring, I noticed when I click another link and the webpage refreshes, the character once again starts exploring. The functionality should be such that if the character is in the 'resting state' (meaning in the corner not moving), the character remains there until the user once again clicks them to start exploring again.
- The poof animation is working, but does not seem to be covering the entire sprite. 
- The problem of the poof animation not covering the entire sprite is even more pronounced when the user grows the sprite to be larger.
- Implement feature that user can click and drag character to specific location on webpage. If the character is in exploration mode, they should continue to explore after they are dropped, if they are in resting mode, they should continue to be in resting mode. While they are being dragged, they should move with the user's mouse. When they are dropped, then they can start their exploration, or rest, in that new location.