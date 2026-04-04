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
  },
  'dog-bark': {
    url: chrome.runtime.getURL('assets/sprites/dog-bark.png'),
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 11,
    animationDuration: 1.2,
    defaultState: 'bark',
  },
  'cat-jump': {
    url: chrome.runtime.getURL('assets/sprites/cat-jump.png'),
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 13,
    animationDuration: 0.6,
    defaultState: 'jump',
  },
  'jumping': {
    url: chrome.runtime.getURL('assets/sprites/Jumping.png'),
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 11,
    animationDuration: 0.6,
    defaultState: 'jump',
  },
  'bird-fly': {
    url: chrome.runtime.getURL('assets/sprites/BirdFly.png'),
    frameWidth: 16,
    frameHeight: 16,
    frameCount: 8,
    animationDuration: 0.5,
    defaultState: 'fly',
  },
  'frog-idle': {
    url: chrome.runtime.getURL('assets/sprites/FrogIdle.png'),
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 4,
    animationDuration: 0.8,
    defaultState: 'idle',
  },
};

// Sprite list for cycling (Alt+S)
const SPRITE_LIST = ['pig-idle', 'dog-bark', 'cat-jump', 'jumping', 'bird-fly', 'frog-idle'];
let currentSpriteIndex = 0;
let CURRENT_SPRITE = SPRITE_LIST[currentSpriteIndex];

const buddy = document.createElement('div');
buddy.id = 'screen-buddy';
buddy.className = 'buddy';

// Reference to shadow root's style element (set later in initializeBuddy)
let shadowStyleSheet = null;

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
  buddy.classList.remove('buddy-wave', 'buddy-surprised');
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

  // Flip logic for facing direction (inverted: moving left means face right)
  if (dx < 0) {
    buddyState.facing = 1;  // moving left, face right
  } else if (dx > 0) {
    buddyState.facing = -1; // moving right, face left
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

  if (now >= buddyState.nextDecisionTime && !buddyState.moving) {
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
  
  // Randomly choose wave or surprised animation
  const animations = ['buddy-wave', 'buddy-surprised'];
  const chosen = animations[Math.floor(Math.random() * animations.length)];
  
  buddy.classList.remove('buddy-wave', 'buddy-surprised');
  buddy.classList.add(chosen);
  
  buddyState.animationState = chosen;
  
  setTimeout(() => {
    buddy.classList.remove(chosen);
    buddyState.animationState = 'idle';
  }, 600);
}

function onContextMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log('Right-click menu triggered');
  
  // Hide the buddy
  buddy.classList.add('buddy-hidden');
  buddyState.isHidden = true;
  
  // Show it again after 5 seconds
  setTimeout(() => {
    buddy.classList.remove('buddy-hidden');
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
  buddy.style.setProperty('animation', `${animationName} ${spriteConfig.animationDuration}s steps(${spriteConfig.frameCount}) infinite`, 'important');
  buddy.style.setProperty('width', `${spriteConfig.frameWidth}px`, 'important');
  buddy.style.setProperty('height', `${spriteConfig.frameHeight}px`, 'important');
  
  console.log('Sprite animation updated for:', CURRENT_SPRITE, 'Frame:', spriteConfig.frameWidth + 'x' + spriteConfig.frameHeight, 'Count:', spriteConfig.frameCount, 'Total width:', totalWidth);
}

function onKeyDown(e) {
  // Alt+S: Cycle sprite
  if (e.altKey && e.key === 's') {
    e.preventDefault();
    cycleSpriteForward();
  }
  
  // Alt+[: Shrink sprite
  if (e.altKey && e.key === '[') {
    e.preventDefault();
    buddyState.scale = Math.max(0.5, buddyState.scale - 0.2);
    console.log('Sprite scaled down to:', buddyState.scale.toFixed(1));
  }
  
  // Alt+]: Grow sprite
  if (e.altKey && e.key === ']') {
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
  
  // Create keyframes stylesheet and add it to shadow DOM (not document head)
  if (!shadowStyleSheet) {
    shadowStyleSheet = document.createElement('style');
    shadowStyleSheet.id = 'buddy-animations';
  }
  shadowStyleSheet.textContent = keyframes;
  
  // Set all styles using cssText
  buddy.style.cssText = `
    position: fixed !important;
    width: ${spriteConfig.frameWidth}px !important;
    height: ${spriteConfig.frameHeight}px !important;
    z-index: 999999 !important;
    display: block !important;
    pointer-events: auto !important;
    background-image: url('${spriteConfig.url}') !important;
    background-repeat: no-repeat !important;
    background-position: 0 0 !important;
    background-size: ${totalWidth}px ${spriteConfig.frameHeight}px !important;
    animation: ${animationName} ${spriteConfig.animationDuration}s steps(${spriteConfig.frameCount}) infinite !important;
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
  
  // Add the keyframes style element to the shadow DOM BEFORE appending buddy
  if (!shadowStyleSheet.parentNode || shadowStyleSheet.parentNode !== shadowRoot) {
    shadowRoot.appendChild(shadowStyleSheet);
  }
  
  shadowRoot.appendChild(buddy);
  console.log('Buddy appended to #buddy-container shadow DOM');
  console.log('Keyframes registered:', animationName);
  console.log('Animation:', `${animationName} ${spriteConfig.animationDuration}s steps(${spriteConfig.frameCount}) infinite`);

  console.log('Buddy Initialized at:', buddyState.x, buddyState.y);

  buddy.addEventListener('click', onClick);
  buddy.addEventListener('contextmenu', onContextMenu);
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('keydown', onKeyDown);

  buddyState.nextDecisionTime = performance.now();
  updateBuddyStyle();
  requestAnimationFrame(tick);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeBuddy();
} else {
  window.addEventListener('DOMContentLoaded', initializeBuddy);
}

