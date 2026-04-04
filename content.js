// content.js - Injects the screen buddy into the page and runs movement logic

// Sprite configuration - allows easy swapping of different sprites
const SPRITE_CONFIG = {
  'pig-idle': {
    url: chrome.runtime.getURL('assets/sprites/pig-idle.png'),
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 4,
    animationDuration: 0.8, // seconds for full loop
    defaultState: 'idle',
    invertFacing: false,
  },
  'dog-bark': {
    url: chrome.runtime.getURL('assets/sprites/dog-bark.png'),
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 11,
    animationDuration: 1.2,
    defaultState: 'bark',
    invertFacing: true,
  },
  'cat-jump': {
    url: chrome.runtime.getURL('assets/sprites/cat-jump.png'),
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 13,
    animationDuration: 0.6,
    defaultState: 'jump',
    invertFacing: true,
  },
  'jumping': {
    url: chrome.runtime.getURL('assets/sprites/Jumping.png'),
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 11,
    animationDuration: 0.6,
    defaultState: 'jump',
    invertFacing: true,
  },
  'bird-fly': {
    url: chrome.runtime.getURL('assets/sprites/BirdFly.png'),
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 8,
    animationDuration: 0.5,
    defaultState: 'fly',
    invertFacing: true,
  },
  'frog-idle': {
    url: chrome.runtime.getURL('assets/sprites/FrogIdle.png'),
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 4,
    animationDuration: 0.8,
    defaultState: 'idle',
    invertFacing: false,
  },
  'poof-cloud': {
    url: chrome.runtime.getURL('assets/sprites/Poof_Animation_2.png'),
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 14,
    animationDuration: 0.8,
    defaultState: 'poof',
    invertFacing: false, // Not applicable for cloud
  },
};

// Sprite list for cycling (Alt+S)
const SPRITE_LIST = ['pig-idle', 'dog-bark', 'cat-jump', 'jumping', 'bird-fly', 'frog-idle'];
let currentSpriteIndex = 0;
let CURRENT_SPRITE = SPRITE_LIST[currentSpriteIndex];

const buddy = document.createElement('div');
buddy.id = 'screen-buddy';

// Poof cloud element for teleport animation
const poofElement = document.createElement('div');
poofElement.id = 'poof-cloud';

// Reference to shadow root's style elements (set later in initializeBuddy)
let shadowStyleSheet = null;
let shadowStaticStyleSheet = null;
let poofStyleSheet = null; // For poof keyframes

// Start position in the middle of the viewport (or fallback 100x100)
let buddyState = {
  x: Math.max(100, window.innerWidth / 2),
  y: Math.max(100, window.innerHeight / 2),
  targetX: null,
  targetY: null,
  speedPxPerSec: 80,
  moving: false,
  lastStepTime: performance.now(),
  nextDecisionTime: performance.now() + 1000,
  isVisible: true,
  isHidden: false,
  animationState: 'idle',
  facing: 1,
  scale: 1.0,
  inCorner: false,
  isPoofing: false,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomTarget(currentX, currentY, maxRadius = 200) {
  const angle = Math.random() * 2 * Math.PI;
  const dist = Math.random() * maxRadius;
  let targetX = currentX + dist * Math.cos(angle);
  let targetY = currentY + dist * Math.sin(angle);

  // Clamp to viewport bounds
  const padding = 100;
  targetX = clamp(targetX, padding, window.innerWidth - padding - 64);
  targetY = clamp(targetY, padding, window.innerHeight - padding - 64);

  console.log('Controlled target generated within radius:', maxRadius, 'from', currentX.toFixed(1), currentY.toFixed(1), 'to', targetX.toFixed(1), targetY.toFixed(1), 'dist', dist.toFixed(1));
  return { targetX, targetY };
}

function chooseNextTarget() {
  console.log('chooseNextTarget triggered at', buddyState.x.toFixed(1), buddyState.y.toFixed(1));
  const { targetX, targetY } = randomTarget(buddyState.x, buddyState.y, 200);
  buddyState.targetX = targetX;
  buddyState.targetY = targetY;
  buddyState.moving = true;
  buddyState.nextDecisionTime = performance.now() + 2500 + Math.random() * 2200;
  buddyState.animationState = 'idle';
  buddy.style.animation = getWalkAnimation();
  const dx = targetX - buddyState.x;
  const dy = targetY - buddyState.y;
  const dist = Math.hypot(dx, dy);
  console.log('Buddy chooses controlled target', targetX.toFixed(1), targetY.toFixed(1), 'dist', dist.toFixed(1));
}

function lerp(a, b, t) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(t)) {
    return a;
  }
  return a + (b - a) * t;
}

