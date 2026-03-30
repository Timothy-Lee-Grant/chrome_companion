# Project: Screen Buddy Chrome Extension

## Vision
I want to create a "Screen Buddy" Chrome extension (Manifest V3). 
The goal is to have a small, animated 2D character that lives on the user's 
browser screen, moves around autonomously, and reacts to user interactions.

## Technical Constraints
- **Manifest Version**: 3
- **Language**: Vanilla JavaScript (No frameworks like React/Vue for now).
- **Architecture**: 
    - Use a `content script` to inject the character into web pages.
    - Use `web_accessible_resources` to load sprite assets.
    - Use `requestAnimationFrame` for all movement logic to ensure high performance.
- **Performance**: The character must stop all logic/animations when the tab 
  is not active (use the Page Visibility API).
- **Styling**: All styles should be encapsulated in a `styles.css` file 
  to avoid clashing with the host website's CSS.

## Character Behavior (The "Vibe")
- **Idle**: The character stands still or has a subtle breathing animation.
- **Movement**: The character occasionally decides to "walk" to a random 
  coordinate within the `window.innerWidth` and `window.innerHeight`.
- **Interaction**: If the user clicks the character, it should play a 
  "wave" or "surprised" animation.
- **Physics**: Movement should feel "lazy" and smooth (use Linear Interpolation/Lerp).

## Asset Details
- We will start with a placeholder sprite sheet.
- I have provided you a pack of sprites inside of the `FreeAnimalPack.zip`
- That zip file should have multiple different sprites. Start by implementing the panda sprite, but also allow for functionality of eventually easily swapping models to be able to unitilze multiple sprites or change them out. 
- Each frame is 64x64 pixels.