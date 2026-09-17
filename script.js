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
  initMusicPlayerUI();
  initHeroIntroTimeline();

  // Khóa bôi đen văn bản trên toàn trang (trừ ô input/textarea)
  document.addEventListener('selectstart', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    e.preventDefault();
  });
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
  const branchArrowBtn = branchOrg ? branchOrg.querySelector('.nav__branch-arrow-btn') : null;

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

  // Mobile & Touch accordion behavior for Cơ cấu tổ chức arrow button (toggles 5 Ban sub-accordion)
  if (branchArrowBtn && branchOrg) {
    branchArrowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = branchOrg.classList.toggle('is-open');
      branchArrowBtn.setAttribute('aria-expanded', String(isOpen));
    });

    branchArrowBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = branchOrg.classList.toggle('is-open');
        branchArrowBtn.setAttribute('aria-expanded', String(isOpen));
      }
    });
  }

  // Desktop & Mobile: Di chuột ra ngoài là tự động thu gọn lại
  if (aboutDropdown) {
    aboutDropdown.addEventListener('mouseleave', () => {
      aboutDropdown.classList.remove('is-open');
      if (branchOrg) branchOrg.classList.remove('is-open');
      if (aboutParent) aboutParent.setAttribute('aria-expanded', 'false');
      if (branchArrowBtn) branchArrowBtn.setAttribute('aria-expanded', 'false');
      if (document.activeElement && aboutDropdown.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    });
  }

  if (branchOrg) {
    branchOrg.addEventListener('mouseleave', () => {
      branchOrg.classList.remove('is-open');
      if (branchArrowBtn) branchArrowBtn.setAttribute('aria-expanded', 'false');
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
      }, 100);
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

    document.body.classList.remove('play-intro', 'cards-extracting');
    document.body.classList.add('cards-complete', 'hero-text-active');
    notifyIntroComplete();

    if (titleTextEl) {
      titleTextEl.innerHTML = `<span class="hero__title-line1">${line1}</span><br><span class="hero__title-line2">${line2}</span>`;
    }
    if (titleCursorEl) {
      titleCursorEl.classList.add('is-hidden');
    }

    if (typeof startMusicPlayback === 'function') {
      startMusicPlayback();
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
      } else if (typeof startMusicPlayback === 'function' && !isMusicPlaying) {
        startMusicPlayback();
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
   6. MINI CD MUSIC PLAYER CONTROLLER (PERSISTENT BACKGROUND AUDIO ENGINE)
   ========================================================== */
let bgAudio = null;
let preloaderAudio = null;
let activeAudio = null;
let currentTrackIndex = 0;
let nextPreloadedIndex = 1;
let isMusicPlaying = false;
let pendingAutoPlay = true;
let hasUserInteracted = false;
const playedTrackIndices = new Set();

// BGM Volume Calibration & Loudness Normalization
// Âm lượng nhạc phát được đặt ở mức 20% (0.20) so với mức âm lượng thực tế của máy tính.
// Mỗi bài hát được chuẩn hóa gain (EBU R128 / RMS) dựa trên bản nhạc không lời Inazuma & Genshin OST
// giúp các bài hát thương mại (J-Pop / Anime) có âm lượng hoàn toàn đồng dạng với các bản không lời.
const BGM_BASE_VOLUME = 0.20;
let volumeFadeTimer = null;

function getTrackTargetVolume(track) {
  const currentTrack = track || (getPlaylist()[currentTrackIndex]);
  const trackGain = (currentTrack && typeof currentTrack.gain === 'number') ? currentTrack.gain : 1.0;
  return Math.max(0.01, Math.min(1.0, BGM_BASE_VOLUME * trackGain));
}

function applyBgmVolume(smooth = false, track = null) {
  if (!bgAudio) return;

  const currentTrack = track || (getPlaylist()[currentTrackIndex]);
  const targetVol = getTrackTargetVolume(currentTrack);

  if (volumeFadeTimer) {
    clearInterval(volumeFadeTimer);
    volumeFadeTimer = null;
  }

  if (!smooth) {
    bgAudio.volume = targetVol;
    return;
  }

  // Smooth gentle fade-in ramp (500ms) để không bị tiếng to đột ngột khi đổi bài
  const startVol = Math.min(0.03, targetVol * 0.3);
  bgAudio.volume = startVol;
  const duration = 500;
  const steps = 12;
  const stepTime = duration / steps;
  const volInc = (targetVol - startVol) / steps;
  let currentStep = 0;

  volumeFadeTimer = setInterval(() => {
    currentStep++;
    if (!bgAudio) {
      clearInterval(volumeFadeTimer);
      return;
    }
    const nextVol = Math.min(targetVol, bgAudio.volume + volInc);
    bgAudio.volume = Math.max(0, Math.min(1, nextVol));
    if (currentStep >= steps || bgAudio.volume >= targetVol) {
      bgAudio.volume = targetVol;
      clearInterval(volumeFadeTimer);
      volumeFadeTimer = null;
    }
  }, stepTime);
}

function updateMediaSession(track) {
  if (!('mediaSession' in navigator) || !track) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: 'JPC FTU',
      album: 'CLB Tiếng Nhật — Trường Đại học Ngoại Thương',
      artwork: [
        { src: 'Image/Logo.png', sizes: '512x512', type: 'image/png' }
      ]
    });
    navigator.mediaSession.playbackState = isMusicPlaying ? 'playing' : 'paused';
  } catch (_) {}
}

