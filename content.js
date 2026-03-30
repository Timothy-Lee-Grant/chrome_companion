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
    frameWidth: 64,
    frameHeight: 32,
    frameCount: 6.5,
    animationDuration: 0.6,
    defaultState: 'jump',
  },
};

const CURRENT_SPRITE = 'pig-idle';

const buddy = document.createElement('div');
buddy.id = 'screen-buddy';
buddy.className = 'buddy';

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
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomTarget() {
  const padding = 100; // 50px margin on each side
  const w = Math.max(window.innerWidth, 128);
  const h = Math.max(window.innerHeight, 128);
  const targetX = Math.random() * (w - padding * 2) + padding;
  const targetY = Math.random() * (h - padding * 2) + padding;
  console.log('Random target generated within bounds:', padding, w - padding, h - padding);
  return { targetX, targetY };
}

function chooseNextTarget() {
  const { targetX, targetY } = randomTarget();
  buddyState.targetX = targetX;
  buddyState.targetY = targetY;
  buddyState.moving = true;
  buddyState.nextDecisionTime = performance.now() + 2500 + Math.random() * 2200;
  buddyState.animationState = 'idle';
  buddy.classList.remove('buddy-wave', 'buddy-surprised');
  console.log('Buddy chooses new target', targetX, targetY);
}

function lerp(a, b, t) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(t)) {
    return a;
  }
  return a + (b - a) * t;
}

function updateBuddyPosition(dtSeconds) {
  if (!buddyState.moving || buddyState.targetX === null || buddyState.targetY === null) {
    return;
  }

  if (!Number.isFinite(dtSeconds) || dtSeconds <= 0) {
    return;
  }

  const dx = buddyState.targetX - buddyState.x;
  const dy = buddyState.targetY - buddyState.y;
  const dist = Math.hypot(dx, dy);

  if (!Number.isFinite(dist) || dist === 0) {
    buddyState.moving = false;
    buddyState.x = clamp(buddyState.x, 0, window.innerWidth - 64);
    buddyState.y = clamp(buddyState.y, 0, window.innerHeight - 64);
    return;
  }

  const maxDist = buddyState.speedPxPerSec * dtSeconds;

  if (dist <= maxDist) {
    buddyState.x = buddyState.targetX;
    buddyState.y = buddyState.targetY;
    buddyState.moving = false;
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
  }

  buddyState.x = clamp(buddyState.x, 0, window.innerWidth - 64);
  buddyState.y = clamp(buddyState.y, 0, window.innerHeight - 64);
}

function updateBuddyStyle() {
  const x = Number(buddyState.x.toFixed(2));
  const y = Number(buddyState.y.toFixed(2));
  buddy.style.transform = `translate(${x}px, ${y}px)`;
}

function tick(now) {
  if (!buddyState.isVisible || buddyState.isHidden) {
    buddyState.lastStepTime = now;
    requestAnimationFrame(tick);
    return;
  }

  const dtSeconds = (now - buddyState.lastStepTime) / 1000;
  buddyState.lastStepTime = now;

  if (now >= buddyState.nextDecisionTime && !buddyState.moving) {
    chooseNextTarget();
  }

  updateBuddyPosition(dtSeconds);
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

function initializeBuddy() {
  console.log('Buddy init, viewport', window.innerWidth, window.innerHeight);

  // Get the current sprite config
  const spriteConfig = SPRITE_CONFIG[CURRENT_SPRITE];
  if (!spriteConfig) {
    console.error('Sprite config not found for', CURRENT_SPRITE);
    return;
  }

  // Aggressive visibility reset: clear all inherited styles
  buddy.style.cssText = `
    all: initial !important;
    position: fixed !important;
    width: 64px !important;
    height: 64px !important;
    transform-origin: top left !important;
    z-index: 999999 !important;
    display: block !important;
    pointer-events: auto !important;
    background-image: url('${spriteConfig.url}') !important;
    background-repeat: no-repeat !important;
    background-position: 0 0 !important;
    background-size: contain !important;
    animation: buddy-walk ${spriteConfig.animationDuration}s steps(${spriteConfig.frameCount}) infinite !important;
  `;

  if (!document.body && !document.documentElement) {
    console.warn('document.body and documentElement not ready, waiting DOMContentLoaded');
    return;
  }

  // Top-level injection: attach to <html> to bypass body-level overflow: hidden
  if (document.documentElement) {
    document.documentElement.appendChild(buddy);
    console.log('Buddy appended to documentElement (html tag)');
  } else if (document.body) {
    document.body.appendChild(buddy);
    console.log('Buddy appended to body');
  }

  console.log('Buddy Initialized at:', buddyState.x, buddyState.y);

  buddy.addEventListener('click', onClick);
  buddy.addEventListener('contextmenu', onContextMenu);
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibilityChange);

  buddyState.nextDecisionTime = performance.now() + 800;
  requestAnimationFrame(tick);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeBuddy();
} else {
  window.addEventListener('DOMContentLoaded', initializeBuddy);
}

