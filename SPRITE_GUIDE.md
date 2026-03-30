# Sprite System Guide

## Current Structure

```
assets/
└── sprites/
    ├── pig-idle.png     (4 frames, 256x64px)
    ├── dog-bark.png     (11 frames, 704x64px)
    └── cat-jump.png     (6.5 frames, 416x32px)
```

## Adding a New Sprite

1. **Extract from FreeAnimalPack.zip** or provide your own sprite sheet
2. **Copy to `assets/sprites/`** with a descriptive name (e.g., `frog-hop.png`)
3. **Add to `SPRITE_CONFIG` in `content.js`:**

```javascript
'frog-hop': {
  url: chrome.runtime.getURL('assets/sprites/frog-hop.png'),
  frameWidth: 64,
  frameHeight: 64,
  frameCount: 8,              // Number of animation frames
  animationDuration: 1.0,     // Seconds for full loop
  defaultState: 'hop',
}
```

4. **Update manifest.json** (if not using wildcard):
```json
"resources": ["assets/sprites/frog-hop.png"]
```

5. **Switch to new sprite in content.js:**
```javascript
const CURRENT_SPRITE = 'frog-hop';
```

## Sprite Sheet Format

- **Horizontal strip layout** (frames arranged left-to-right)
- **Frame size**: 64x64 pixels (or configure in `SPRITE_CONFIG`)
- **Total width**: `frameWidth × frameCount`
- **Example**: 4-frame sprite = 256 pixels wide

## Animation Timing

The `animationDuration` controls the speed of sprite frame playback:
- **0.5s** = Fast, energetic movement
- **0.8s** = Normal idle walk
- **1.2s** = Slow, deliberate movement

## Interactions

- **Left-click**: Triggers wave or surprised animation
- **Right-click**: Hide for 5 seconds
- **Movement**: Smooth lerp between waypoints