function initMediaSessionHandlers() {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.setActionHandler('play', () => startMusicPlayback());
    navigator.mediaSession.setActionHandler('pause', () => pauseMusicPlayback());
    navigator.mediaSession.setActionHandler('nexttrack', () => playRandomTrack(true));
    navigator.mediaSession.setActionHandler('previoustrack', () => playRandomTrack(true));
  } catch (_) {}
}

function getPlaylist() {
  return (typeof JPC_PLAYLIST !== 'undefined' && Array.isArray(JPC_PLAYLIST) && JPC_PLAYLIST.length > 0)
    ? JPC_PLAYLIST
    : [
        {
          title: 'Inazuma',
          fullTitle: 'Inazuma',
          src: 'Playlist/Inazuma.m4a',
          gain: 1.0
        }
      ];
}

function getNextRandomIndex(excludeIndex, length, repeatChance = 0.2) {
  if (length <= 1) return 0;

  // Tách các bài hát khả dụng thành 2 nhóm: chưa phát và đã phát (loại trừ bài hiện tại)
  let unplayed = [];
  let played = [];

  for (let i = 0; i < length; i++) {
    if (i === excludeIndex) continue;
    if (playedTrackIndices.has(i)) {
      played.push(i);
    } else {
      unplayed.push(i);
    }
  }

  // Nếu tất cả bài đã phát hết -> reset lại danh sách (giữ lại bài hiện tại để không lặp liên tiếp)
  if (unplayed.length === 0) {
    playedTrackIndices.clear();
    if (excludeIndex >= 0 && excludeIndex < length) {
      playedTrackIndices.add(excludeIndex);
    }
    for (let i = 0; i < length; i++) {
      if (i !== excludeIndex) unplayed.push(i);
    }
    played = [];
  }

  // Khi chủ động đổi bài (repeatChance <= 0) hoặc chưa có bài nào đã phát: 100% chọn bài chưa phát (tỉ lệ lặp lại = 0%)
  if (repeatChance <= 0 || played.length === 0) {
    const rIdx = Math.floor(Math.random() * unplayed.length);
    return unplayed[rIdx];
  }

  // Khi để play hết nhạc tự động: tỉ lệ trúng bài đã nghe là 20% (repeatChance = 0.2), 80% ưu tiên bài chưa nghe
  const pickPlayed = Math.random() < repeatChance;
  if (pickPlayed) {
    const rIdx = Math.floor(Math.random() * played.length);
    return played[rIdx];
  } else {
    const rIdx = Math.floor(Math.random() * unplayed.length);
    return unplayed[rIdx];
  }
}