function updateBuddyPosition(dtSeconds, now) {
  if (!buddyState.moving || buddyState.targetX === null || buddyState.targetY === null) {
    return;
  }

  if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) {
    return;
  }

  const dx = buddyState.targetX - buddyState.x;
  const dy = buddyState.targetY - buddyState.y;
  const dist = Math.hypot(dx, dy);

  // Flip logic for facing direction
  const spriteConfig = SPRITE_CONFIG[CURRENT_SPRITE];
  const invertFacing = spriteConfig ? spriteConfig.invertFacing : false;
  if (dx < 0) {
    buddyState.facing = invertFacing ? -1 : 1;  // moving left
  } else if (dx > 0) {
    buddyState.facing = invertFacing ? 1 : -1; // moving right
  }

  if (!Number.isFinite(dist) || dist === 0) {
    buddyState.moving = false;
    buddyState.nextDecisionTime = now + 3000;
    buddyState.x = clamp(buddyState.x, 0, window.innerWidth - 64);
    buddyState.y = clamp(buddyState.y, 0, window.innerHeight - 64);
    return;
  }

  const maxDist = buddyState.speedPxPerSec * dtSeconds;

  if (dist <= maxDist) {
    buddyState.x = buddyState.targetX;
    buddyState.y = buddyState.targetY;
    buddyState.moving = false;
    buddyState.nextDecisionTime = now + 3000;
  } else {
    const progress = maxDist / dist;
    buddyState.x = lerp(buddyState.x, buddyState.targetX, progress);
    buddyState.y = lerp(buddyState.y, buddyState.targetY, progress);
  }

  // safety guard for NaN or Infinity
  if (!Number.isFinite(buddyState.x) || !Number.isFinite(buddyState.y)) {
    console.warn('Buddy position invalid, resetting to center', buddyState.x, buddyState.y);
    buddyState.x = Math.max(100, window.innerWidth / 2);
    buddyState.y = Math.max(100, window.innerHeight / 2);
    buddyState.moving = false;
    buddyState.nextDecisionTime = now + 3000;
  }

  buddyState.x = clamp(buddyState.x, 0, window.innerWidth - 64);
  buddyState.y = clamp(buddyState.y, 0, window.innerHeight - 64);
}

function updateBuddyStyle() {
  const x = Number(buddyState.x.toFixed(2));
  const y = Number(buddyState.y.toFixed(2));
  // Set transform-origin based on facing direction to prevent teleportation on flip
  // When facing right (1), origin is left. When facing left (-1), origin is right.
  //const originX = buddyState.facing === 1 ? 'left' : 'right';
  //buddy.style.transformOrigin = `${originX} center`;
  //buddy.style.transform = `translate(${x}px, ${y}px) scaleX(${buddyState.facing}) scale(${buddyState.scale})`;

  // Lock origin to center so it flips in place like a pancake
  buddy.style.transformOrigin = 'center center'; 
  
  // Apply the position, the flip (scaleX), and the size scale
  buddy.style.transform = `translate(${x}px, ${y}px) scaleX(${buddyState.facing}) scale(${buddyState.scale})`;
}

