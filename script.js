/**
 * JPC FTU — CLB Tiếng Nhật Trường Đại học Ngoại Thương
 * Main Javascript Controller
 * - Mobile Navigation Toggle
 * - Internal SPA View Navigation
 * - Ambient Visual Effects (Gold Needles, Cursor Streak)
 * - 4-Phase Hero Intro Timeline Animation with Typewriter Effect
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initViewNavigation();
  initGoldNeedles();
  initFallingCards();
  initCursorGlow();
  initHeroIntroTimeline();
  initMusicPlayerUI();
});

/* ==========================================================
   1. MOBILE NAVIGATION TOGGLE & ACCORDION CONTROLLER
   ========================================================== */
function initNavToggle() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const aboutDropdown = document.getElementById('navAboutDropdown');
  const aboutParent = document.getElementById('navAboutParent');
  const branchOrg = document.getElementById('navBranchOrg');
  const branchTrigger = branchOrg ? branchOrg.querySelector('.nav__branch-trigger') : null;

  if (!navToggle || !navMenu) return;

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    document.body.classList.toggle('menu-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    if (!isOpen) {
      if (aboutDropdown) aboutDropdown.classList.remove('is-open');
      if (branchOrg) branchOrg.classList.remove('is-open');
    }
  });

  // Mobile & Touch accordion behavior for Về JPC dropdown
  if (aboutParent && aboutDropdown) {
    aboutParent.addEventListener('click', (e) => {
      // Toggle dropdown open state
      e.preventDefault();
      e.stopPropagation();
      const isOpen = aboutDropdown.classList.toggle('is-open');
      aboutParent.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Mobile & Touch accordion behavior for Cơ cấu tổ chức sub-dropdown
  if (branchTrigger && branchOrg) {
    branchTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = branchOrg.classList.toggle('is-open');
      branchTrigger.setAttribute('aria-expanded', String(isOpen));
    });

    branchTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = branchOrg.classList.toggle('is-open');
        branchTrigger.setAttribute('aria-expanded', String(isOpen));
      }
    });
  }

  // Desktop & Mobile: Di chuột ra ngoài là tự động thu gọn lại
  if (aboutDropdown) {
    aboutDropdown.addEventListener('mouseleave', () => {
      aboutDropdown.classList.remove('is-open');
      if (branchOrg) branchOrg.classList.remove('is-open');
      if (aboutParent) aboutParent.setAttribute('aria-expanded', 'false');
      if (branchTrigger) branchTrigger.setAttribute('aria-expanded', 'false');
      if (document.activeElement && aboutDropdown.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    });
  }

  if (branchOrg) {
    branchOrg.addEventListener('mouseleave', () => {
      branchOrg.classList.remove('is-open');
      if (branchTrigger) branchTrigger.setAttribute('aria-expanded', 'false');
      if (document.activeElement && branchOrg.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    });
  }

  // Close dropdown on click outside or ESC key
  document.addEventListener('click', (e) => {
    if (aboutDropdown && !aboutDropdown.contains(e.target) && !navToggle.contains(e.target)) {
      aboutDropdown.classList.remove('is-open');
      if (branchOrg) branchOrg.classList.remove('is-open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (aboutDropdown) aboutDropdown.classList.remove('is-open');
      if (branchOrg) branchOrg.classList.remove('is-open');
      if (navMenu) {
        navMenu.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

/* ==========================================================
   2. INTERNAL VIEW NAVIGATION (SPA ROUTER)
   ========================================================== */
function initViewNavigation() {
  const views = [...document.querySelectorAll('.view')];
  const internalLinks = [...document.querySelectorAll('a[href^="#"]')];
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  const showView = (viewId, updateHistory = false) => {
    const contact = document.getElementById('contact');
    const isContact = viewId === 'contact';
    const requestedEl = document.getElementById(viewId);

    // Resolve active view (either the element itself or its parent .view)
    let activeView = null;
    if (requestedEl) {
      activeView = requestedEl.classList.contains('view') ? requestedEl : requestedEl.closest('.view');
    }
    if (!activeView) {
      activeView = document.getElementById('home');
    }

    views.forEach((view) => {
      const isActive = view === activeView;
      view.classList.toggle('is-active', isActive);
      view.classList.remove('is-entering');
      view.hidden = !isActive;
      view.setAttribute('aria-hidden', String(!isActive));
    });

    // Avoid animating translateY on hero during initial load so card intro trajectory remains rock-solid
    if (activeView && (activeView.id !== 'home' || updateHistory)) {
      requestAnimationFrame(() => {
        activeView.classList.add('is-entering');
      });
    }

    if (updateHistory && activeView) {
      history.pushState(null, '', `#${viewId}`);
    }

    if (requestedEl && requestedEl !== activeView) {
      setTimeout(() => {
        requestedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else if (isContact && contact) {
      contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  internalLinks.forEach((link) => {
    // Dropdown parent toggles (Về JPC) only toggle options on click, not page navigation!
    if (link.classList.contains('nav__link--parent') || link.id === 'navAboutParent') {
      return;
    }

    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;

      event.preventDefault();
      showView(targetId, true);

      // Blur active link to prevent :focus-within from keeping dropdown open after selection
      if (document.activeElement) {
        document.activeElement.blur();
      }
      link.blur();

      if (navMenu && navToggle) {
        navMenu.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }

      const aboutDropdown = document.getElementById('navAboutDropdown');
      const branchOrg = document.getElementById('navBranchOrg');
      if (aboutDropdown) aboutDropdown.classList.remove('is-open');
      if (branchOrg) branchOrg.classList.remove('is-open');
    });
  });

  window.addEventListener('hashchange', () => {
    const targetId = window.location.hash.slice(1);
    if (targetId) showView(targetId);
  });

  // Initial view on load
  const initialHash = window.location.hash.slice(1);
  showView(initialHash || 'home');
}

/* ==========================================================
   3. BACKGROUND AMBIENT FX: GOLD NEEDLES (PRE-ALLOCATED POOL)
   ========================================================== */
function initGoldNeedles() {
  const needleField = document.getElementById('goldNeedles');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!needleField || prefersReducedMotion) return;

  const isMobile = window.innerWidth <= 768;
  const count = isMobile ? 8 : 12;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const needle = document.createElement('span');
    needle.className = 'gold-needle';
    needle.style.pointerEvents = 'none';
    const duration = 10 + (i % 5) * 1.5;
    const delay = -(i * 1.1 + (i % 3) * 0.7);
    needle.style.setProperty('--needle-length', `${45 + (i * 7) % 65}px`);
    needle.style.setProperty('--needle-opacity', (0.16 + (i % 4) * 0.04).toFixed(2));
    needle.style.setProperty('--needle-angle', `${-6 + (i * 3) % 13}deg`);
    needle.style.setProperty('--needle-duration', `${duration.toFixed(1)}s`);
    needle.style.setProperty('--needle-delay', `${delay.toFixed(1)}s`);
    needle.style.left = `${Math.round((i / count) * 100)}%`;
    fragment.appendChild(needle);
  }
  needleField.appendChild(fragment);
}

/* ==========================================================
   4. MINI FALLING CARDS (LIGHTWEIGHT RESPONSIVE POOL - 2 SIDES)
   ========================================================== */
function initFallingCards() {
  const container = document.getElementById('fallingCards');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!container || prefersReducedMotion) return;

  const isMobile = window.innerWidth <= 768;
  // Lightweight count on mobile (8 cards) vs desktop (16 cards) to eliminate frame drops
  const count = isMobile ? 8 : 16;
  const halfCount = count / 2;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'mini-card';
    card.style.pointerEvents = 'none';
    const isLeft = i < halfCount;
    const sideIndex = isLeft ? i : i - halfCount;

    const spreadFactor = ((sideIndex * 7 + (isLeft ? 2 : 5)) % halfCount) / Math.max(1, halfCount - 1);
    const leftPercent = isLeft
      ? (isMobile ? 0.5 + spreadFactor * 9.5 : 0.8 + spreadFactor * 14.7)
      : (isMobile ? 89.5 + spreadFactor * 9.5 : 84.5 + spreadFactor * 14.7);

    const duration = 7.5 + ((sideIndex * 3 + (isLeft ? 0 : 2)) % 7) * 1.15;
    const delay = -(((sideIndex + (isLeft ? 0 : 0.45)) / halfCount) * duration + (i % 4) * 0.7);

    const sizeTier = i % 3;
    const width = isMobile
      ? (sizeTier === 0 ? 11 : sizeTier === 1 ? 14 : 17)
      : (sizeTier === 0 ? 14 + (i % 3) : sizeTier === 1 ? 18 + (i % 4) : 23 + (i % 4));
    const height = Math.round(width * 1.4);

    const opacity = sizeTier === 0 ? 0.30 : sizeTier === 1 ? 0.45 : 0.60;

    const rzStart = -45 + ((i * 37) % 90);
    const rzEnd = rzStart + (i % 2 === 0 ? 1 : -1) * (180 + ((i * 29) % 150));
    const rx = 180 + ((i * 41) % 240);
    const ry = 160 + ((i * 31) % 220);
    const drift = (i % 2 === 0 ? 1 : -1) * (isMobile ? 6 + (i % 4) * 2 : 10 + (i % 5) * 4);

    card.style.left = `${leftPercent.toFixed(1)}%`;
    card.style.setProperty('--mc-w', `${width}px`);
    card.style.setProperty('--mc-h', `${height}px`);
    card.style.setProperty('--mc-dur', `${duration.toFixed(1)}s`);
    card.style.setProperty('--mc-delay', `${delay.toFixed(2)}s`);
    card.style.setProperty('--mc-opacity', opacity.toFixed(2));
    card.style.setProperty('--mc-rz-start', `${rzStart}deg`);
    card.style.setProperty('--mc-rz-end', `${rzEnd}deg`);
    card.style.setProperty('--mc-rx', `${rx}deg`);
    card.style.setProperty('--mc-ry', `${ry}deg`);
    card.style.setProperty('--mc-drift', `${drift}px`);

    if (i % 4 === 0) {
      card.classList.add('mini-card--gold');
    } else if (i % 3 === 0) {
      card.classList.add('mini-card--deep');
    }

    fragment.appendChild(card);
  }

  container.appendChild(fragment);
}

/* ==========================================================
   4.5. CURSOR LIGHT STREAK FX (SMART IDLE LERPED SPOTLIGHT)
   ========================================================== */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Disable on touch devices or if user prefers reduced motion
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (!glow || prefersReducedMotion || isTouch) return;

  let currentX = -9999;
  let currentY = -9999;
  let targetX = -9999;
  let targetY = -9999;
  let isVisible = false;
  let isRunning = false;

  const render = () => {
    if (!isVisible) {
      isRunning = false;
      return;
    }

    const dx = targetX - currentX;
    const dy = targetY - currentY;

    // Smart idle detection: when cursor is still, pause RAF to free GPU/CPU!
    if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) {
      currentX = targetX;
      currentY = targetY;
      glow.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0)`;
      isRunning = false;
      return;
    }

    currentX += dx * 0.16;
    currentY += dy * 0.16;
    glow.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0)`;

    requestAnimationFrame(render);
  };

  const startLoop = () => {
    if (!isRunning) {
      isRunning = true;
      requestAnimationFrame(render);
    }
  };

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      currentX = targetX;
      currentY = targetY;
      glow.classList.add('is-active');
    }
    startLoop();
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    isVisible = false;
    glow.classList.remove('is-active');
  });

  document.addEventListener('mouseenter', () => {
    if (targetX > 0 && targetY > 0) {
      isVisible = true;
      glow.classList.add('is-active');
      startLoop();
    }
  });
}

/* ==========================================================
   5. HERO INTRO 4-PHASE TIMELINE ANIMATION & TYPEWRITER
   ==========================================================
   Timeline:
   Phase 1 (0s - 2.15s): 12 cards sweep from left along an arc
           trajectory, settling symmetrically in screen center.
   Phase 2 (2.15s - 3.70s): 4 picked cards separate along a 3D arc
           to Home positions; 8 remaining cards smoothly sink & fade out.
   Phase 3 (2.15s - 3.70s): Mid-flight 3D flip (cards 2 & 3) and
           Kanji illumination (cards 1 & 4) as cards glide to 100% scale.
   Phase 4 (3.70s+): 4 cards smoothly settle into idle bobbing.
           Welcome title types character-by-character, CTA enters.
   ========================================================== */
function initHeroIntroTimeline() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.getElementById('home');
  const titleTextEl = document.getElementById('heroTitleText');
  const titleCursorEl = document.getElementById('heroTitleCursor');

  const line1 = 'Chào mừng bạn đến với';
  const line2 = 'thế giới của JPC';

  let hasSkipped = false;
  let introCompleteNotified = false;
  let typeTimer = null;
  let extractionTimer = null;
  let completionTimer = null;

  function notifyIntroComplete() {
    if (introCompleteNotified) return;
    introCompleteNotified = true;
    if (!playerA && !playerB && (isYtApiReady || (window.YT && window.YT.Player))) {
      initYtMusicPlayer();
    }
    window.dispatchEvent(new CustomEvent('heroIntroComplete'));
  }

  // Immediately render static final layout if reduced motion is requested
  // or user navigated directly to another section via hash
  const initialHash = window.location.hash.slice(1);
  if (prefersReducedMotion || (initialHash && initialHash !== 'home')) {
    finishInstant();
    return;
  }

  // Phase 1: Begin Intro with 12 cards on arc
  document.body.classList.add('play-intro');

  if (titleTextEl) {
    titleTextEl.innerHTML = '';
  }
  if (titleCursorEl) {
    titleCursorEl.classList.add('is-hidden');
  }

  // Phase 2 & 3: At 2.15s, split cards: 8 sink & fade out, 4 swoop along 3D arc to Home
  extractionTimer = window.setTimeout(() => {
    if (hasSkipped) return;
    document.body.classList.add('cards-extracting');
  }, 2150);

  // Phase 4: At 3.70s, 4 cards have fully settled at Home positions. Transition seamlessly to floating & typing!
  completionTimer = window.setTimeout(() => {
    if (hasSkipped) return;
    settleAndStartTyping();
  }, 3700);

  function settleAndStartTyping() {
    document.body.classList.remove('play-intro', 'cards-extracting');
    document.body.classList.add('cards-complete', 'hero-text-active');
    // Card flight animation has fully settled! Trigger music playback immediately!
    notifyIntroComplete();

    if (!titleTextEl) {
      return;
    }

    // Build 2-line structure with distinct colors
    titleTextEl.innerHTML = '';
    const spanLine1 = document.createElement('span');
    spanLine1.className = 'hero__title-line1';
    const br = document.createElement('br');
    const spanLine2 = document.createElement('span');
    spanLine2.className = 'hero__title-line2';

    titleTextEl.appendChild(spanLine1);
    titleTextEl.appendChild(br);
    titleTextEl.appendChild(spanLine2);

    let charIndex = 0;

    const typeLine1 = () => {
      if (hasSkipped) return;

      // Make cursor visible only when text actually begins typing
      if (titleCursorEl) titleCursorEl.classList.remove('is-hidden');

      if (charIndex < line1.length) {
        spanLine1.textContent = line1.slice(0, charIndex + 1);
        charIndex++;
        typeTimer = window.setTimeout(typeLine1, 38);
      } else {
        charIndex = 0;
        typeTimer = window.setTimeout(typeLine2, 160);
      }
    };

    const typeLine2 = () => {
      if (hasSkipped) return;

      if (charIndex < line2.length) {
        spanLine2.textContent = line2.slice(0, charIndex + 1);
        charIndex++;
        typeTimer = window.setTimeout(typeLine2, 38);
      } else {
        // Hide cursor softly after blinking
        window.setTimeout(() => {
          if (titleCursorEl) titleCursorEl.classList.add('is-hidden');
        }, 1600);
        // All animations (cards settling & typewriter) have fully finished! Start music automatically!
        notifyIntroComplete();
      }
    };

    // Small breathing pause after cards settle before typing begins
    typeTimer = window.setTimeout(typeLine1, 100);
  }

  function finishInstant() {
    hasSkipped = true;
    hasUserInteracted = true;
    window.clearTimeout(extractionTimer);
    window.clearTimeout(completionTimer);
    window.clearTimeout(typeTimer);

    // Pre-prime audio right within this user gesture
    try {
      const active = getActivePlayer();
      if (active) {
        if (typeof active.unMute === 'function') active.unMute();
        if (typeof active.setVolume === 'function') active.setVolume(60);
      }
    } catch (_) {}

    document.body.classList.remove('play-intro', 'cards-extracting');
    document.body.classList.add('cards-complete', 'hero-text-active');
    notifyIntroComplete();

    if (titleTextEl) {
      titleTextEl.innerHTML = `<span class="hero__title-line1">${line1}</span><br><span class="hero__title-line2">${line2}</span>`;
    }
    if (titleCursorEl) {
      titleCursorEl.classList.add('is-hidden');
    }
  }

  // Allow clicking anywhere on the hero banner to skip straight to final state
  if (hero) {
    hero.addEventListener('click', (e) => {
      // Don't trigger skip if clicking on a button or link
      if (e.target.closest('a, button')) return;
      hasUserInteracted = true;
      if (!document.body.classList.contains('cards-complete')) {
        finishInstant();
      }
    });
  }

  // Pressing Space or Escape also skips intro
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Escape') {
      hasUserInteracted = true;
      if (!document.body.classList.contains('cards-complete')) {
        finishInstant();
      }
    }
  }, { once: true });
}