function updateTitleMarquee() {
  const wrap = document.getElementById('musicPlayerTitleWrap');
  const track = document.getElementById('musicPlayerTitleTrack');
  const title = document.getElementById('musicPlayerTitle');
  const clone = document.getElementById('musicPlayerTitleClone');
  if (!wrap || !title) return;

  // 1. Reset state for accurate unconstrained measurement
  if (wrap) wrap.classList.remove('has-marquee');
  if (track) {
    track.classList.remove('is-scrolling');
    track.style.removeProperty('--marquee-duration');
    track.style.transform = '';
  }
  if (clone) clone.textContent = '';

  // Force reflow
  void title.offsetWidth;

  const wrapWidth = wrap.clientWidth;
  const titleWidth = title.offsetWidth || title.scrollWidth;

  // 2. If title is long (exceeds container width), start continuous seamless loop marquee
  if (wrapWidth > 0 && titleWidth > wrapWidth + 2) {
    if (clone) clone.textContent = title.textContent;
    if (wrap) wrap.classList.add('has-marquee');

    // Pace: ~26px per second for comfortable, readable scrolling
    const itemDistance = titleWidth + 38;
    const duration = Math.max(6, Math.round(itemDistance / 26));

    if (track) {
      track.style.setProperty('--marquee-duration', `${duration}s`);
      requestAnimationFrame(() => {
        track.classList.add('is-scrolling');
      });
    }
  }
}

function initMusicPlayerUI() {
  const playerEl = document.getElementById('musicPlayer');
  const cdBtn = document.getElementById('musicPlayerCdBtn');
  const titleEl = document.getElementById('musicPlayerTitle');
  const shuffleBtn = document.getElementById('musicPlayerShuffleBtn');

  if (!playerEl || !cdBtn || !titleEl || !shuffleBtn) return;

  const playlist = getPlaylist();

  // Initialize with Inazuma.m4a as the default opening track
  const inazumaIdx = playlist.findIndex((t) => t.src && t.src.toLowerCase().includes('inazuma.m4a'));
  currentTrackIndex = inazumaIdx !== -1 ? inazumaIdx : 0;
  playedTrackIndices.add(currentTrackIndex);
  nextPreloadedIndex = getNextRandomIndex(currentTrackIndex, playlist.length, 0.2);

  const initialTrack = playlist[currentTrackIndex];
  titleEl.textContent = initialTrack.title;
  titleEl.setAttribute('title', initialTrack.fullTitle || initialTrack.title);

  // Measure title width and apply back-and-forth marquee if title is long
  setTimeout(updateTitleMarquee, 100);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateTitleMarquee);
  }

  // Recalculate marquee on window resize / mobile orientation change
  let marqueeResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(marqueeResizeTimer);
    marqueeResizeTimer = setTimeout(updateTitleMarquee, 120);
  }, { passive: true });

  // Initialize single persistent DOM audio element (uninterrupted background playback)
  bgAudio = document.getElementById('jpcBgAudio');
  if (!bgAudio) {
    bgAudio = new Audio();
    bgAudio.id = 'jpcBgAudio';
    document.body.appendChild(bgAudio);
  }
  activeAudio = bgAudio;

  // Set calibrated background music volume (20% of computer master volume with track gain normalization)
  bgAudio.volume = getTrackTargetVolume(initialTrack);
  bgAudio.preload = 'auto';

  // Load default opening track (Inazuma.m4a)
  bgAudio.src = encodeURI(initialTrack.src);
  bgAudio.load();

  // Preloader instance for caching upcoming track
  preloaderAudio = new Audio();
  preloaderAudio.preload = 'auto';
  const preloadedTrack = playlist[nextPreloadedIndex];
  if (preloadedTrack) {
    preloaderAudio.src = encodeURI(preloadedTrack.src);
    preloaderAudio.load();
  }

  // Continuous background playback: handle track ended on the same audio element
  bgAudio.addEventListener('ended', () => {
    playRandomTrack(false);
  });

  // Audio error fallback - auto recover if active track errors
  bgAudio.addEventListener('error', () => {
    console.warn('Audio playback error on track', currentTrackIndex, bgAudio.error);
    setTimeout(() => {
      playRandomTrack(false);
    }, 100);
  });

  // Background tab & visibility persistence
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      updateTitleMarquee();
      if (isMusicPlaying && bgAudio && bgAudio.paused) {
        bgAudio.play().catch(() => {});
      }
    }
  });

  // Register OS Media Session controls
  initMediaSessionHandlers();
  updateMediaSession(initialTrack);

  // Click hint badge -> bật nhạc trực tiếp
  const hintEl = document.getElementById('musicPlayerHint');
  if (hintEl) {
    hintEl.addEventListener('click', (e) => {
      e.stopPropagation();
      hasUserInteracted = true;
      unlockAudioContext();
      startMusicPlayback();
    });
  }

  // Click CD disc -> toggle play/pause directly
  cdBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hasUserInteracted = true;
    unlockAudioContext();
    toggleMusicPlayback();
  });

  // Click shuffle button -> chủ động đổi bài: tỉ lệ lặp lại bài đã phát bằng 0%
  shuffleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hasUserInteracted = true;
    unlockAudioContext();
    playRandomTrack(true);
  });

  // Auto-play when hero intro completes
  window.addEventListener('heroIntroComplete', () => {
    startAutoPlay();
  });

  // Setup background audio unlock for any natural interaction (touch, scroll, click, keydown)
  setupAudioUnlock();
}