function startPoofAnimation() {
  if (buddyState.isPoofing) return; // Prevent multiple poofs
  
  buddyState.isPoofing = true;
  console.log('Starting poof animation');
  
  const poofConfig = SPRITE_CONFIG['poof-cloud'];
  const totalWidth = poofConfig.frameCount * poofConfig.frameWidth;
  const animationName = 'poof-cloud-animation';
  const keyframes = `
    @keyframes ${animationName} {
      from {
        background-position: 0 0;
      }
      to {
        background-position: -${totalWidth}px 0;
      }
    }
  `;
  
  // Update poof stylesheet
  if (poofStyleSheet) {
    poofStyleSheet.textContent = keyframes;
  }
  
  // Position poof over buddy
  poofElement.style.left = `${buddyState.x}px`;
  poofElement.style.top = `${buddyState.y}px`;
  poofElement.style.backgroundImage = `url('${poofConfig.url}')`;
  poofElement.style.backgroundSize = `${totalWidth}px ${poofConfig.frameHeight}px`;
  poofElement.style.animation = `${animationName} ${poofConfig.animationDuration}s steps(${poofConfig.frameCount})`;
  poofElement.style.display = 'block';
  
  // Schedule teleport at frame 6 (~42.9% through 14-frame animation)
  const teleportDelay = 0.4286 * poofConfig.animationDuration * 1000; // ms
  setTimeout(() => {
    console.log('Teleporting buddy to corner at frame 6');
    buddyState.x = 0;
    buddyState.y = 0;
    buddyState.moving = false;
    buddyState.targetX = null;
    buddyState.targetY = null;
    buddyState.inCorner = true;
    buddyState.nextDecisionTime = performance.now() + 999999; // Prevent auto movement
    updateBuddyStyle();
  }, teleportDelay);
  
  // Hide poof when animation completes
  setTimeout(() => {
    console.log('Poof animation completed');
    poofElement.style.display = 'none';
    poofElement.style.animation = '';
    buddyState.isPoofing = false;
  }, poofConfig.animationDuration * 1000);
}

function getWalkAnimation() {
  const spriteConfig = SPRITE_CONFIG[CURRENT_SPRITE];
  if (!spriteConfig) {
    return '';
  }
  const animationName = `buddy-walk-${CURRENT_SPRITE}`;
  return `${animationName} ${spriteConfig.animationDuration}s steps(${spriteConfig.frameCount}) infinite`;
}

function tick(now) {
  if (!buddyState.isVisible || buddyState.isHidden) {
    buddyState.lastStepTime = now;
    requestAnimationFrame(tick);
    return;
  }

  const dtSeconds = (now - buddyState.lastStepTime) / 1000;
  buddyState.lastStepTime = now;
  if (dtSeconds <= 0) {
    // ensure we get a fresh delta in the next frame
    requestAnimationFrame(tick);
    return;
  }

  if (now >= buddyState.nextDecisionTime && !buddyState.moving && !buddyState.inCorner) {
    chooseNextTarget();
  }

  updateBuddyPosition(dtSeconds, now);
  updateBuddyStyle();

  requestAnimationFrame(tick);
}

function onVisibilityChange() {
  buddyState.isVisible = document.visibilityState === 'visible';
  buddyState.lastStepTime = performance.now();
  console.log('Visibility changed', document.visibilityState, 'buddy visible:', buddyState.isVisible);
}

function onResize() {
  buddyState.x = clamp(buddyState.x, 0, window.innerWidth - 64);
  buddyState.y = clamp(buddyState.y, 0, window.innerHeight - 64);
  if (buddyState.targetX !== null) {
    buddyState.targetX = clamp(buddyState.targetX, 0, window.innerWidth - 64);
    buddyState.targetY = clamp(buddyState.targetY, 0, window.innerHeight - 64);
  }
  updateBuddyStyle();
}

function onClick(e) {
  e.stopPropagation();
  console.log('Buddy clicked at', buddyState.x, buddyState.y);
  
  if (!buddyState.inCorner) {
    // Start poof animation and teleport to corner
    startPoofAnimation();
    return; // Skip wave animation during poof
  } else {
    // Resume exploring from corner
    buddyState.inCorner = false;
    buddyState.nextDecisionTime = performance.now(); // Allow immediate movement
    console.log('Buddy resumed exploring');
  }
  
  // Play wave animation (only when not poofing)
  const animations = ['buddy-wave', 'buddy-surprised'];
  const chosen = animations[Math.floor(Math.random() * animations.length)];
  
  // Apply the click animation while preserving the walking sprite animation.
  buddy.style.animation = `${getWalkAnimation()}, ${chosen} 0.6s ease-in-out`;
  
  buddyState.animationState = chosen;
  
  setTimeout(() => {
    buddy.style.animation = getWalkAnimation();
    buddyState.animationState = 'idle';
  }, 600);
}

function onContextMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log('Right-click menu triggered');
  
  // Hide the buddy with fade animation while preserving the walking sprite animation.
  buddy.style.animation = `buddy-fade-out 0.3s ease-in forwards, ${getWalkAnimation()}`;
  buddy.style.pointerEvents = 'none';
  buddyState.isHidden = true;
  
  // Show it again after 5 seconds
  setTimeout(() => {
    buddy.style.animation = getWalkAnimation();
    buddy.style.pointerEvents = 'auto';
    buddyState.isHidden = false;
    console.log('Buddy reappeared');
  }, 5000);
}

function cycleSpriteForward() {
  // Cycle to next sprite (Alt+S)
  currentSpriteIndex = (currentSpriteIndex + 1) % SPRITE_LIST.length;
  CURRENT_SPRITE = SPRITE_LIST[currentSpriteIndex];
  updateBuddySprite();
  console.log('Sprite cycled to:', CURRENT_SPRITE);
}

function updateBuddySprite() {
  // Update sprite configuration dynamically
  const spriteConfig = SPRITE_CONFIG[CURRENT_SPRITE];
  if (!spriteConfig) {
    console.error('Sprite config not found for', CURRENT_SPRITE);
    return;
  }

  // Generate dynamic keyframes for this sprite based on frame count
  const totalWidth = spriteConfig.frameCount * spriteConfig.frameWidth;
  const animationName = `buddy-walk-${CURRENT_SPRITE}`;
  const keyframes = `
    @keyframes ${animationName} {
      from {
        background-position: 0 0;
      }
      to {
        background-position: -${totalWidth}px 0;
      }
    }
  `;
  
  // Update the shadow DOM's stylesheet
  if (shadowStyleSheet) {
    shadowStyleSheet.textContent = keyframes;
  }

  // Use .setProperty() for targeted updates to avoid overwriting other inline styles
  buddy.style.setProperty('background-image', `url('${spriteConfig.url}')`, 'important');
  buddy.style.setProperty('background-size', `${totalWidth}px ${spriteConfig.frameHeight}px`, 'important');
  buddy.style.setProperty('background-position', '0 0');
  buddy.style.setProperty('animation', getWalkAnimation(), 'important');
  buddy.style.setProperty('width', `${spriteConfig.frameWidth}px`, 'important');
  buddy.style.setProperty('height', `${spriteConfig.frameHeight}px`, 'important');
  
  console.log('Sprite animation updated for:', CURRENT_SPRITE, 'Frame:', spriteConfig.frameWidth + 'x' + spriteConfig.frameHeight, 'Count:', spriteConfig.frameCount, 'Total width:', totalWidth);
}

function onKeyDown(e) {
  const key = e.key.toLowerCase();

  // Alt+S: Cycle sprite
  if (e.altKey && key === 's') {
    e.preventDefault();
    cycleSpriteForward();
  }
  
  // Alt+[: Shrink sprite
  if (e.altKey && key === '[') {
    e.preventDefault();
    buddyState.scale = Math.max(0.5, buddyState.scale - 0.2);
    console.log('Sprite scaled down to:', buddyState.scale.toFixed(1));
  }
  
  // Alt+]: Grow sprite
  if (e.altKey && key === ']') {
    e.preventDefault();
    buddyState.scale = Math.min(2.0, buddyState.scale + 0.2);
    console.log('Sprite scaled up to:', buddyState.scale.toFixed(1));
  }
}