/* ==========================================================
   6. MINI CD MUSIC PLAYER CONTROLLER (DUAL-PLAYER INSTANT ENGINE)
   ========================================================== */
let playerA = null;
let playerB = null;
let activePlayerId = 'A'; // 'A' or 'B'
let currentTrackIndex = 0;
let nextPreloadedIndex = 1;
let isMusicPlaying = false;
let pendingAutoPlay = false;
let hasUserInteracted = false;
let isYtApiReady = false;

// Global YouTube IFrame API Ready hook (deferred during card flight animation to avoid frame drops)
window.onYouTubeIframeAPIReady = function() {
  isYtApiReady = true;
  if (hasUserInteracted || !document.body.classList.contains('play-intro')) {
    initYtMusicPlayer();
  }
};

function getNextRandomIndex(excludeIndex, length) {
  if (length <= 1) return 0;
  let next;
  do {
    next = Math.floor(Math.random() * length);
  } while (next === excludeIndex);
  return next;
}

function getActivePlayer() {
  return (activePlayerId === 'A') ? playerA : playerB;
}

function isPlayerCurrentlyPlaying() {
  const active = getActivePlayer();
  if (!active) return isMusicPlaying;
  try {
    if (typeof active.getPlayerState === 'function') {
      const state = active.getPlayerState();
      return state === 1 || state === 3; // 1 = PLAYING, 3 = BUFFERING
    }
  } catch (_) {}
  return isMusicPlaying;
}