const unlockEvents = ['click', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'keydown'];

function unlockAudioContext() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      if (!window._jpcAudioCtx) window._jpcAudioCtx = new AudioContext();
      if (window._jpcAudioCtx.state === 'suspended') {
        window._jpcAudioCtx.resume();
      }
    }
  } catch (_) {}
}

function handleGlobalUserGesture(e) {
  // If user clicked or interacted directly with music player controls, let button handler manage it
  if (e && e.target && e.target.closest('#musicPlayer')) return;

  hasUserInteracted = true;
  unlockAudioContext();
  if (!activeAudio) return;

  if (pendingAutoPlay && !isMusicPlaying) {
    startMusicPlayback();
  }
}

function setupAudioUnlock() {
  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleGlobalUserGesture, { passive: true, capture: true });
  });
}

function removeGlobalUnlockListeners() {
  unlockEvents.forEach((evt) => {
    window.removeEventListener(evt, handleGlobalUserGesture, { capture: true });
  });
}

function startAutoPlay() {
  pendingAutoPlay = true;
  startMusicPlayback();
}

function startMusicPlayback() {
  if (!bgAudio) return;
  unlockAudioContext();

  const playerEl = document.getElementById('musicPlayer');
  isMusicPlaying = true;
  if (playerEl) {
    playerEl.classList.add('is-playing');
    playerEl.classList.remove('needs-gesture');
  }

  // Ensure current track is properly loaded if audio was in error state or empty
  const playlist = getPlaylist();
  const currentTrack = playlist[currentTrackIndex];
  if (currentTrack && (bgAudio.error || !bgAudio.src || bgAudio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)) {
    bgAudio.src = encodeURI(currentTrack.src);
    bgAudio.load();
  }

  // Apply calibrated BGM volume with gentle ramp if starting from silence
  if (bgAudio.volume < getTrackTargetVolume(currentTrack) * 0.5) {
    applyBgmVolume(true, currentTrack);
  }

  const playPromise = bgAudio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        pendingAutoPlay = false;
        if (playerEl) {
          playerEl.classList.remove('needs-gesture');
          playerEl.classList.add('is-playing');
        }
        updateMediaSession(currentTrack);
        removeGlobalUnlockListeners();
      })
      .catch((err) => {
        console.warn('Playback error:', err.name, err.message);
        if (err.name === 'NotAllowedError') {
          // Browser autoplay restriction waiting for first user gesture
          pendingAutoPlay = true;
          isMusicPlaying = false;
          if (playerEl) {
            playerEl.classList.remove('is-playing');
            playerEl.classList.add('needs-gesture');
          }
          if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
        } else {
          // Media decode/network error: auto advance to next playable track
          console.warn('Media error detected, advancing to next track');
          playRandomTrack(false);
        }
      });
  }
}

