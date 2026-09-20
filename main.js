/**
 * JPC FTU — Modern ES Module Master Controller
 * -------------------------------------------------------------
 * Bundled via Node.js + Vite for high performance & GitHub Pages compatibility.
 * Integrates:
 * - Three.js WebGL Engine (with Post-Processing UnrealBloom & FXAA)
 * - GSAP & ScrollTrigger Animations
 * - Lenis Smooth Momentum Scrolling (Awwwards Grade)
 * - Canvas Confetti Fireworks & Interactive SFX
 */

import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import confetti from 'canvas-confetti';

// Export to window for global script interoperability
window.THREE = THREE;
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
window.Lenis = Lenis;
window.confetti = confetti;

gsap.registerPlugin(ScrollTrigger);

/**
 * 1. Initialize Lenis Smooth Scrolling Engine
 */
let lenis = null;
function initSmoothScroll() {
  try {
    // Detect mobile touch devices for adapted inertial parameters
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    lenis = new Lenis({
      duration: isTouch ? 0.9 : 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false
    });

    window.lenis = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Synchronize scroll depth with 3D camera parallax
    lenis.on('scroll', ({ scroll, limit }) => {
      const progress = limit > 0 ? scroll / limit : 0;
      if (window.JPC3D && typeof window.JPC3D.onScrollUpdate === 'function') {
        window.JPC3D.onScrollUpdate(progress, scroll);
      }
    });

    console.info('[JPC Web] Lenis Smooth Momentum Scroll initialized.');
  } catch (e) {
    console.warn('[JPC Web] Lenis initialization fallback:', e);
  }
}

/**
 * 2. Confetti Particle Fireworks Generator
 */
export function fireJapaneseConfetti(originX = 0.5, originY = 0.6) {
  try {
    // Traditional Japanese festive palette: Gold, Crimson Red, Sakura Pink, White Silk
    const colors = ['#eecd7e', '#d4af37', '#8a1c1c', '#b91c1c', '#f5b5c5', '#ffffff', '#ffd700'];

    confetti({
      particleCount: 80,
      angle: 60,
      spread: 65,
      origin: { x: originX - 0.1, y: originY },
      colors: colors,
      ticks: 200,
      gravity: 1.1,
      scalar: 1.1,
      shapes: ['circle', 'square']
    });

    confetti({
      particleCount: 80,
      angle: 120,
      spread: 65,
      origin: { x: originX + 0.1, y: originY },
      colors: colors,
      ticks: 200,
      gravity: 1.1,
      scalar: 1.1,
      shapes: ['circle', 'square']
    });
  } catch (_) {}
}
window.fireJapaneseConfetti = fireJapaneseConfetti;

/**
 * 3. 3D Magnetic Card Hover Physics
 */
function init3DCardHoverPhysics() {
  const cards = document.querySelectorAll('.about__card, .dept__card, .journey__step, .join__card, .timeline__item');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        scale: 1.02,
        duration: 0.35,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1.0,
        duration: 0.6,
        ease: 'power3.out'
      });
    });
  });

  // Attach celebratory confetti to CTA buttons
  const ctaButtons = document.querySelectorAll('.join__cta, .hero__badge, a[href="#join"]');
  ctaButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;
      fireJapaneseConfetti(originX, originY);
      if (window.JPC3D && typeof window.JPC3D.pulse === 'function') {
        window.JPC3D.pulse(1.4);
      }
    });
  });
}

/**
 * 4. Bootstrapping Orchestrator
 */
function bootstrapApp() {
  initSmoothScroll();
  init3DCardHoverPhysics();
  console.info('[JPC Web] 3D Animation & Interactive Core Online (Node.js + Vite Ready).');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}

// Import subordinate modules (Three.js Scene, Playlist, Application Scripts)
import './three-scene.js';
import './playlist.js';
import './script.js';