let unmuteRetryTimers = [];

function clearAllUnmuteRetries() {
  unmuteRetryTimers.forEach((id) => clearTimeout(id));
  unmuteRetryTimers = [];
}

function scheduleUnmuteAttempts() {
  clearAllUnmuteRetries();
  const delays = [40, 120, 250, 450, 750, 1100, 1600, 2300, 3200];
  delays.forEach((delay) => {
    const timerId = window.setTimeout(() => {
      const active = getActivePlayer();
      if (!active || !isMusicPlaying) return;
      try {
        if (typeof active.unMute === 'function') active.unMute();
        if (typeof active.setVolume === 'function') active.setVolume(60);
        if (typeof active.isMuted === 'function' && !active.isMuted()) {
          clearAllUnmuteRetries();
          removeGlobalUnlockListeners();
        }
      } catch (_) {}
    }, delay);
    unmuteRetryTimers.push(timerId);
  });
}

function initMusicPlayerUI() {
  const playerEl = document.getElementById('musicPlayer');
  const cdBtn = document.getElementById('musicPlayerCdBtn');
  const titleEl = document.getElementById('musicPlayerTitle');
  const shuffleBtn = document.getElementById('musicPlayerShuffleBtn');

  if (!playerEl || !cdBtn || !titleEl || !shuffleBtn) return;

  const playlist = (typeof JPC_PLAYLIST !== 'undefined' && Array.isArray(JPC_PLAYLIST) && JPC_PLAYLIST.length > 0)
    ? JPC_PLAYLIST
    : [
        {
          id: 'qTCu-0my_58',
          title: 'Inazuma Main Theme',
          fullTitle: 'Inazuma Main Theme | Genshin Impact Original Soundtrack: Inazuma Chapter'
        }
      ];

  // Initialize with the iconic Inazuma Main Theme
  currentTrackIndex = 0;
  nextPreloadedIndex = getNextRandomIndex(currentTrackIndex, playlist.length);
  const currentTrack = playlist[currentTrackIndex];
  titleEl.textContent = currentTrack.title;
  titleEl.setAttribute('title', currentTrack.fullTitle || currentTrack.title);

  // Click CD disc -> toggle play/pause directly
  cdBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hasUserInteracted = true;
    if (!playerA && !playerB && (isYtApiReady || (window.YT && window.YT.Player))) {
      initYtMusicPlayer();
    }
    toggleMusicPlayback();
  });

  // Click shuffle button -> instant switch
  shuffleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hasUserInteracted = true;
    if (!playerA && !playerB && (isYtApiReady || (window.YT && window.YT.Player))) {
      initYtMusicPlayer();
    }
    playRandomTrack();
  });

  // Auto-play when hero intro completes
  window.addEventListener('heroIntroComplete', () => {
    startAutoPlay();
  });

  // Setup background audio unlock for any natural interaction (touch, scroll, click)
  setupAudioUnlock();

  // Fallback: Lazy init player after intro duration (4.8s) if not already initialized
  setTimeout(() => {
    if (!playerA && !playerB && (isYtApiReady || (window.YT && window.YT.Player))) {
      initYtMusicPlayer();
    }
  }, 4800);
}