function initializeBuddy() {
  console.log('Buddy init, viewport', window.innerWidth, window.innerHeight);

  // Get the current sprite config
  const spriteConfig = SPRITE_CONFIG[CURRENT_SPRITE];
  if (!spriteConfig) {
    console.error('Sprite config not found for', CURRENT_SPRITE);
    return;
  }

  // Asset path check: ensure we are using the expected pig sprite path
  if (!spriteConfig.url.endsWith('/assets/sprites/pig-idle.png')) {
    console.warn('Sprite URL is not pig-idle path:', spriteConfig.url);
  }

  // Generate keyframes FIRST before setting styles
  const totalWidth = spriteConfig.frameCount * spriteConfig.frameWidth;
  const animationName = `buddy-walk-${CURRENT_SPRITE}`;
  const keyframes = `
    @keyframes ${animationName} {
      from {
        background-position: 0 0;
      }
      to {
        background-position: -${totalWidth}px 0;
      }
    }
  `;
  
  // Create keyframes stylesheet for poof animation
  if (!poofStyleSheet) {
    poofStyleSheet = document.createElement('style');
    poofStyleSheet.id = 'poof-animations';
  }
  
  // Set poof element styles (hidden by default)
  poofElement.style.cssText = `
    position: fixed !important;
    width: 32px !important;
    height: 32px !important;
    z-index: 999998 !important;
    display: none !important;
    pointer-events: none !important;
    background-repeat: no-repeat !important;
    image-rendering: pixelated !important;
  `;
  
  // Create static keyframes stylesheet (only once)
  if (!shadowStaticStyleSheet) {
    shadowStaticStyleSheet = document.createElement('style');
    shadowStaticStyleSheet.id = 'buddy-static-animations';
    shadowStaticStyleSheet.textContent = `
      @keyframes buddy-wave {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(5deg); }
        50% { transform: scale(1) rotate(0deg); }
        75% { transform: scale(1.1) rotate(-5deg); }
        100% { transform: scale(1) rotate(0deg); }
      }

      @keyframes buddy-surprised {
        0% { transform: scale(1); }
        25% { transform: scale(1.2); }
        50% { transform: scale(1.15); }
        75% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }

      @keyframes buddy-fade-out {
        0% { opacity: 1; }
        100% { opacity: 0.2; }
      }
    `;
  }

  // Create dynamic keyframes stylesheet for sprite animations
  if (!shadowStyleSheet) {
    shadowStyleSheet = document.createElement('style');
    shadowStyleSheet.id = 'buddy-dynamic-animations';
  }
  

  // Set ONLY the structural "Window" styles here
  buddy.style.cssText = `
    position: fixed !important;
    z-index: 999999 !important;
    display: block !important;
    pointer-events: auto !important;
    background-repeat: no-repeat !important;
    image-rendering: pixelated !important;
    /* We leave background-position and animation out of here! */
  `;

  if (!document.body && !document.documentElement) {
    console.warn('document.body and documentElement not ready, waiting DOMContentLoaded');
    return;
  }

  // Top-level injection: use a shadow root container to isolate from page CSS
  let container = document.getElementById('buddy-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'buddy-container';
    container.style.all = 'initial';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '0';
    container.style.height = '0';
    container.style.zIndex = '999999';
    document.documentElement.appendChild(container);
  }

  const shadowRoot = container.shadowRoot || container.attachShadow({ mode: 'open' });
  
  // Add the keyframes style elements to the shadow DOM BEFORE appending buddy
  if (shadowStaticStyleSheet && (!shadowStaticStyleSheet.parentNode || shadowStaticStyleSheet.parentNode !== shadowRoot)) {
    shadowRoot.appendChild(shadowStaticStyleSheet);
  }
  
  if (shadowStyleSheet && (!shadowStyleSheet.parentNode || shadowStyleSheet.parentNode !== shadowRoot)) {
    shadowRoot.appendChild(shadowStyleSheet);
  }
  
  if (poofStyleSheet && (!poofStyleSheet.parentNode || poofStyleSheet.parentNode !== shadowRoot)) {
    shadowRoot.appendChild(poofStyleSheet);
  }
  
  shadowRoot.appendChild(buddy);
  shadowRoot.appendChild(poofElement);
  console.log('Buddy and poof elements appended to #buddy-container shadow DOM');
  console.log('Keyframes registered:', animationName);
  console.log('Animation:', `${animationName} ${spriteConfig.animationDuration}s steps(${spriteConfig.frameCount}) infinite`);

  // Apply the current sprite immediately so the buddy is visible on startup.
  updateBuddySprite();

  console.log('Buddy Initialized at:', buddyState.x, buddyState.y);

  buddy.addEventListener('click', onClick);
  buddy.addEventListener('contextmenu', onContextMenu);
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('keydown', onKeyDown, true);

  buddyState.nextDecisionTime = performance.now();
  updateBuddyStyle();
  requestAnimationFrame(tick);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeBuddy();
} else {
  window.addEventListener('DOMContentLoaded', initializeBuddy);
}

