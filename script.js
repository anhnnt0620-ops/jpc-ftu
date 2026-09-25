/**
 * JPC FTU — CLB Tiếng Nhật Trường Đại học Ngoại Thương
 * Main Javascript Controller
 * - Mobile Navigation Toggle
 * - Internal SPA View Navigation
 * - Ambient Visual Effects (Gold Needles, Cursor Streak)
 * - 4-Phase Hero Intro Timeline Animation with Typewriter Effect
 */

// 0. RELOAD RESET & SCROLL RESTORATION ENGINE
// Khi người dùng tải lại trang (F5 hoặc Refresh):
// - Đặt scrollRestoration là 'manual' để trình duyệt không tự cuộn xuống vị trí cũ
// - Cuộn ngay về đỉnh trang (0, 0)
// - Reset URL hash về trang chủ (#home), xóa hash cũ để intro animation chạy lại từ đầu
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const isPageReload = (() => {
  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      return navEntries[0].type === 'reload';
    }
    return performance.navigation && performance.navigation.type === 1;
  } catch (_) {
    return false;
  }
})();

if (isPageReload && window.location.hash) {
  try {
    history.replaceState(null, '', window.location.pathname);
  } catch (_) {}
}

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

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

  // Mobile & Touch behavior for Về JPC dropdown
  // Clicking "Về JPC" link navigates directly to #about (Giới thiệu chung về JPC).
  // Clicking the small arrow icon (▾) toggles the dropdown submenu.
  if (aboutParent && aboutDropdown) {
    const arrowBtn = aboutParent.querySelector('.nav__arrow');
    if (arrowBtn) {
      arrowBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = aboutDropdown.classList.toggle('is-open');
        aboutParent.setAttribute('aria-expanded', String(isOpen));
        if (!isOpen && branchOrg) {
          branchOrg.classList.remove('is-open');
          if (branchArrowBtn) {
            branchArrowBtn.setAttribute('aria-expanded', 'false');
            branchArrowBtn.blur();
          }
        }
      });
    }

    // Direct click handler on "Về JPC" link: immediately navigates to "Giới thiệu chung về JPC" (#about)
    aboutParent.addEventListener('click', (e) => {
      // If clicking specifically on the small arrow icon, allow arrowBtn handler to toggle dropdown
      if (e.target && (e.target.classList.contains('nav__arrow') || e.target.closest('.nav__arrow'))) {
        return;
      }

      e.preventDefault();

      // Immediately dismiss dropdown and mobile hamburger menu
      aboutDropdown.classList.remove('is-open');
      aboutDropdown.classList.add('is-force-closed');
      setTimeout(() => aboutDropdown.classList.remove('is-force-closed'), 400);

      if (branchOrg) branchOrg.classList.remove('is-open');

      if (navMenu && navToggle) {
        navMenu.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }

      if (document.activeElement) document.activeElement.blur();
      aboutParent.blur();

      // Navigate immediately to Giới thiệu chung về JPC (#about)
      if (typeof window.showView === 'function') {
        window.showView('about', true);
      } else {
        window.location.hash = '#about';
      }

      window.scrollTo(0, 0);
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }

  // Mobile & Touch accordion behavior for Cơ cấu tổ chức arrow button (toggles 5 Ban sub-accordion)
  if (branchArrowBtn && branchOrg) {
    branchArrowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = branchOrg.classList.toggle('is-open');
      branchArrowBtn.setAttribute('aria-expanded', String(isOpen));
      if (!isOpen) {
        branchArrowBtn.blur();
      }
    });

    branchArrowBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = branchOrg.classList.toggle('is-open');
        branchArrowBtn.setAttribute('aria-expanded', String(isOpen));
        if (!isOpen) {
          branchArrowBtn.blur();
        }
      }
    });
  }

  // Desktop & Mobile: Di chuột ra ngoài là tự động thu gọn lại
  if (aboutDropdown) {
    aboutDropdown.addEventListener('mouseleave', () => {
      aboutDropdown.classList.remove('is-open');
      if (branchOrg) branchOrg.classList.remove('is-open');
      if (aboutParent) aboutParent.setAttribute('aria-expanded', 'false');
      if (branchArrowBtn) {
        branchArrowBtn.setAttribute('aria-expanded', 'false');
        branchArrowBtn.blur();
      }
      if (document.activeElement && aboutDropdown.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    });
  }

  if (branchOrg && branchArrowBtn) {
    branchOrg.addEventListener('mouseenter', () => {
      if (window.innerWidth > 720) {
        branchArrowBtn.setAttribute('aria-expanded', 'true');
      }
    });
    branchOrg.addEventListener('mouseleave', () => {
      branchOrg.classList.remove('is-open');
      branchArrowBtn.setAttribute('aria-expanded', 'false');
      branchArrowBtn.blur();
      if (document.activeElement && branchOrg.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    });
  }

  // Close dropdown on click outside or ESC key
  document.addEventListener('click', (e) => {
    if (aboutDropdown && !aboutDropdown.contains(e.target) && !navToggle.contains(e.target)) {
      aboutDropdown.classList.remove('is-open');
      if (branchOrg) {
        branchOrg.classList.remove('is-open');
        if (branchArrowBtn) {
          branchArrowBtn.setAttribute('aria-expanded', 'false');
          branchArrowBtn.blur();
        }
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (aboutDropdown) aboutDropdown.classList.remove('is-open');
      if (branchOrg) {
        branchOrg.classList.remove('is-open');
        if (branchArrowBtn) {
          branchArrowBtn.setAttribute('aria-expanded', 'false');
          branchArrowBtn.blur();
        }
      }
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

    // Synchronize 3D WebGL camera and background depth with current view
    if (window.JPC3D && typeof window.JPC3D.transitionView === 'function') {
      window.JPC3D.transitionView(activeView ? activeView.id : viewId);
    }

    if (requestedEl && requestedEl !== activeView) {
      setTimeout(() => {
        requestedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (isContact && contact) {
      contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo(0, 0);
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // Expose showView globally so navigation handlers can trigger direct view switches
  window.showView = showView;

  const DEPT_IDS = ['dept-btc', 'dept-bcm', 'dept-btt', 'dept-bns', 'dept-bdn'];
  let isBanTransitionRunning = false;
  let currentBanTimeline = null;
  let banSafetyTimer = null;

  /**
   * 3-Phase Cinematic Department Transition:
   * Phase 1 (1.8s): 5 Ban cards spin rapidly as a pentagonal loading vortex (Xoay load.png)
   * Phase 2 (2.2s): Decelerates & locks upright on chosen card (12h) with golden bloom & confetti (Lá bài của ban được chọn.png)
   * Phase 3 (1.7s): Golden-crimson aura expands 360° -> switches view silently at peak & resets scroll to (0, 0) -> fades out cleanly
   * Total duration: ~5.7s
   */
  const playBanTransition = (targetDeptId, onPageSwitchReady, onFinish) => {
    if (isBanTransitionRunning && currentBanTimeline) {
      currentBanTimeline.kill();
      isBanTransitionRunning = false;
    }
    isBanTransitionRunning = true;
    if (banSafetyTimer) clearTimeout(banSafetyTimer);

    const overlay = document.getElementById('banTransitionOverlay');
    const ring = document.getElementById('banTransitionRing');
    const aura = document.getElementById('banTransitionAura');
    const pulseRipple = document.getElementById('banTransitionPulseRipple');
    const vortexCards = overlay ? [...overlay.querySelectorAll('.ban-vortex-card')] : [];

    if (!overlay || !ring || !aura || vortexCards.length === 0) {
      console.warn('[JPC Ban Transition] Elements missing, navigating directly.');
      if (typeof onPageSwitchReady === 'function') onPageSwitchReady();
      window.scrollTo(0, 0);
      if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
      if (typeof onFinish === 'function') onFinish();
      isBanTransitionRunning = false;
      return;
    }

    // Safety timeout to ensure isBanTransitionRunning never locks
    banSafetyTimer = setTimeout(() => {
      if (isBanTransitionRunning) {
        overlay.classList.remove('is-active');
        document.body.classList.remove('ban-transition-active');
        if (window.JPC3D && typeof window.JPC3D.stopCardRainLoop === 'function') {
          window.JPC3D.stopCardRainLoop();
        }
        isBanTransitionRunning = false;
      }
    }, 8500);

    const deptOrder = ['dept-btc', 'dept-bcm', 'dept-btt', 'dept-bns', 'dept-bdn'];
    let targetIndex = deptOrder.indexOf(targetDeptId);
    if (targetIndex === -1) targetIndex = 0;

    // Card 0 (BTC) at 0deg, Card 1 (BCM) at 72deg, Card 2 (BTT) at 144deg, Card 3 (BNS) at 216deg, Card 4 (BDN) at 288deg
    // To lock selected card at 0deg (top, 12 o'clock upright position):
    // targetIndex * 72 + finalRotation = 360 * spins => finalRotation = 360 * spins - targetIndex * 72
    const spins = 4;
    const finalRotation = 360 * spins - targetIndex * 72;

    console.info(`[JPC Ban Transition] Starting transition to: ${targetDeptId} (stop rotation: ${finalRotation}deg)`);

    // Giữ nguyên hiệu ứng cánh hoa và mưa bài 3D liên tục ở nền trong suốt quá trình xoay bài
    if (window.JPC3D && typeof window.JPC3D.startCardRainLoop === 'function') {
      window.JPC3D.startCardRainLoop();
    }

    // Activate overlay and reset card states
    overlay.classList.add('is-active');
    document.body.classList.add('ban-transition-active');
    overlay.setAttribute('aria-hidden', 'false');
    vortexCards.forEach((c) => {
      c.classList.remove('is-selected', 'is-dimmed', 'is-dash-out');
      c.style.removeProperty('opacity');
      c.style.removeProperty('transform');
    });

    const gsapRef = window.gsap || (typeof gsap !== 'undefined' ? gsap : null);

    if (gsapRef) {
      // Initialize GSAP values
      gsapRef.set(ring, { rotation: 0 });
      gsapRef.set(aura, { scale: 0, opacity: 0 });
      if (pulseRipple) gsapRef.set(pulseRipple, { scale: 0.1, opacity: 0 });
      gsapRef.set('#banTransitionStage', { opacity: 1 });
      gsapRef.set('#banTransitionRipples', { opacity: 1 });
      gsapRef.set(overlay, { opacity: 1 });
      gsapRef.set(vortexCards, { opacity: 1 });

      const tl = gsapRef.timeline({
        onComplete: () => {
          clearTimeout(banSafetyTimer);
          overlay.classList.remove('is-active');
          document.body.classList.remove('ban-transition-active');
          overlay.setAttribute('aria-hidden', 'true');
          vortexCards.forEach((c) => {
            c.classList.remove('is-selected', 'is-dimmed', 'is-dash-out');
            c.style.removeProperty('opacity');
            c.style.removeProperty('transform');
          });
          gsapRef.set(ring, { rotation: 0 });
          gsapRef.set(aura, { scale: 0, opacity: 0 });
          if (pulseRipple) gsapRef.set(pulseRipple, { scale: 0.1, opacity: 0 });
          gsapRef.set('#banTransitionStage', { opacity: 1 });
          gsapRef.set('#banTransitionRipples', { opacity: 1 });
          gsapRef.set(overlay, { opacity: 1 });
          if (window.JPC3D && typeof window.JPC3D.stopCardRainLoop === 'function') {
            window.JPC3D.stopCardRainLoop();
          }
          isBanTransitionRunning = false;
          currentBanTimeline = null;
          console.info('[JPC Ban Transition] Transition complete.');
          if (typeof onFinish === 'function') onFinish();
        }
      });
      currentBanTimeline = tl;

      // --- GIAI ĐOẠN 1: Tụ về tâm & Xoay nhanh vòng xoay load (1.8 giây: 0.0s -> 1.8s) ---
      // 5 lá bài Ban quay nhanh quanh tâm, chữ hướng vào trong (Xoay load.png)
      tl.fromTo(ring,
        { rotation: 0 },
        { rotation: finalRotation, duration: 1.8, ease: 'power2.inOut' },
        0
      );

      // --- GIAI ĐOẠN 2: Dừng & Khóa lá bài ban được chọn ở đỉnh 12h (1.8s -> 3.5s, giữ 1.7 giây) ---
      // Lá bài ban được chọn nổi bật ở vị trí 12h, viền phát sáng vàng, 4 lá còn lại mờ đi (Lá bài của ban được chọn.png)
      tl.add(() => {
        console.info(`[JPC Ban Transition] Phase 2: Locked on selected card: ${targetDeptId}`);
        vortexCards.forEach((c) => {
          if (c.getAttribute('data-dept') === targetDeptId) {
            c.classList.add('is-selected');
          } else {
            c.classList.add('is-dimmed');
          }
        });
        if (typeof window.fireJapaneseConfetti === 'function') {
          window.fireJapaneseConfetti(0.5, 0.35);
        }
        if (window.JPC3D && typeof window.JPC3D.pulse === 'function') {
          window.JPC3D.pulse(1.4);
        }
      }, 1.8);

      // Xung sóng gợn nước lan tỏa từ tâm khi lá bài được chọn khóa vị trí 12h
      if (pulseRipple) {
        tl.fromTo(pulseRipple,
          { scale: 0.2, opacity: 0.95 },
          { scale: 3.6, opacity: 0, duration: 1.35, ease: 'power2.out', immediateRender: false },
          1.8
        );
      }

      // --- GIAI ĐOẠN 3: Lá bài vụt ra khỏi màn hình, gợn sóng biến mất & làm rõ dần UI riêng của Ban (từ 3.5s) ---
      // 1. Tại 3.5s: 4 lá bài mờ biến mất, vòng tròn gợn sóng ở giữa màn hình cũng đồng thời biến mất
      tl.to('.ban-vortex-card.is-dimmed', {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.out'
      }, 3.5);

      tl.to('#banTransitionRipples', {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
      }, 3.5);

      // 2. Gợn sóng chỉ chiếu đến đoạn lan ra toàn màn hình và hết (dissipates hoàn toàn tại viền màn hình)
      tl.fromTo(aura,
        { scale: 0.2, opacity: 0.95 },
        { scale: 42, opacity: 0, duration: 0.85, ease: 'power2.out', immediateRender: false },
        3.5
      );

      // 3. Lá bài của Ban được chọn phóng vụt ra khỏi màn hình (cardDashOut animation)
      tl.add(() => {
        console.info(`[JPC Ban Transition] Phase 3: Card dashing out towards screen for ${targetDeptId}...`);
        vortexCards.forEach((c) => {
          if (c.getAttribute('data-dept') === targetDeptId) {
            c.classList.add('is-dash-out');
          }
        });
      }, 3.5);

      // 4. Khi lá bài vụt ra khỏi màn hình (3.75s) -> âm thầm chuyển sang UI riêng của Ban và làm rõ dần luôn!
      tl.add(() => {
        console.info(`[JPC Ban Transition] Card dashed out: Switching view to ${targetDeptId} & revealing Ban UI...`);
        if (typeof onPageSwitchReady === 'function') {
          onPageSwitchReady();
        }
        window.scrollTo(0, 0);
        if (window.lenis) {
          window.lenis.scrollTo(0, { immediate: true });
        }
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        // Bắt đầu làm rõ dần UI riêng của Ban (gỡ bỏ làm mờ & tối)
        document.body.classList.remove('ban-transition-active');
      }, 3.75);

      // 5. Overlay làm mờ biến mất mượt mà để lộ hoàn toàn UI sắc nét của Ban
      tl.to(overlay, {
        opacity: 0,
        duration: 0.55,
        ease: 'power2.out'
      }, 3.8);

    } else {
      // CSS/JS Fallback if GSAP is not loaded
      vortexCards.forEach((c) => {
        c.style.opacity = '1';
        c.classList.remove('is-selected', 'is-dimmed', 'is-dash-out');
      });
      ring.style.transition = 'transform 1.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
      ring.style.transform = `rotate(${finalRotation}deg)`;

      setTimeout(() => {
        vortexCards.forEach((c) => {
          if (c.getAttribute('data-dept') === targetDeptId) {
            c.classList.add('is-selected');
          } else {
            c.classList.add('is-dimmed');
          }
        });
        if (typeof window.fireJapaneseConfetti === 'function') {
          window.fireJapaneseConfetti(0.5, 0.35);
        }

        setTimeout(() => {
          // Dash card out & ripples fade out
          const centerRipples = document.getElementById('banTransitionRipples');
          if (centerRipples) centerRipples.style.opacity = '0';
          vortexCards.forEach((c) => {
            if (c.getAttribute('data-dept') === targetDeptId) {
              c.classList.add('is-dash-out');
            } else {
              c.style.opacity = '0';
            }
          });

          aura.style.transition = 'transform 0.75s ease-out, opacity 0.75s ease-out';
          aura.style.transform = 'scale(42)';
          aura.style.opacity = '0';

          setTimeout(() => {
            if (typeof onPageSwitchReady === 'function') onPageSwitchReady();
            window.scrollTo(0, 0);
            if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            document.body.classList.remove('ban-transition-active');

            overlay.style.transition = 'opacity 0.5s ease-out';
            overlay.style.opacity = '0';

            setTimeout(() => {
              clearTimeout(banSafetyTimer);
              overlay.classList.remove('is-active');
              overlay.style.removeProperty('opacity');
              if (centerRipples) centerRipples.style.removeProperty('opacity');
              vortexCards.forEach((c) => {
                c.classList.remove('is-selected', 'is-dimmed', 'is-dash-out');
                c.style.removeProperty('opacity');
              });
              isBanTransitionRunning = false;
              if (typeof onFinish === 'function') onFinish();
            }, 550);
          }, 250);
        }, 1700);
      }, 1800);
    }
  };

  window.playBanTransition = (deptId) => {
    playBanTransition(deptId, () => showView(deptId, true));
  };

  // Robust document-level click delegation for all internal links & department navigation
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const targetId = href.slice(1);
    if (!targetId) return;

    event.preventDefault();

    const closeMenus = () => {
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
      if (aboutDropdown) {
        aboutDropdown.classList.remove('is-open');
        aboutDropdown.classList.add('is-force-closed');
        setTimeout(() => aboutDropdown.classList.remove('is-force-closed'), 400);
      }
      if (branchOrg) branchOrg.classList.remove('is-open');
    };

    const isDeptTarget = DEPT_IDS.includes(targetId);

    // CHỈ kích hoạt hiệu ứng xoay bài khi bấm vào ban ở:
    // 1. UI Ban (thẻ ban tại phần About: .about-org-card hoặc .dept-card)
    // 2. Options (menu dropdown trên nav: .nav__sub-item hoặc bên trong #navBranchOrg)
    // Còn khi bấm vào xem ban khác ở cuối trang (.dept__nav-pill) -> trực tiếp chuyển trang luôn!
    const isFromAboutSection = Boolean(link.closest('.about-org-card') || link.closest('.dept-card'));
    const isFromNavDropdown = Boolean(link.closest('.nav__sub-item') || link.closest('#navBranchOrg'));
    const shouldPlayVortex = isDeptTarget && (isFromAboutSection || isFromNavDropdown);

    if (shouldPlayVortex) {
      closeMenus();
      playBanTransition(targetId, () => {
        showView(targetId, true);
      });
      return;
    }

    // Trực tiếp chuyển trang cho các link khác (bao gồm cả pill xem ban khác ở cuối trang)
    showView(targetId, true);
    closeMenus();
  });

  window.addEventListener('hashchange', () => {
    const targetId = window.location.hash.slice(1);
    if (targetId) showView(targetId);
  });

  // Initial view on load: nếu tải lại trang (reload/F5), luôn reset về 'home'
  const initialHash = isPageReload ? '' : window.location.hash.slice(1);
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

  container.innerHTML = '';
  const isMobile = window.innerWidth <= 768;
  const count = isMobile ? 14 : 28;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'mini-card';
    card.style.pointerEvents = 'none';

    // Distribute: Left lane (40%), Right lane (40%), Center ambient lane (20%)
    const laneType = i % 5;
    let leftPercent;

    if (laneType === 0 || laneType === 1) {
      leftPercent = 1.5 + (i * 7.3) % 23.5;
    } else if (laneType === 2 || laneType === 3) {
      leftPercent = 75.0 + (i * 7.3) % 23.5;
    } else {
      leftPercent = 25.0 + (i * 11.7) % 50.0;
    }

    const duration = 8.0 + ((i * 3.7) % 7) * 1.2;
    const delay = -((i / count) * duration + (i % 3) * 0.8);

    const sizeTier = i % 3;
    const isCenter = (laneType === 4);
    const width = isMobile
      ? (sizeTier === 0 ? 12 : sizeTier === 1 ? 15 : 18)
      : (isCenter ? (sizeTier === 0 ? 14 : 17) : (sizeTier === 0 ? 16 : sizeTier === 1 ? 21 : 26));
    const height = Math.round(width * 1.4);

    const opacity = isCenter
      ? (sizeTier === 0 ? 0.38 : 0.52)
      : (sizeTier === 0 ? 0.58 : sizeTier === 1 ? 0.72 : 0.88);

    const rzStart = -45 + ((i * 37) % 90);
    const rzEnd = rzStart + (i % 2 === 0 ? 1 : -1) * (180 + ((i * 29) % 150));
    const rx = 180 + ((i * 41) % 240);
    const ry = 160 + ((i * 31) % 220);
    const drift = (i % 2 === 0 ? 1 : -1) * (isMobile ? 8 + (i % 4) * 3 : 14 + (i % 5) * 5);

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
      card.classList.add('mini-card--sakura');
    } else if (i % 5 === 0) {
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
    isIntroAnimationFinished = true;
    window.dispatchEvent(new CustomEvent('heroIntroComplete'));
  }

  // Đảm bảo xóa sạch các class cũ nếu DOM được trình duyệt cache lại
  document.body.classList.remove('cards-complete', 'cards-extracting', 'hero-text-active');

  // Immediately render static final layout ONLY if reduced motion is requested
  // or user navigated directly from an external link to another section via hash (non-reload)
  const initialHash = isPageReload ? '' : window.location.hash.slice(1);
  if (prefersReducedMotion || (initialHash && initialHash !== 'home')) {
    finishInstant();
    return;
  }

  // Phase 1: Begin Intro with 3D Swirl & Fist Clench
  document.body.classList.add('play-intro');

  if (titleTextEl) {
    titleTextEl.innerHTML = '';
  }
  if (titleCursorEl) {
    titleCursorEl.classList.add('is-hidden');
  }

  const handleSnapTrigger = () => {
    if (hasSkipped) return;
    document.body.classList.add('cards-extracting', 'cards-bursting');
    
    // Búng tay là dấu hiệu bật nhạc: Đảm bảo bài Playlist/Inazuma.m4a phát tự động lập tức
    unlockAudioContext();

    const playlist = getPlaylist();
    const inazumaIdx = playlist.findIndex((t) => t.src && t.src.toLowerCase().includes('inazuma.m4a'));
    if (inazumaIdx !== -1) {
      currentTrackIndex = inazumaIdx;
      if (bgAudio && (!bgAudio.src || !bgAudio.src.toLowerCase().includes('inazuma.m4a'))) {
        bgAudio.src = encodeURI(playlist[currentTrackIndex].src);
        bgAudio.load();
      }
      const titleEl = document.getElementById('musicPlayerTitle');
      if (titleEl) {
        titleEl.textContent = playlist[currentTrackIndex].title;
        titleEl.setAttribute('title', playlist[currentTrackIndex].fullTitle || playlist[currentTrackIndex].title);
      }
      updateTitleMarquee();
    }

    startMusicPlayback();

    // Steady ambient visual - no full-screen flash over the petals
    const snapFlash = document.getElementById('snapFlash');
    if (snapFlash) {
      snapFlash.classList.remove('is-active');
    }
  };

  const handleIntroComplete = () => {
    if (hasSkipped) return;
    settleAndStartTyping();
    if (!isMusicPlaying) {
      startMusicPlayback();
    }
  };

  // Connect directly with Three.js 3D Finger-Snap Intro Engine
  if (window.JPC3D && typeof window.JPC3D.playSnapIntro === 'function') {
    window.JPC3D.playSnapIntro(handleSnapTrigger, handleIntroComplete);
  } else {
    // Fallback timers if 3D scene is initializing
    document.body.classList.remove('is-loading');
    extractionTimer = window.setTimeout(handleSnapTrigger, 1350);
    completionTimer = window.setTimeout(handleIntroComplete, 2500);
  }

  // Safety watchdog timer: ensure is-loading is dismissed even on network/WebGL delays
  window.setTimeout(() => {
    if (document.body.classList.contains('is-loading')) {
      document.body.classList.remove('is-loading');
    }
  }, 1200);

  function settleAndStartTyping() {
    document.body.classList.remove('is-loading', 'play-intro', 'cards-extracting', 'cards-bursting');
    document.body.classList.add('cards-complete', 'hero-text-active');
    // Intro animation has finished running (4 cards settled). Automatically start music!
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

    if (window.JPC3D && typeof window.JPC3D.finishInstant3D === 'function') {
      window.JPC3D.finishInstant3D();
    }

    document.body.classList.remove('is-loading', 'play-intro', 'cards-extracting', 'cards-bursting');
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

  // Any tap or click on the hero banner primes audio & user gesture without canceling 3D intro!
  if (hero) {
    hero.addEventListener('click', (e) => {
      // Don't interfere if clicking on explicit links, buttons or interactive controls
      if (e.target.closest('a, button, input, textarea, #musicPlayer')) return;
      hasUserInteracted = true;
      unlockAudioContext();
      if (pendingAutoPlay || document.body.classList.contains('cards-extracting') || document.body.classList.contains('cards-complete')) {
        if (!isMusicPlaying) {
          startMusicPlayback();
        }
      }
    });
  }

  // Pressing Escape skips intro if user explicitly wishes to skip
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
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
let isIntroAnimationFinished = false;
let pendingAutoPlay = false;
let hasUserInteracted = false;
const playedTrackIndices = new Set();
let consecutiveAudioErrors = 0;
let lastShuffleClickTime = 0;
let lastCdClickTime = 0;
let isTrackSwitching = false;

function isMobileDevice() {
  return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

// BGM Volume Calibration & Loudness Normalization
// Âm lượng BGM: 0.10 trên điện thoại (đảm bảo loa điện thoại êm dịu, không gắt), 0.20 trên máy tính.
// Mỗi bài hát được chuẩn hóa gain (EBU R128 / RMS) dựa trên bản nhạc không lời Inazuma & Genshin OST
// giúp các bài hát thương mại (J-Pop / Anime) có âm lượng hoàn toàn đồng dạng với các bản không lời.
function getBgmBaseVolume() {
  return isMobileDevice() ? 0.10 : 0.20;
}

let volumeFadeTimer = null;

function getTrackTargetVolume(track) {
  const currentTrack = track || (getPlaylist()[currentTrackIndex]);
  const trackGain = (currentTrack && typeof currentTrack.gain === 'number') ? currentTrack.gain : 1.0;
  const baseVol = getBgmBaseVolume();
  return Math.max(0.01, Math.min(1.0, baseVol * trackGain));
}

function applyBgmVolume(smooth = false, track = null) {
  if (!bgAudio) return;

  const currentTrack = track || (getPlaylist()[currentTrackIndex]);
  const targetVol = getTrackTargetVolume(currentTrack);

  if (volumeFadeTimer) {
    clearInterval(volumeFadeTimer);
    volumeFadeTimer = null;
  }

  // On mobile devices, apply volume directly without setInterval to save CPU/battery
  if (!smooth || isMobileDevice()) {
    try { bgAudio.volume = targetVol; } catch (_) {}
    return;
  }

  // Smooth gentle fade-in ramp (200ms) on desktop starting strictly from 0 to prevent DAC pop or click
  const startVol = 0.0;
  try { bgAudio.volume = 0.0; } catch (_) {}
  const duration = 200;
  const steps = 10;
  const stepTime = duration / steps;
  const volInc = (targetVol - startVol) / steps;
  let currentStep = 0;

  volumeFadeTimer = setInterval(() => {
    currentStep++;
    if (!bgAudio) {
      clearInterval(volumeFadeTimer);
      return;
    }
    try {
      const nextVol = Math.min(targetVol, bgAudio.volume + volInc);
      bgAudio.volume = Math.max(0, Math.min(1, nextVol));
      if (currentStep >= steps || bgAudio.volume >= targetVol) {
        bgAudio.volume = targetVol;
        clearInterval(volumeFadeTimer);
        volumeFadeTimer = null;
      }
    } catch (_) {
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
  const pl = (typeof window !== 'undefined' && window.JPC_PLAYLIST) || (typeof JPC_PLAYLIST !== 'undefined' ? JPC_PLAYLIST : null);
  return (pl && Array.isArray(pl) && pl.length > 0)
    ? pl
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

  // Use requestAnimationFrame to prevent forced synchronous reflow / layout thrashing
  requestAnimationFrame(() => {
    if (wrap) wrap.classList.remove('has-marquee');
    if (track) {
      track.classList.remove('is-scrolling');
      track.style.removeProperty('--marquee-duration');
      track.style.transform = '';
    }
    if (clone) clone.textContent = '';

    const wrapWidth = wrap.clientWidth || 0;
    const titleWidth = title.scrollWidth || 0;

    // Chỉ kích hoạt marquee khi tiêu đề bài hát THỰC SỰ dài hơn chiều rộng khung hiển thị
    const shouldScroll = wrapWidth > 0 && titleWidth > (wrapWidth + 2);

    if (shouldScroll && title.textContent && title.textContent.trim().length > 0) {
      if (clone) clone.textContent = title.textContent;
      if (wrap) wrap.classList.add('has-marquee');

      // Pace: tốc độ trượt êm dịu (~20px/giây), tối thiểu 6 giây
      const measuredWidth = Math.max(titleWidth, 38);
      const itemDistance = measuredWidth + 36;
      const duration = Math.max(6, Math.round(itemDistance / 20));

      if (track) {
        track.style.setProperty('--marquee-duration', `${duration}s`);
        requestAnimationFrame(() => {
          track.classList.add('is-scrolling');
        });
      }
    }
  });
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

  // Measure title width and apply marquee
  setTimeout(updateTitleMarquee, 100);
  setTimeout(updateTitleMarquee, 600);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      updateTitleMarquee();
    });
  }

  // Recalculate marquee on window resize / mobile orientation change
  let marqueeResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(marqueeResizeTimer);
    marqueeResizeTimer = setTimeout(updateTitleMarquee, 120);
  }, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(updateTitleMarquee, 200);
  }, { passive: true });

  // Initialize single persistent DOM audio element (uninterrupted background playback)
  bgAudio = document.getElementById('jpcBgAudio');
  if (!bgAudio) {
    bgAudio = new Audio();
    bgAudio.id = 'jpcBgAudio';
    document.body.appendChild(bgAudio);
  }
  activeAudio = bgAudio;

  // Set calibrated background music volume
  try { bgAudio.volume = getTrackTargetVolume(initialTrack); } catch (_) {}
  bgAudio.preload = 'auto';

  // Load default opening track (Inazuma.m4a)
  bgAudio.src = encodeURI(initialTrack.src);
  bgAudio.load();

  // On desktop only: initialize lightweight preloader (avoid dual audio loading on mobile)
  if (!isMobileDevice()) {
    preloaderAudio = new Audio();
    preloaderAudio.preload = 'metadata';
    const preloadedTrack = playlist[nextPreloadedIndex];
    if (preloadedTrack) {
      preloaderAudio.src = encodeURI(preloadedTrack.src);
    }
  }

  // Continuous background playback: handle track ended on the same audio element (Auto-next)
  bgAudio.addEventListener('ended', () => {
    if (!isTrackSwitching) {
      playRandomTrack(false);
    }
  });

  // Watchdog: Tự động chuyển bài kế tiếp khi bài hiện tại phát hết (hỗ trợ cả khi sự kiện ended bị trễ)
  let lastTrackEndTime = 0;
  bgAudio.addEventListener('timeupdate', () => {
    if (
      Number.isFinite(bgAudio.duration) &&
      bgAudio.duration > 2 &&
      bgAudio.currentTime >= bgAudio.duration - 0.25 &&
      isMusicPlaying &&
      !isTrackSwitching
    ) {
      const now = Date.now();
      if (now - lastTrackEndTime > 4000) {
        lastTrackEndTime = now;
        playRandomTrack(false);
      }
    }
  });

  // Audio error fallback - with strict backoff and error cap to NEVER loop infinitely
  bgAudio.addEventListener('error', () => {
    if (!bgAudio.src || bgAudio.src === '' || bgAudio.src === window.location.href) return;
    if (bgAudio.error && bgAudio.error.code === MediaError.MEDIA_ERR_ABORTED) return;
    if (isTrackSwitching) return;

    consecutiveAudioErrors++;
    console.warn('[JPC Audio] Native error event on track', currentTrackIndex, bgAudio.error);
    if (consecutiveAudioErrors < 3) {
      setTimeout(() => {
        if (!isTrackSwitching) playRandomTrack(false);
      }, 800);
    } else {
      console.warn('[JPC Audio] Too many consecutive audio errors, stopping automatic retry.');
      pauseMusicPlayback();
      consecutiveAudioErrors = 0;
    }
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

  // Click CD disc -> toggle play/pause with 300ms throttle
  cdBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastCdClickTime < 300) return;
    lastCdClickTime = now;
    hasUserInteracted = true;
    unlockAudioContext();
    toggleMusicPlayback();
  });

  // Click shuffle button -> single throttled click handler (prevents mobile duplicate touchend/click)
  shuffleBtn.addEventListener('click', (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const now = Date.now();
    if (now - lastShuffleClickTime < 400) return;
    lastShuffleClickTime = now;
    hasUserInteracted = true;
    unlockAudioContext();
    playRandomTrack(true);
  });

  // Auto-play when hero intro completes
  window.addEventListener('heroIntroComplete', () => {
    isIntroAnimationFinished = true;
    startAutoPlay();
    updateTitleMarquee();
  });

  // Setup background audio unlock for genuine user gestures
  setupAudioUnlock();
}

const unlockEvents = [
  'click',
  'pointerdown',
  'touchend',
  'keydown'
];

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
  removeGlobalUnlockListeners();

  // Trigger music whenever autoplay is pending
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
  if (!isMusicPlaying) {
    startMusicPlayback();
  }
}

function startMusicPlayback() {
  if (!bgAudio) return;
  unlockAudioContext();
  updateTitleMarquee();

  const playerEl = document.getElementById('musicPlayer');
  isMusicPlaying = true;
  if (playerEl) {
    playerEl.classList.add('is-playing');
  }

  if (window.JPC3D && typeof window.JPC3D.pulse === 'function') {
    window.JPC3D.pulse(isMobileDevice() ? 1.05 : 1.3);
  }

  // Ensure current track is properly loaded if audio was in error state or empty
  const playlist = getPlaylist();
  const currentTrack = playlist[currentTrackIndex];
  if (currentTrack && (bgAudio.error || !bgAudio.src || bgAudio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE)) {
    bgAudio.src = encodeURI(currentTrack.src);
    bgAudio.load();
  }

  bgAudio.muted = false;
  applyBgmVolume(true, currentTrack);

  const playPromise = bgAudio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        pendingAutoPlay = false;
        consecutiveAudioErrors = 0;
        if (playerEl) {
          playerEl.classList.add('is-playing');
        }
        updateMediaSession(currentTrack);
        removeGlobalUnlockListeners();
      })
      .catch((err) => {
        // Normal interruption (e.g. track change or pause) -> Ignore!
        if (!err || err.name === 'AbortError') return;

        if (err.name === 'NotAllowedError') {
          // Browser autoplay restriction waiting for first user gesture
          pendingAutoPlay = true;
          isMusicPlaying = false;
          if (playerEl) {
            playerEl.classList.remove('is-playing');
          }
          if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';

          const triggerOnFirstTouch = () => {
            window.removeEventListener('pointerdown', triggerOnFirstTouch, { capture: true });
            window.removeEventListener('touchstart', triggerOnFirstTouch, { capture: true });
            window.removeEventListener('click', triggerOnFirstTouch, { capture: true });
            unlockAudioContext();
            startMusicPlayback();
          };
          window.addEventListener('pointerdown', triggerOnFirstTouch, { capture: true, once: true });
          window.addEventListener('touchstart', triggerOnFirstTouch, { capture: true, once: true });
          window.addEventListener('click', triggerOnFirstTouch, { capture: true, once: true });
        } else {
          // Genuine media error: safely try next track with retry cap
          console.warn('[JPC Audio] Playback error on start:', err.name, err.message);
          consecutiveAudioErrors++;
          if (consecutiveAudioErrors < 3) {
            setTimeout(() => {
              if (!isTrackSwitching) playRandomTrack(false);
            }, 600);
          }
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

  // Prevent overlapping track transitions
  if (isTrackSwitching) return;
  isTrackSwitching = true;

  const playerEl = document.getElementById('musicPlayer');
  const titleEl = document.getElementById('musicPlayerTitle');
  const shuffleBtn = document.getElementById('musicPlayerShuffleBtn');

  // Instant rotation pulse animation on shuffle button
  if (shuffleBtn && isManual) {
    shuffleBtn.style.transform = 'rotate(180deg) scale(1.15)';
    setTimeout(() => { if (shuffleBtn) shuffleBtn.style.transform = ''; }, 280);
  }

  if (window.JPC3D && typeof window.JPC3D.pulse === 'function') {
    window.JPC3D.pulse(isMobileDevice() ? 1.05 : 1.35);
  }

  // 1. Cleanly pause and release previous media decoder buffer from memory (critical for mobile WebKit)
  try {
    bgAudio.pause();
    bgAudio.removeAttribute('src');
    bgAudio.load();
  } catch (_) {}

  // 2. Select next track
  let targetIndex = nextPreloadedIndex;
  if (isManual || targetIndex === currentTrackIndex || playedTrackIndices.has(targetIndex)) {
    targetIndex = getNextRandomIndex(currentTrackIndex, playlist.length, isManual ? 0.0 : 0.2);
  }
  if (targetIndex === currentTrackIndex && playlist.length > 1) {
    targetIndex = (currentTrackIndex + 1) % playlist.length;
  }
  currentTrackIndex = targetIndex;
  playedTrackIndices.add(currentTrackIndex);
  const nowPlaying = playlist[currentTrackIndex];

  // 3. Update title UI smoothly
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

  // 4. Assign new source and play
  const targetSrc = encodeURI(nowPlaying.src);
  bgAudio.src = targetSrc;
  applyBgmVolume(false, nowPlaying);

  unlockAudioContext();
  isMusicPlaying = true;
  if (playerEl) playerEl.classList.add('is-playing');

  const playPromise = bgAudio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        pendingAutoPlay = false;
        consecutiveAudioErrors = 0;
        if (playerEl) {
          playerEl.classList.add('is-playing');
        }
        updateMediaSession(nowPlaying);
        removeGlobalUnlockListeners();
      })
      .catch((err) => {
        // Crucial fix: AbortError means track was changed again or playback was paused.
        // DO NOT treat as error or loop!
        if (!err || err.name === 'AbortError') return;

        if (err.name === 'NotAllowedError') {
          pendingAutoPlay = true;
          isMusicPlaying = false;
          if (playerEl) {
            playerEl.classList.remove('is-playing');
          }
          if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
        } else {
          console.warn('[JPC Audio] Track playback error:', err.name, err.message);
          consecutiveAudioErrors++;
          if (consecutiveAudioErrors < 3) {
            setTimeout(() => {
              if (!isTrackSwitching) playRandomTrack(false);
            }, 600);
          }
        }
      })
      .finally(() => {
        setTimeout(() => {
          isTrackSwitching = false;
        }, 180);
      });
  } else {
    setTimeout(() => {
      isTrackSwitching = false;
    }, 180);
  }

  // 5. In background on desktop ONLY, prepare next index
  if (!isMobileDevice()) {
    nextPreloadedIndex = getNextRandomIndex(currentTrackIndex, playlist.length, 0.2);
    const futureTrack = playlist[nextPreloadedIndex];
    if (futureTrack && preloaderAudio) {
      preloaderAudio.src = encodeURI(futureTrack.src);
    }
  }
}