const unlockEvents = ['click', 'pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'];

function handleGlobalUserGesture(e) {
  // If user clicked or interacted directly with music player controls, let button handler manage it
  if (e && e.target && e.target.closest('#musicPlayer')) return;

  hasUserInteracted = true;
  const active = getActivePlayer();
  if (!active) return;

  if (isMusicPlaying || pendingAutoPlay) {
    try {
      if (typeof active.unMute === 'function') active.unMute();
      if (typeof active.setVolume === 'function') active.setVolume(60);
      if (typeof active.playVideo === 'function') active.playVideo();
      scheduleUnmuteAttempts();
    } catch (_) {}
  }
}

function setupAudioUnlock() {
  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleGlobalUserGesture, { passive: true });
  });
}

function removeGlobalUnlockListeners() {
  unlockEvents.forEach((evt) => {
    window.removeEventListener(evt, handleGlobalUserGesture);
  });
}

function initYtMusicPlayer() {
  if (playerA || playerB) return;
  const containerA = document.getElementById('ytMusicPlayerA');
  const containerB = document.getElementById('ytMusicPlayerB');
  if (!containerA || !containerB) return;

  const playlist = (typeof JPC_PLAYLIST !== 'undefined' && Array.isArray(JPC_PLAYLIST) && JPC_PLAYLIST.length > 0)
    ? JPC_PLAYLIST
    : [{ id: 'qTCu-0my_58' }];

  const initialVideoId = playlist[currentTrackIndex] ? playlist[currentTrackIndex].id : 'qTCu-0my_58';
  const preloadedVideoId = playlist[nextPreloadedIndex] ? playlist[nextPreloadedIndex].id : '1qfZ2UufhGY';

  let readyCount = 0;
  const onAnyReady = () => {
    readyCount++;
    if (readyCount >= 1 && pendingAutoPlay && !isMusicPlaying) {
      startMusicPlayback();
    }
  };

  const commonPlayerVars = {
    autoplay: 0,
    controls: 0,
    rel: 0,
    modestbranding: 1,
    playsinline: 1,
    disablekb: 1,
    fs: 0,
    enablejsapi: 1
  };
  if (window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:')) {
    commonPlayerVars.origin = window.location.origin;
  }

  try {
    playerA = new YT.Player('ytMusicPlayerA', {
      height: '200',
      width: '200',
      videoId: initialVideoId,
      playerVars: commonPlayerVars,
      events: {
        onReady: (event) => {
          try {
            const iframe = event.target.getIframe();
            if (iframe) {
              iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            }
            event.target.unMute();
            event.target.setVolume(60);
          } catch (_) {}
          onAnyReady();
        },
        onStateChange: (event) => handlePlayerStateChange('A', event),
        onError: () => handlePlayerError('A')
      }
    });

    playerB = new YT.Player('ytMusicPlayerB', {
      height: '200',
      width: '200',
      videoId: preloadedVideoId,
      playerVars: commonPlayerVars,
      events: {
        onReady: (event) => {
          try {
            const iframe = event.target.getIframe();
            if (iframe) {
              iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            }
            event.target.unMute();
            event.target.setVolume(60);
            event.target.cueVideoById(preloadedVideoId);
          } catch (_) {}
          onAnyReady();
        },
        onStateChange: (event) => handlePlayerStateChange('B', event),
        onError: () => handlePlayerError('B')
      }
    });
  } catch (err) {
    console.error('Failed to init YouTube Dual Players:', err);
  }
}

