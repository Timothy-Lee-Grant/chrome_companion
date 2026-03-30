// content.js - Injects the screen buddy into the page and runs movement logic

const buddy = document.createElement('div');
buddy.id = 'screen-buddy';
buddy.className = 'buddy';

// Start position in the middle of the viewport (or fallback 100x100)
let buddyState = {
  x: window.innerWidth / 2 || 100,
  y: window.innerHeight / 2 || 100,
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
  const targetX = Math.random() * (window.innerWidth - padding * 2) + padding;
  const targetY = Math.random() * (window.innerHeight - padding * 2) + padding;
  return { targetX, targetY };
}

function chooseNextTarget() {
  const { targetX, targetY } = randomTarget();
  buddyState.targetX = targetX;
  buddyState.targetY = targetY;
  buddyState.moving = true;
  buddyState.nextDecisionTime = performance.now() + 2500 + Math.random() * 2200; // 2.5-4.7s before new target
}

function isNearTarget(x, y, tx, ty, threshold = 6) {
  return Math.hypot(tx - x, ty - y) < threshold;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function updateBuddyPosition(dtSeconds) {
  if (!buddyState.moving || buddyState.targetX === null || buddyState.targetY === null) {
    return;
  }

  const dx = buddyState.targetX - buddyState.x;
  const dy = buddyState.targetY - buddyState.y;
  const dist = Math.hypot(dx, dy);

  if (dist < 1) {
    buddyState.moving = false;
    return;
  }

  const maxDist = buddyState.speedPxPerSec * dtSeconds;

  if (dist <= maxDist) {
    buddyState.x = buddyState.targetX;
    buddyState.y = buddyState.targetY;
    buddyState.moving = false;
    return;
  }

  const progress = maxDist / dist;
  buddyState.x = lerp(buddyState.x, buddyState.targetX, progress);
  buddyState.y = lerp(buddyState.y, buddyState.targetY, progress);
}

function updateBuddyStyle() {
  buddy.style.transform = `translate(${buddyState.x}px, ${buddyState.y}px)`;
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
  if (buddyState.isVisible) {
    buddyState.lastStepTime = performance.now();
  }
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
  buddy.classList.add('buddy-clicked');
  setTimeout(() => buddy.classList.remove('buddy-clicked'), 400);
}

// Apply initial style and document injection
buddy.style.position = 'fixed';
buddy.style.width = '64px';
buddy.style.height = '64px';
buddy.style.transformOrigin = 'top left';
updateBuddyStyle();
document.body.appendChild(buddy);

buddy.addEventListener('click', onClick);
window.addEventListener('resize', onResize);
document.addEventListener('visibilitychange', onVisibilityChange);

// Decide first target after a short idle period
buddyState.nextDecisionTime = performance.now() + 800;
requestAnimationFrame(tick);
