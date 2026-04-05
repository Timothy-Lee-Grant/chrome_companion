# 🎮 Screen Buddy - Chrome Extension

A delightful Chrome extension that places an adorable animated character companion on your screen that roams around exploring and responds to your interactions with magical poof animations!

---

## 📋 Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [User Guide](#user-guide)
4. [Technical Architecture](#technical-architecture)
5. [Project Structure](#project-structure)
6. [Development Guide](#development-guide)
7. [Sprite System](#sprite-system)
8. [Future Enhancements](#future-enhancements)

---

## ✨ Features

### 🚶 Autonomous Character Movement
Your buddy character continuously explores the screen, moving in random directions with realistic pacing and smooth animations. The character respects screen boundaries and never leaves your viewport.

![Character Movement](Project%20Documentation/Pig_No_Change.gif)

### 🎨 Multiple Character Sprites
Switch between 6 different animated characters, each with unique animations and behaviors:
- **Pig** - Calm and idle (64×64px, 4 frames)
- **Dog** - Energetic bark animation (64×64px, 11 frames)
- **Cat** - Graceful jumping (32×32px, 13 frames)
- **Rabbit** - Quick hopping (32×32px, 11 frames)
- **Bird** - Smooth flying (16×16px, 8 frames)
- **Frog** - Serene idling (32×32px, 4 frames)

![Character Switching](Project%20Documentation/Change_Characters.gif)

### 📏 Dynamic Scaling
Resize your character from 50% to 200% of its original size with simple keyboard shortcuts, allowing you to customize your buddy's presence on your screen.

![Size Adjustment](Project%20Documentation/Dog_Change_Size.gif)

### ✨ Magical Poof Teleportation
Click on your buddy while it's exploring to trigger an enchanting poof cloud animation. The character disappears in a magical puff of smoke and teleports to the top-left corner of your screen!

![Poof Teleportation](Project%20Documentation/Pig_Teleport.gif)

![More Poof Examples](Project%20Documentation/Cat_Poof_Teleport.gif)

![Additional Poof Example](Project%20Documentation/Cat_Poof_Teleport2.gif)

### 🔄 Two-State Interaction System
- **Exploring Mode**: Character roams freely; click to trigger poof teleportation
- **Corner Mode**: Character rests in top-left corner; click to resume exploring

### 👋 Playful Animations
Click your buddy while exploring to trigger wave or surprised animations alongside movement, creating personality and charm.

### 😴 Visibility Management
Right-click your buddy to hide it for 5 seconds, giving you full screen access when needed.

---

## 🚀 Installation

### From Chrome Web Store (When Published)
1. Visit Chrome Web Store
2. Search for "Screen Buddy"
3. Click "Add to Chrome"

### Manual Installation (Development Mode)
1. **Clone or download** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable "Developer mode"** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the project folder
5. **Visit any website** and your buddy will appear!

---

## 🎮 User Guide

### Keyboard Controls

| Shortcut | Action |
|----------|--------|
| **Alt+S** | Cycle to next character sprite |
| **Alt+[** | Shrink character (minimum 50%) |
| **Alt+]** | Grow character (maximum 200%) |

### Mouse Controls

| Action | Effect |
|--------|--------|
| **Left-click** | In explore mode: Trigger poof teleportation to corner<br>In corner mode: Resume exploring |
| **Right-click** | Hide buddy for 5 seconds |

### Tips & Tricks

- **Watch your buddy explore**: Let it roam freely across any webpage
- **Customize the size**: Make it large for a prominent presence or tiny for subtle background companionship
- **Cycle through characters**: Find your favorite buddy!
- **Use poof strategically**: Teleport to corner when you need screen real estate
- **Hide when needed**: Right-click to get temporary full-screen access

---

## 🏗️ Technical Architecture

### Overview
Screen Buddy uses a sophisticated Shadow DOM isolation system to prevent page CSS interference while maintaining cross-browser compatibility. The extension employs dynamic sprite animation systems and state-based movement algorithms for autonomous behavior.

### Core Systems

#### 1. **Shadow DOM Isolation**
- All UI elements (buddy, poof cloud) are injected into a Shadow DOM tree
- Prevents page styles from affecting the extension UI
- Allows safe CSS animations without namespace conflicts
- Shadow root is attached to a hidden container (`#buddy-container`)

```javascript
const container = document.createElement('div');
container.id = 'buddy-container';
const shadowRoot = container.attachShadow({ mode: 'open' });
shadowRoot.appendChild(buddy);
shadowRoot.appendChild(poofElement);
```

#### 2. **Sprite Animation System**
Dynamic keyframe generation allows different sprites to animate with their specific frame counts and durations:

```javascript
const totalWidth = spriteConfig.frameCount * spriteConfig.frameWidth;
const keyframes = `
  @keyframes buddy-walk-${CURRENT_SPRITE} {
    from { background-position: 0 0; }
    to { background-position: -${totalWidth}px 0; }
  }
`;
```

**Key Features:**
- Horizontal sprite sheet traversal via `background-position` animation
- `steps()` function for frame-by-frame playback (no blurring)
- Automatic duration calculation based on sprite configuration
- Dynamic sprite switching with instant keyframe regeneration

#### 3. **State Management**
The `buddyState` object tracks all character state:

```javascript
let buddyState = {
  x: 100, y: 100,              // Current position
  targetX: null, targetY: null, // Movement target
  speedPxPerSec: 80,           // Movement speed
  moving: false,               // Is currently moving
  facing: 1,                   // Direction (1=right, -1=left)
  scale: 1.0,                  // Size multiplier
  inCorner: false,             // In poof corner mode
  isPoofing: false,            // Currently poofing
  animationState: 'idle',      // Current animation state
};
```

#### 4. **Movement Algorithm**
Characters move autonomously using:

1. **Random Target Generation**
   ```javascript
   const angle = Math.random() * 2 * Math.PI;
   const dist = Math.random() * maxRadius;
   targetX = currentX + dist * Math.cos(angle);
   targetY = currentY + dist * Math.sin(angle);
   ```

2. **Linear Interpolation Movement**
   ```javascript
   dtSeconds = (now - lastStepTime) / 1000;
   dx = targetX - buddyState.x;
   dy = targetY - buddyState.y;
   distance = Math.hypot(dx, dy);
   movement = buddyState.speedPxPerSec * dtSeconds;
   ```

3. **Direction Facing** - Automatically flips sprite based on movement direction

4. **Boundary Clamping** - Prevents characters from leaving the viewport

#### 5. **Poof Cloud Animation System**

The poof animation is a 14-frame horizontal sprite sheet (448×32px):

```javascript
function startPoofAnimation() {
  // Position poof centered on buddy
  const offsetX = (currentConfig.frameWidth - 32) / 2;
  const offsetY = currentConfig.frameHeight / 2;
  poofElement.style.left = `${buddyState.x + offsetX}px`;
  poofElement.style.top = `${buddyState.y + offsetY}px`;
  
  // Update poof position every 100ms to follow character
  const positionUpdateInterval = setInterval(updatePoofPosition, 100);
  
  // Teleport at frame 6 (~42.9% through animation)
  setTimeout(() => {
    clearInterval(positionUpdateInterval);
    buddyState.x = 0;
    buddyState.y = 0;
    buddyState.inCorner = true;
  }, 0.4286 * 0.8 * 1000);
}
```

**Key Features:**
- **Centered Positioning**: Calculates offsets to center poof on any buddy size
- **Following Movement**: Updates position every 100ms before teleport
- **Layering**: Z-index 1000000 places poof in front of buddy (999999)
- **Precise Teleport Timing**: Frame 6 of 14 frames (42.9%) provides optimal visual feedback

#### 6. **Animation Layering**
CSS animations stack for complex effects:

```javascript
buddy.style.animation = `${getWalkAnimation()}, wave 0.6s ease-in-out`;
```

This combines the walking animation with wave/surprised animations simultaneously.

### Content Script Lifecycle

1. **DOMContentLoaded Event** - Triggers `initializeBuddy()`
2. **Shadow DOM Setup** - Creates and attaches shadow root
3. **Style Injection** - Loads static and dynamic keyframes
4. **Element Mounting** - Appends buddy and poof elements to shadow DOM
5. **Event Listeners** - Registers click, keyboard, and visibility handlers
6. **Animation Loop** - `requestAnimationFrame` tick updates position
7. **State Persistence** - Maintains state across tab interactions

---

## 📁 Project Structure

```
chrome_companion/
├── manifest.json              # Extension configuration
├── content.js                 # Main extension logic (616 lines)
├── styles.css                 # Minimal stylesheet (now empty)
├── README.md                  # This file
├── SPRITE_GUIDE.md            # Sprite system documentation
│
├── assets/
│   └── sprites/
│       ├── pig-idle.png       # 4 frames, 256×64px
│       ├── dog-bark.png       # 11 frames, 704×64px
│       ├── cat-jump.png       # 13 frames, 416×32px
│       ├── Jumping.png        # 11 frames, 352×32px
│       ├── BirdFly.png        # 8 frames, 128×16px
│       ├── FrogIdle.png       # 4 frames, 128×32px
│       └── Poof_Animation_2.png # 14 frames, 448×32px
│
├── Project Documentation/     # GIF demonstrations
│   ├── Pig_No_Change.gif
│   ├── Change_Characters.gif
│   ├── Dog_Change_Size.gif
│   ├── Pig_Teleport.gif
│   ├── Cat_Poof_Teleport.gif
│   └── Cat_Poof_Teleport2.gif
│
└── Step X [Implementation Steps]/
    ├── PROMPT.md              # Original requirements
    └── TODO.md                # Detailed implementation roadmap
```

### File Descriptions

| File | Purpose | Size |
|------|---------|------|
| `manifest.json` | Chrome extension configuration | 300 bytes |
| `content.js` | Core extension logic: animations, movement, interactions | 616 lines |
| `styles.css` | CSS stylesheet (minimal, mostly in Shadow DOM) | ~20 bytes |
| `SPRITE_GUIDE.md` | Guide for adding custom sprites | 2KB |

---

## 👨‍💻 Development Guide

### Setting Up Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chrome-companion.git
   cd chrome_companion
   ```

2. **Load in Chrome**
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked" → select project folder

3. **Debug the Extension**
   - Open DevTools on any webpage (F12)
   - Open DevTools for extension (click "inspect" on extension card in `chrome://extensions/`)
   - Console logs appear in the extension's DevTools

### Key Code Sections

#### Main State Machine
Located at lines 92-110 in `content.js`:
```javascript
let buddyState = {
  x, y,                  // Position
  targetX, targetY,      // Movement target
  moving,               // Movement state
  facing,               // Direction
  scale,                // Size
  inCorner,             // Poof state
  isPoofing,            // Animation state
};
```

#### Sprite Configuration
Located at lines 4-68 in `content.js`:
```javascript
const SPRITE_CONFIG = {
  'sprite-name': {
    url,                    // Chrome runtime URL
    frameWidth,             // Pixel width per frame
    frameHeight,            // Pixel height per frame
    frameCount,             // Number of animation frames
    animationDuration,      // Seconds for full loop
    defaultState,           // Animation state name
    invertFacing,           // Mirror for direction
  }
};
```

#### Movement Logic
Located at lines 152-210 in `content.js`:
```javascript
function updateBuddyPosition(dtSeconds, now) {
  // Calculate direction and distance
  // Linear interpolation toward target
  // Update facing direction
  // Clamp to viewport bounds
}
```

#### Animation Frame
Located at lines 282-315 in `content.js`:
```javascript
function tick(now) {
  // Calculate time delta
  // Update position
  // Render new position
  // Schedule next frame
  requestAnimationFrame(tick);
}
```

### Common Modifications

#### Change Default Sprite
Edit line 74 in `content.js`:
```javascript
const CURRENT_SPRITE = 'dog-bark'; // Change from 'pig-idle'
```

#### Adjust Movement Speed
Edit line 104 in `content.js`:
```javascript
speedPxPerSec: 120, // Increase for faster movement
```

#### Modify Poof Teleport Location
Edit line 267 in `content.js`:
```javascript
buddyState.x = window.innerWidth - 100;  // Teleport to right side
buddyState.y = window.innerHeight - 100; // Teleport to bottom
```

#### Change Animation Loop Duration
Modify `animationDuration` in SPRITE_CONFIG (lines 4-68).

#### Adjust Poof Visibility Duration
Edit line 365 in `content.js`:
```javascript
setTimeout(() => { ... }, 3000); // Change 5000ms to 3000ms
```

---

## 🎨 Sprite System

### Sprite Format Requirements

- **Layout**: Horizontal strip (frames arranged left-to-right)
- **Size**: 32×32px or 64×64px typical (configurable)
- **Frame Spacing**: No gaps between frames
- **Format**: PNG with transparency support

### Adding a New Sprite

1. **Prepare sprite sheet**
   - Extract from `FreeAnimalPack/` or create custom
   - Ensure horizontal frame layout
   - Note: frame dimensions and count

2. **Add to `assets/sprites/`**
   ```bash
   cp your-sprite.png assets/sprites/new-character.png
   ```

3. **Register in SPRITE_CONFIG** (content.js, line 4-68)
   ```javascript
   'new-character': {
     url: chrome.runtime.getURL('assets/sprites/new-character.png'),
     frameWidth: 32,
     frameHeight: 32,
     frameCount: 12,
     animationDuration: 0.7,
     defaultState: 'walk',
     invertFacing: true,
   },
   ```

4. **Add to cycling list** (content.js, line 73)
   ```javascript
   const SPRITE_LIST = ['pig-idle', 'dog-bark', 'new-character'];
   ```

5. **Reload extension** in `chrome://extensions/`

### Available Sprites

| Name | Dimensions | Frames | Duration | Invert |
|------|-----------|--------|----------|--------|
| pig-idle | 64×64 | 4 | 0.8s | No |
| dog-bark | 64×64 | 11 | 1.2s | Yes |
| cat-jump | 32×32 | 13 | 0.6s | Yes |
| jumping | 32×32 | 11 | 0.6s | Yes |
| bird-fly | 16×16 | 8 | 0.5s | Yes |
| frog-idle | 32×32 | 4 | 0.8s | No |
| poof-cloud | 32×32 | 14 | 0.8s | N/A |

---

## 🚀 Future Enhancements

### Planned Features

- [ ] **Sound Effects** - Add audio feedback for interactions (clicks, teleport, etc.)
- [ ] **Persistent Settings** - Save user preferences (character choice, scale) across sessions
- [ ] **Context Menu** - Right-click menu for quick settings and sprite selection
- [ ] **Custom Themes** - Dark mode, light mode, custom color schemes
- [ ] **Idle Behaviors** - Special animations when buddy is inactive (sleeping, stretching)
- [ ] **Social Features** - Share buddy screenshots or animated GIFs
- [ ] **Settings Panel** - Popup UI for customization without keyboard shortcuts
- [ ] **Achievement System** - Unlock special items or behaviors through interactions
- [ ] **Party Mode** - Multiple buddies on screen at once
- [ ] **Smart Avoidance** - Detect and avoid interactive page elements

### Performance Improvements

- [ ] **GPU Acceleration** - Use CSS transforms for smoother animations
- [ ] **Lazy Loading** - Defer sprite loading until first use
- [ ] **Memory Optimization** - Efficient sprite sheet caching
- [ ] **Battery Optimization** - Reduced frame rate in low-power mode

### Developer Experience

- [ ] **Sprite Preview Tool** - Web-based tool to test sprite sheets
- [ ] **Animation Editor** - Visual editor for keyframe timing
- [ ] **Hot Reload** - Faster development iteration
- [ ] **TypeScript** - Type safety for core logic
- [ ] **Unit Tests** - Coverage for animation and movement systems

---

## 📄 License

This project uses sprite assets from the [Free Animal Pack](https://itch.io/) - check individual asset licenses.

Code is provided as-is for educational and personal use.

---

## 🙏 Credits

- **Sprite Assets**: Free Animal Pack from itch.io
- **Animation System**: CSS keyframes with dynamic generation
- **Chrome API**: Extension development using Manifest V3

---

## 📞 Support

### Troubleshooting

**Buddy doesn't appear**
- Verify extension is loaded in `chrome://extensions/`
- Check extension permissions for the current site
- Open DevTools (F12) and check for console errors

**Animation is stuttering**
- Check CPU usage - close background applications
- Verify GPU acceleration is enabled in Chrome settings
- Try different sprite or reduce screen resolution

**Keyboard controls don't work**
- Ensure focus is on the webpage (not address bar)
- Try alternative keyboard layout support (may vary by OS)

**Poof animation isn't visible**
- Check z-index settings (should be 1000000)
- Verify Shadow DOM is properly attached
- Try on a simpler webpage without complex z-index stacking

### Debug Mode

To enable verbose logging, add this to the top of `content.js`:
```javascript
const DEBUG = true; // Set to true for detailed console logs
```

Then restart the extension and check console output.

---

## 🎯 Version History

### v1.0 (Current)
- ✅ 6 character sprites with unique animations
- ✅ Autonomous movement with boundary detection
- ✅ Keyboard controls for sprite cycling and scaling
- ✅ Poof cloud teleportation animation
- ✅ Shadow DOM isolation for CSS safety
- ✅ Two-state interaction system
- ✅ Hide/show functionality

---

**Happy companion building! 🎉**