function handlePlayerStateChange(playerId, event) {
  if (playerId !== activePlayerId) return;
  const playerEl = document.getElementById('musicPlayer');
  if (!playerEl) return;

  if (event.data === YT.PlayerState.PLAYING) {
    isMusicPlaying = true;
    playerEl.classList.add('is-playing');

    const active = getActivePlayer();
    if (active) {
      try {
        if (typeof active.unMute === 'function') active.unMute();
        if (typeof active.setVolume === 'function') active.setVolume(60);
      } catch (_) {}

      try {
        if (typeof active.isMuted === 'function' && active.isMuted()) {
          scheduleUnmuteAttempts();
        } else {
          clearAllUnmuteRetries();
          removeGlobalUnlockListeners();
        }
      } catch (_) {}
    }
  } else if (event.data === YT.PlayerState.PAUSED) {
    isMusicPlaying = false;
    playerEl.classList.remove('is-playing');
    clearAllUnmuteRetries();
  } else if (event.data === YT.PlayerState.ENDED) {
    playRandomTrack();
  }
}

function handlePlayerError(playerId) {
  if (playerId === activePlayerId) {
    console.warn('Playback error on player ' + playerId + ', skipping immediately');
    playRandomTrack();
  }
}

function startAutoPlay() {
  pendingAutoPlay = true;
  if (!playerA && !playerB && (isYtApiReady || (window.YT && window.YT.Player))) {
    initYtMusicPlayer();
  }
  startMusicPlayback();
}