function pauseMusicPlayback() {
  pendingAutoPlay = false; // Explicit user pause: never auto-play again
  removeGlobalUnlockListeners();

  isMusicPlaying = false;
  const playerEl = document.getElementById('musicPlayer');
  if (playerEl) {
    playerEl.classList.remove('is-playing');
    playerEl.classList.remove('needs-gesture');
  }

  if (bgAudio) {
    bgAudio.pause();
  }
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = 'paused';
  }
}

function toggleMusicPlayback() {
  if (isMusicPlaying) {
    pauseMusicPlayback();
  } else {
    startMusicPlayback();
  }
}

function playRandomTrack(isManual = false) {
  const playlist = getPlaylist();
  if (playlist.length === 0 || !bgAudio) return;

  const playerEl = document.getElementById('musicPlayer');
  const titleEl = document.getElementById('musicPlayerTitle');
  const shuffleBtn = document.getElementById('musicPlayerShuffleBtn');

  // Instant rotation pulse animation on shuffle button
  if (shuffleBtn && isManual) {
    shuffleBtn.style.transform = 'rotate(180deg) scale(1.15)';
    setTimeout(() => { shuffleBtn.style.transform = ''; }, 280);
  }

  // 1. Instantly silence current track before loading next
  bgAudio.pause();
  bgAudio.currentTime = 0;

  // 2. Xác định bài tiếp theo:
  // - Khi chủ động đổi bài (isManual = true): tỉ lệ lặp lại bài đã phát là 0%.
  //   Nếu bài preloaded đã vô tình là bài từng phát, chọn lại 1 bài chưa từng phát.
  let targetIndex = nextPreloadedIndex;
  if (isManual) {
    if (playedTrackIndices.has(targetIndex)) {
      targetIndex = getNextRandomIndex(currentTrackIndex, playlist.length, 0.0);
    }
  }
  currentTrackIndex = targetIndex;
  playedTrackIndices.add(currentTrackIndex);
  const nowPlaying = playlist[currentTrackIndex];

  // 3. Update title UI (defer heavy layout measurement if tab is in background)
  const trackEl = document.getElementById('musicPlayerTitleTrack');
  const cloneEl = document.getElementById('musicPlayerTitleClone');

  if (titleEl) {
    titleEl.textContent = nowPlaying.title;
    titleEl.setAttribute('title', nowPlaying.fullTitle || nowPlaying.title);
    if (cloneEl) cloneEl.textContent = '';

    if (!document.hidden) {
      if (trackEl) {
        trackEl.classList.remove('is-scrolling');
        trackEl.classList.add('is-changing');
      }
      setTimeout(() => {
        if (trackEl) trackEl.classList.remove('is-changing');
        updateTitleMarquee();
      }, 220);
    }
  }

  // 4. Play new track on the SAME persistent master audio element (continuous background stream)
  const targetSrc = encodeURI(nowPlaying.src);
  bgAudio.src = targetSrc;
  bgAudio.currentTime = 0;
  applyBgmVolume(true, nowPlaying);

  unlockAudioContext();
  isMusicPlaying = true;
  if (playerEl) playerEl.classList.add('is-playing');

  const playPromise = bgAudio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        pendingAutoPlay = false;
        if (playerEl) {
          playerEl.classList.remove('needs-gesture');
          playerEl.classList.add('is-playing');
        }
        updateMediaSession(nowPlaying);
        removeGlobalUnlockListeners();
      })
      .catch((err) => {
        console.warn('Playback deferred or failed:', err.name, err.message);
        if (err.name === 'NotAllowedError') {
          pendingAutoPlay = true;
          isMusicPlaying = false;
          if (playerEl) {
            playerEl.classList.remove('is-playing');
            playerEl.classList.add('needs-gesture');
          }
          if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
        } else {
          console.warn('Track playback error, advancing to next track');
          playRandomTrack(false);
        }
      });
  }

  // 5. In background, cache NEXT random song ahead of time in preloader instance
  nextPreloadedIndex = getNextRandomIndex(currentTrackIndex, playlist.length, 0.2);
  const futureTrack = playlist[nextPreloadedIndex];
  if (futureTrack && preloaderAudio) {
    preloaderAudio.src = encodeURI(futureTrack.src);
    preloaderAudio.preload = 'auto';
    preloaderAudio.load();
  }
}

