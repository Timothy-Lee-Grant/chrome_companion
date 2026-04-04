# Implementation Roadmap for Step 4: Implement Poof Animation

## Overview
Implement a "poof" cloud animation that plays when the user clicks the buddy while it's exploring. The poof cloud builds over the buddy, teleports the buddy to the corner at frame 6, then continues the animation as the cloud dissipates. This only triggers when clicking to go to corner (not when resuming from corner).

**Poof Sprite Details:**
- File: `Poof_Animation.png` (128x128px, 16 frames in 4x4 grid)
- Frame layout: 4 columns (x: 0-3), 4 rows (y: 0-3)
- Frame sequence: (0,0), (1,0), (2,0), (3,0), (0,1), (1,1), (2,1), (3,1), (0,2), (1,2), (2,2), (3,2), (0,3), (1,3), (2,3), (3,3)
- Frame size: 32x32px each (128/4 = 32)
- Total frames: 16
- Animation timing: ~0.8-1.0 seconds total (adjust based on feel)

---

## Phase 1: Add Poof Sprite Configuration
- **Add to SPRITE_CONFIG**: Create entry for 'poof-cloud' with:
  - `url`: `chrome.runtime.getURL('assets/sprites/Poof_Animation.png')`
  - `frameWidth`: 32
  - `frameHeight`: 32
  - `frameCount`: 16
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
- **Animation**: Uses steps(16) for frame-by-frame playback

---

## Phase 3: Implement Poof Animation Logic
- **Poof state management**: Add `buddyState.isPoofing = false` to track poof state
- **Animation keyframes**: Generate dynamic keyframes for poof sprite (similar to buddy walk)
- **Timing control**: Use setTimeout or animation events to trigger teleport at frame 6
- **Frame calculation**: Frame 6 corresponds to ~37.5% through 16-frame animation (6/16 = 0.375)
- **Teleport timing**: At 0.375 * animationDuration seconds, move buddy to corner
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