function startMusicPlayback() {
  const active = getActivePlayer();
  if (!active || typeof active.playVideo !== 'function') {
    pendingAutoPlay = true;
    return;
  }
  pendingAutoPlay = false;

  const playerEl = document.getElementById('musicPlayer');
  isMusicPlaying = true;
  if (playerEl) playerEl.classList.add('is-playing');

  try {
    if (typeof active.unMute === 'function') active.unMute();
    if (typeof active.setVolume === 'function') active.setVolume(60);
    active.playVideo();
  } catch (e) {
    console.warn('Playback playVideo() restricted:', e);
  }

  // Progressive un-mute retries across buffering and playback start
  scheduleUnmuteAttempts();
}

function pauseMusicPlayback() {
  pendingAutoPlay = false; // Explicit user pause: never auto-play again
  clearAllUnmuteRetries();
  removeGlobalUnlockListeners();

  isMusicPlaying = false;
  const playerEl = document.getElementById('musicPlayer');
  if (playerEl) playerEl.classList.remove('is-playing');

  const active = getActivePlayer();
  if (active && typeof active.pauseVideo === 'function') {
    try {
      active.pauseVideo();
    } catch (_) {}
  }
}

function toggleMusicPlayback() {
  const active = getActivePlayer();
  if (!active) {
    if (window.YT && window.YT.Player && !playerA && !playerB) {
      initYtMusicPlayer();
    }
    return;
  }

  const isMuted = typeof active.isMuted === 'function' ? active.isMuted() : false;
  const isPlaying = isPlayerCurrentlyPlaying();

  // If playing WITH SOUND (audible) -> user wants to pause!
  if (isPlaying && !isMuted) {
    pauseMusicPlayback();
  } else {
    // If paused, stopped, OR playing silently muted -> UNMUTE & PLAY WITH SOUND!
    startMusicPlayback();
  }
}

