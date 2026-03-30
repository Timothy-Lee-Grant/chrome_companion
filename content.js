// content.js - Injects the screen buddy into the page and runs movement logic

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
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomTarget() {
  const padding = 64;
  const w = Math.max(window.innerWidth, 128);
  const h = Math.max(window.innerHeight, 128);
  const targetX = Math.random() * (w - padding * 2) + padding;
  const targetY = Math.random() * (h - padding * 2) + padding;
  return { targetX, targetY };
}

function chooseNextTarget() {
  const { targetX, targetY } = randomTarget();
  buddyState.targetX = targetX;
  buddyState.targetY = targetY;
  buddyState.moving = true;
  buddyState.nextDecisionTime = performance.now() + 2500 + Math.random() * 2200;
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
  console.log('Buddy updated at', x, y, 'visible?', buddyState.isVisible);
}

function tick(now) {
  if (!buddyState.isVisible) {
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

function onClick() {
  console.log('Buddy clicked at', buddyState.x, buddyState.y);
  buddy.classList.add('buddy-clicked');
  setTimeout(() => buddy.classList.remove('buddy-clicked'), 400);
}

function initializeBuddy() {
  console.log('Buddy init, viewport', window.innerWidth, window.innerHeight);

  buddy.style.position = 'fixed';
  buddy.style.width = '64px';
  buddy.style.height = '64px';
  buddy.style.transformOrigin = 'top left';
  buddy.style.zIndex = '999999';
  buddy.style.display = 'block';
  buddy.style.pointerEvents = 'auto';

  if (!document.body) {
    console.warn('document.body not ready, waiting DOMContentLoaded');
    return;
  }

  document.body.appendChild(buddy);

  console.log('Buddy Initialized at:', buddyState.x, buddyState.y);

  buddy.addEventListener('click', onClick);
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