function playRandomTrack() {
  const playlist = (typeof JPC_PLAYLIST !== 'undefined' && Array.isArray(JPC_PLAYLIST) && JPC_PLAYLIST.length > 0)
    ? JPC_PLAYLIST
    : [];
  if (playlist.length === 0) return;

  const playerEl = document.getElementById('musicPlayer');
  const titleEl = document.getElementById('musicPlayerTitle');
  const shuffleBtn = document.getElementById('musicPlayerShuffleBtn');

  // Instant rotation pulse animation on shuffle button
  if (shuffleBtn) {
    shuffleBtn.style.transform = 'rotate(180deg) scale(1.15)';
    setTimeout(() => { shuffleBtn.style.transform = ''; }, 280);
  }

  const oldActive = (activePlayerId === 'A') ? playerA : playerB;
  const newActive = (activePlayerId === 'A') ? playerB : playerA;
  const newActiveId = (activePlayerId === 'A') ? 'B' : 'A';

  // 1. Instantly silence and pause current player
  if (oldActive && typeof oldActive.pauseVideo === 'function') {
    try { oldActive.pauseVideo(); } catch (_) {}
  }

  // 2. Set current track to the preloaded track
  currentTrackIndex = nextPreloadedIndex;
  const nowPlaying = playlist[currentTrackIndex];

  // 3. Update title IMMEDIATELY with zero delay
  if (titleEl) {
    titleEl.textContent = nowPlaying.title;
    titleEl.setAttribute('title', nowPlaying.fullTitle || nowPlaying.title);
  }

  // 4. Activate new player and play IMMEDIATELY
  activePlayerId = newActiveId;
  isMusicPlaying = true;
  if (playerEl) playerEl.classList.add('is-playing');

  if (newActive && typeof newActive.playVideo === 'function') {
    try {
      newActive.unMute();
      newActive.setVolume(60);
      newActive.playVideo();
    } catch (_) {
      try { newActive.loadVideoById(nowPlaying.id); } catch (_) {}
    }
  }
  scheduleUnmuteAttempts();

  // 5. In the background, prepare the NEXT random song and cue it into the standby player!
  nextPreloadedIndex = getNextRandomIndex(currentTrackIndex, playlist.length);
  const futureTrack = playlist[nextPreloadedIndex];

  setTimeout(() => {
    if (oldActive && typeof oldActive.cueVideoById === 'function') {
      try {
        oldActive.cueVideoById(futureTrack.id);
      } catch (_) {}
    }
  }, 100);
}

