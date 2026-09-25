/**
 * JPC FTU — 3D Graphics & Animation Engine (Three.js + GSAP + UnrealBloom Post-Processing)
 * -----------------------------------------------------------------------------------------
 * Features:
 * - Ultra-Realistic Human Hand Anatomy & Authentic Finger-Snap Biomechanics
 * - UnrealBloomPass Post-Processing: Cinematic golden bloom glow on emissive meshes & shockwaves
 * - 3D Volumetric Sakura & Golden Stardust Particle Simulations
 * - Lenis Smooth Scroll Camera Parallax & Depth Sync
 * - Dual ES Module & Global Window Interoperability (Vite + Static + GitHub Pages)
 */

import * as THREE_MODULE from 'three';
import { OrbitControls as OrbitControlsModule } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader as GLTFLoaderModule } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer as EffectComposerModule } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass as RenderPassModule } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass as UnrealBloomPassModule } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass as OutputPassModule } from 'three/examples/jsm/postprocessing/OutputPass.js';
import gsapModule from 'gsap';

// Resolve Module or Global Fallback
const THREE = typeof THREE_MODULE !== 'undefined' ? THREE_MODULE : window.THREE;
const OrbitControls = typeof OrbitControlsModule !== 'undefined' ? OrbitControlsModule : (THREE ? THREE.OrbitControls : null);
const GLTFLoader = typeof GLTFLoaderModule !== 'undefined' ? GLTFLoaderModule : (THREE ? THREE.GLTFLoader : null);
const EffectComposer = typeof EffectComposerModule !== 'undefined' ? EffectComposerModule : (THREE ? THREE.EffectComposer : null);
const RenderPass = typeof RenderPassModule !== 'undefined' ? RenderPassModule : (THREE ? THREE.RenderPass : null);
const UnrealBloomPass = typeof UnrealBloomPassModule !== 'undefined' ? UnrealBloomPassModule : (THREE ? THREE.UnrealBloomPass : null);
const OutputPass = typeof OutputPassModule !== 'undefined' ? OutputPassModule : (THREE ? THREE.OutputPass : null);
const gsap = typeof gsapModule !== 'undefined' ? gsapModule : window.gsap;

(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    console.warn('[JPC 3D] Three.js library not detected.');
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('is-loading');
    }
    return;
  }

  // Configuration Tokens
  const CONFIG = {
    canvasId: 'threeCanvas',
    gloveColor: 0x222432,
    accentRed: 0xff1e46,
    goldLight: 0xf6d382,
    particleCount: window.innerWidth <= 768 ? 55 : 105,
    bloomStrength: 0.52,
    bloomRadius: 0.40,
    bloomThreshold: 0.32
  };

  // Core Engine State
  let canvas, renderer, scene, camera, controls;
  let composer = null, bloomPass = null;
  let mainGroup, particleSystem;
  let cardRainGroup, cardRainData = [];
  let humanHandGroup, handFingers = {}, wristMesh;
  let handBackAuraMesh, crimsonAuraMaterialRef;
  let vortexGroup, sovereignRingMesh, waterRippleMesh, waterRippleEchoMesh, anamorphicFlareMesh, sovereignEmbersGroup;
  let isCardRainLooping = false;
  let sovereignEmberData = [];
  let goldLight, rimLight, ambientLight, snapFlashLight, skinFillLight;
  let animationFrameId = null;
  let isRunning = false;
  let isIntroPlaying = false;
  let introStartTime = 0;
  const introDuration = 2.5; // seconds (shortened pose hold per user request)
  let hasSnapped = false;
  let onSnapCallback = null;
  let onIntroCompleteCallback = null;
  let pendingIntroCall = null;
  let cameraRecoilZ = 0;
  const clock = new THREE.Clock();

  // 1. Anatomical Resting Finger Curvature (Directly matching reference images 2 & 3)
  const ANATOMICAL_REST_POSE = {
    index:  { p1X: 0.22, p2X: 0.26, p3X: 0.16, rootZ: -0.06 },
    middle: { p1X: 0.30, p2X: 0.38, p3X: 0.20, rootZ:  0.00 },
    ring:   { p1X: 0.40, p2X: 0.48, p3X: 0.24, rootZ:  0.06 },
    pinky:  { p1X: 0.48, p2X: 0.58, p3X: 0.28, rootZ:  0.13 },
    thumb:  { p1X: 0.24, p1Z: 0.32, p2X: 0.18 },
    hand:   { rotX: -0.16, rotY: 0.38, rotZ: -0.10 }
  };

  // 2. High-Tension Stance Pose (Middle finger pad locked firmly against thumb pad, index poised)
  const TENSION_POSE = {
    index:  { p1X: 0.18, p2X: 0.22, p3X: 0.14, rootZ: -0.14 },
    middle: { p1X: 1.44, p2X: 1.50, p3X: 0.78, rootZ: -0.10 },
    ring:   { p1X: 1.62, p2X: 1.68, p3X: 1.05, rootZ:  0.06 },
    pinky:  { p1X: 1.68, p2X: 1.72, p3X: 1.10, rootZ:  0.13 },
    thumb:  { p1X: 0.72, p1Z: -0.52, p2X: 0.40 },
    hand:   { rotX: -0.28, rotY: 0.48, rotZ: -0.16 }
  };

  // 3. Post-Snap Impact Pose (Middle finger snapped onto thenar eminence, thumb flicked open)
  const IMPACT_POSE = {
    index:  { p1X: 0.22, p2X: 0.25, p3X: 0.16, rootZ: -0.14 },
    middle: { p1X: 2.02, p2X: 1.90, p3X: 1.12, rootZ:  0.02 },
    ring:   { p1X: 1.64, p2X: 1.70, p3X: 1.06, rootZ:  0.06 },
    pinky:  { p1X: 1.70, p2X: 1.74, p3X: 1.12, rootZ:  0.13 },
    thumb:  { p1X: 0.34, p1Z: 0.68, p2X: 0.10 },
    hand:   { rotX: -0.22, rotY: 0.44, rotZ: -0.10 }
  };

  function applyAnatomicalRestPose() {
    if (!handFingers.index) return;
    handFingers.index.p1.rotation.x = ANATOMICAL_REST_POSE.index.p1X;
    handFingers.index.p2.rotation.x = ANATOMICAL_REST_POSE.index.p2X;
    handFingers.index.p3.rotation.x = ANATOMICAL_REST_POSE.index.p3X;
    handFingers.index.root.rotation.z = ANATOMICAL_REST_POSE.index.rootZ;

    handFingers.middle.p1.rotation.x = ANATOMICAL_REST_POSE.middle.p1X;
    handFingers.middle.p2.rotation.x = ANATOMICAL_REST_POSE.middle.p2X;
    handFingers.middle.p3.rotation.x = ANATOMICAL_REST_POSE.middle.p3X;
    handFingers.middle.root.rotation.z = ANATOMICAL_REST_POSE.middle.rootZ;

    handFingers.ring.p1.rotation.x = ANATOMICAL_REST_POSE.ring.p1X;
    handFingers.ring.p2.rotation.x = ANATOMICAL_REST_POSE.ring.p2X;
    handFingers.ring.p3.rotation.x = ANATOMICAL_REST_POSE.ring.p3X;
    handFingers.ring.root.rotation.z = ANATOMICAL_REST_POSE.ring.rootZ;

    handFingers.pinky.p1.rotation.x = ANATOMICAL_REST_POSE.pinky.p1X;
    handFingers.pinky.p2.rotation.x = ANATOMICAL_REST_POSE.pinky.p2X;
    handFingers.pinky.p3.rotation.x = ANATOMICAL_REST_POSE.pinky.p3X;
    handFingers.pinky.root.rotation.z = ANATOMICAL_REST_POSE.pinky.rootZ;

    handFingers.thumb.p1.rotation.x = ANATOMICAL_REST_POSE.thumb.p1X;
    handFingers.thumb.p1.rotation.z = ANATOMICAL_REST_POSE.thumb.p1Z;
    handFingers.thumb.p2.rotation.x = ANATOMICAL_REST_POSE.thumb.p2X;
  }

  // Mouse & Parallax State
  const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    ease: 0.045
  };

  // Scroll Parallax State
  const scrollState = {
    progress: 0,
    scrollY: 0,
    targetProgress: 0
  };

  let particleData = [];
  let vortexShards = [];

  // Smooth easing helpers
  function smoothstep(min, max, value) {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  /**
   * 1. INITIALIZATION
   */
  function init() {
    canvas = document.getElementById(CONFIG.canvasId);
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = CONFIG.canvasId;
      canvas.className = 'three-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.prepend(canvas);
    }

    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        precision: 'highp'
      });
    } catch (e) {
      console.warn('[JPC 3D] WebGL not supported:', e);
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.remove('is-loading');
      }
      return;
    }

    const maxPR = (window.innerWidth <= 768) ? 1.15 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPR));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    if (renderer.outputEncoding) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }

    scene = new THREE.Scene();
    
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(0, 0, 14);

    mainGroup = new THREE.Group();
    scene.add(mainGroup);

    setupLighting();
    createCardRainSystem();
    createSakuraAndDustParticles();
    createRealisticHumanHandAndVortex();
    setupPostProcessing();
    bindEvents();

    startAnimationLoop();

    if (pendingIntroCall) {
      startIntroTimeline(pendingIntroCall.onSnap, pendingIntroCall.onComplete);
      pendingIntroCall = null;
    } else {
      startAmbientCardRain();
    }

    console.info('[JPC 3D] Authentic Bio-Kinematic Hand & UnrealBloom 3D Engine ready.');
  }

  /**
   * 2. POST-PROCESSING PIPELINE (Cinematic Golden UnrealBloom)
   */
  function setupPostProcessing() {
    if (!EffectComposer || !RenderPass || !UnrealBloomPass) {
      console.info('[JPC 3D] Post-processing passes not loaded, running direct WebGL rendering.');
      return;
    }

    try {
      const renderPass = new RenderPass(scene, camera);
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      const resolution = new THREE.Vector2(width, height);

      bloomPass = new UnrealBloomPass(
        resolution,
        CONFIG.bloomStrength,
        CONFIG.bloomRadius,
        CONFIG.bloomThreshold
      );

      composer = new EffectComposer(renderer);
      composer.addPass(renderPass);
      composer.addPass(bloomPass);

      if (OutputPass) {
        const outputPass = new OutputPass();
        composer.addPass(outputPass);
      }

      console.info('[JPC 3D] Cinematic UnrealBloom post-processing active.');
    } catch (e) {
      console.warn('[JPC 3D] Could not initialize EffectComposer, falling back to direct render:', e);
      composer = null;
    }
  }

  /**
   * 3. LIGHTING RIG
   */
  let globalCardTexture = null;

  function setupLighting() {
    // Clean, rich ambient light so dark glove details don't crush to pitch black
    ambientLight = new THREE.AmbientLight(0x403440, 1.25);
    scene.add(ambientLight);

    // Warm champagne studio key light shining directly on hand & fingers
    goldLight = new THREE.DirectionalLight(0xffeedd, 3.2);
    goldLight.position.set(3.2, 4.8, 7.2);
    scene.add(goldLight);

    // Refined Crimson Silhouette Rim Light from back-left (softened so aura is clean without harsh glare)
    rimLight = new THREE.PointLight(0xff2855, 4.8, 32, 1.2);
    rimLight.position.set(-3.5, 1.8, 2.5);
    scene.add(rimLight);

    // Secondary Rose-Violet Rim Light from back-right
    const rimRight = new THREE.PointLight(0xff5588, 2.6, 25, 1.3);
    rimRight.position.set(3.4, 2.0, 1.8);
    scene.add(rimRight);

    // Rose studio fill light to sculpt anatomical palm & finger muscles
    skinFillLight = new THREE.DirectionalLight(0xffbcc8, 1.4);
    skinFillLight.position.set(1.2, 2.2, 6.5);
    scene.add(skinFillLight);

    // Snap flash light: deep blood-crimson pulse
    snapFlashLight = new THREE.PointLight(0xcc1436, 0, 48, 2);
    snapFlashLight.position.set(0, 0, 4);
    scene.add(snapFlashLight);
  }

  /**
   * 4. 3D CARD RAIN SYSTEM (Mưa bài 3D rơi xuống khi búng tay)
   */
  function createCardRainSystem() {
    cardRainGroup = new THREE.Group();
    cardRainData = [];

    const cardGeo = new THREE.PlaneGeometry(0.52, 0.78);

    // Canvas texture for traditional Japanese JPC playing cards
    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 256;
    cardCanvas.height = 384;
    const cCtx = cardCanvas.getContext('2d');
    
    // Crimson lacquered back with soft pink inner glow
    const cardGrad = cCtx.createLinearGradient(0, 0, 256, 384);
    cardGrad.addColorStop(0.00, '#b8263e');
    cardGrad.addColorStop(0.45, '#781220');
    cardGrad.addColorStop(1.00, '#26040a');
    cCtx.fillStyle = cardGrad;
    cCtx.fillRect(0, 0, 256, 384);

    // Gold foil double border
    cCtx.strokeStyle = '#ffd778';
    cCtx.lineWidth = 5;
    cCtx.strokeRect(10, 10, 236, 364);
    cCtx.strokeStyle = '#ffb7c5';
    cCtx.lineWidth = 2;
    cCtx.strokeRect(18, 18, 220, 348);

    // Four corner sakura accents
    const corners = [[32, 32], [224, 32], [32, 352], [224, 352]];
    cCtx.fillStyle = '#ffb7c5';
    corners.forEach(([cx, cy]) => {
      cCtx.beginPath();
      cCtx.arc(cx, cy, 6, 0, Math.PI * 2);
      cCtx.fill();
    });

    // Golden Japanese Sakura flower crest in center
    cCtx.fillStyle = '#ffd778';
    const centerX = 128, centerY = 192;
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2 - Math.PI / 2;
      const px = centerX + Math.cos(angle) * 36;
      const py = centerY + Math.sin(angle) * 36;
      cCtx.beginPath();
      cCtx.arc(px, py, 22, 0, Math.PI * 2);
      cCtx.fill();
    }
    // Inner ruby center
    cCtx.fillStyle = '#8a1220';
    cCtx.beginPath();
    cCtx.arc(centerX, centerY, 16, 0, Math.PI * 2);
    cCtx.fill();

    const cardTexture = new THREE.CanvasTexture(cardCanvas);
    cardTexture.minFilter = THREE.LinearFilter;
    cardTexture.generateMipmaps = false;
    globalCardTexture = cardTexture;

    const cardMaterial = new THREE.MeshStandardMaterial({
      map: cardTexture,
      side: THREE.DoubleSide,
      transparent: true,
      roughness: 0.35,
      metalness: 0.25,
      opacity: 0.95
    });

    const rainCount = 45;
    for (let i = 0; i < rainCount; i++) {
      const mesh = new THREE.Mesh(cardGeo, cardMaterial.clone());
      mesh.visible = false;
      cardRainGroup.add(mesh);

      cardRainData.push({
        mesh,
        initX: (Math.random() - 0.5) * 16,
        initY: 6 + Math.random() * 8,
        initZ: 2 + (Math.random() - 0.5) * 6,
        vy: -(0.07 + Math.random() * 0.08),
        vx: (Math.random() - 0.5) * 0.035,
        vz: (Math.random() - 0.5) * 0.02,
        rotSpeedX: (Math.random() - 0.5) * 0.08,
        rotSpeedY: (Math.random() - 0.5) * 0.09,
        rotSpeedZ: (Math.random() - 0.5) * 0.06,
        flutterSpeed: 2.2 + Math.random() * 3.0,
        flutterPhase: Math.random() * Math.PI * 2,
        active: false
      });
    }

    cardRainGroup.visible = false;
    mainGroup.add(cardRainGroup);
  }

  function triggerCardRain() {
    if (!cardRainGroup) return;
    cardRainGroup.visible = true;

    for (let i = 0; i < cardRainData.length; i++) {
      const c = cardRainData[i];
      c.mesh.position.set(c.initX, c.initY, c.initZ);
      c.mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
      c.baseOpacity = 0.95;
      c.mesh.material.opacity = 0.95;
      c.mesh.visible = true;
      c.active = true;
    }
  }

  function startAmbientCardRain() {
    if (!cardRainGroup) return;
    cardRainGroup.visible = true;
    isCardRainLooping = true;
    for (let i = 0; i < cardRainData.length; i++) {
      const c = cardRainData[i];
      if (!c.active) {
        c.mesh.position.set(
          (Math.random() - 0.5) * 18,
          -7 + Math.random() * 16,
          2 + (Math.random() - 0.5) * 6
        );
        c.mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
        c.baseOpacity = 0.88;
        c.mesh.material.opacity = 0.88;
        c.mesh.visible = true;
        c.active = true;
        c.vy = -(0.016 + Math.random() * 0.022);
      }
    }
  }

  /**
   * 5. ANIME FEMALE GLOVE & STILETTO CLAW MATERIALS ENGINE (ARLECCHINO AESTHETIC)
   */
  function createAnimeCelMaterials() {
    // 5.1 4-Step Discrete Quantized Anime Cel Gradient Ramp for Obsidian Black Glove
    const rampCanvas = document.createElement('canvas');
    rampCanvas.width = 4;
    rampCanvas.height = 1;
    const rCtx = rampCanvas.getContext('2d');
    
    // Cel color steps: [Deep Inky Void, Charcoal Black, Dark Burgundy Slate, Subtle Crimson Edge]
    const animeColors = ['#0c0d14', '#161922', '#222634', '#3c2530'];
    for (let i = 0; i < 4; i++) {
      rCtx.fillStyle = animeColors[i];
      rCtx.fillRect(i, 0, 1, 1);
    }

    const gradientMap = new THREE.CanvasTexture(rampCanvas);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.generateMipmaps = false;

    // 5.2 Deep Manga Ink Contour Outline Material (Inverted Hull)
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x07080e,
      side: THREE.BackSide
    });

    // 5.2b Translucent Deep Crimson Edge Material - used only on subtle accents, NOT stacked additive
    const crimsonAuraMaterial = new THREE.MeshBasicMaterial({
      color: 0x940c20,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.28,
      depthWrite: false
    });
    crimsonAuraMaterialRef = crimsonAuraMaterial;

    // 5.3 Anime Dark Leather/Fabric Glove Material (Arlecchino Midnight Obsidian with subtle crimson undertone)
    const animeGloveMaterial = new THREE.MeshToonMaterial({
      color: 0x261e2a,
      gradientMap: gradientMap,
      emissive: 0x420c18,
      emissiveIntensity: 0.24
    });

    // 5.4 Anime Glove Palmar Material (Sleek dark glove palm with anatomical muscle definition)
    const animeGlovePalmMaterial = new THREE.MeshToonMaterial({
      color: 0x201824,
      gradientMap: gradientMap,
      emissive: 0x360914,
      emissiveIntensity: 0.20
    });

    // 5.5 High-Gloss Silver Jewelry Material (Rings & Diamond filigree)
    const silverJewelryMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8ecf2,
      emissive: 0x1a1d24,
      emissiveIntensity: 0.18,
      roughness: 0.12,
      metalness: 0.96
    });

    // 5.6 Obsidian Glossy Stiletto Claw Material (Thumb, Middle, Ring, Pinky)
    const obsidianClawMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c0e15,
      emissive: 0x160408,
      emissiveIntensity: 0.16,
      roughness: 0.10,
      metalness: 0.92
    });

    // 5.7 Arlecchino's Signature Blood-Crimson Stiletto Claw (Index Finger Highlight)
    const crimsonClawMaterial = new THREE.MeshStandardMaterial({
      color: 0xd61234,
      emissive: 0xb80c26,
      emissiveIntensity: 0.95,
      roughness: 0.12,
      metalness: 0.70
    });

    // 5.8 Forearm Gothic Diamond Argyle Pattern (Arlecchino Sleeve Reference)
    const sleeveCanvas = document.createElement('canvas');
    sleeveCanvas.width = 512;
    sleeveCanvas.height = 512;
    const sCtx = sleeveCanvas.getContext('2d');

    // Deep charcoal base with subtle warm undertone
    sCtx.fillStyle = '#1a1d28';
    sCtx.fillRect(0, 0, 512, 512);

    // Cross-hatching argyle diamond lattice bands
    const step = 64;
    sCtx.lineWidth = 5.0;
    sCtx.strokeStyle = '#0a0d16'; // Deep inky seams
    for (let x = -512; x < 1024; x += step) {
      sCtx.beginPath();
      sCtx.moveTo(x, 0);
      sCtx.lineTo(x + 512, 512);
      sCtx.stroke();
    }
    for (let x = -512; x < 1024; x += step) {
      sCtx.beginPath();
      sCtx.moveTo(x, 512);
      sCtx.lineTo(x + 512, 0);
      sCtx.stroke();
    }

    // Secondary vibrant crimson gothic pinstripes
    sCtx.lineWidth = 2.0;
    sCtx.strokeStyle = 'rgba(235, 40, 75, 0.65)';
    for (let x = -512; x < 1024; x += step) {
      sCtx.beginPath();
      sCtx.moveTo(x + 2, 0);
      sCtx.lineTo(x + 514, 512);
      sCtx.stroke();
    }

    // Inner diamond core accents
    sCtx.fillStyle = '#262a3a';
    for (let y = 0; y < 512; y += step) {
      for (let x = 0; x < 512; x += step) {
        sCtx.beginPath();
        sCtx.moveTo(x + step / 2, y + 16);
        sCtx.lineTo(x + step - 16, y + step / 2);
        sCtx.lineTo(x + step / 2, y + step - 16);
        sCtx.lineTo(x + 16, y + step / 2);
        sCtx.closePath();
        sCtx.fill();
      }
    }

    const forearmDiamondTex = new THREE.CanvasTexture(sleeveCanvas);
    forearmDiamondTex.wrapS = THREE.RepeatWrapping;
    forearmDiamondTex.wrapT = THREE.RepeatWrapping;
    forearmDiamondTex.repeat.set(2, 4);

    const forearmGloveMaterial = new THREE.MeshToonMaterial({
      color: 0x282030,
      map: forearmDiamondTex,
      gradientMap: gradientMap,
      emissive: 0x450f1a,
      emissiveIntensity: 0.32,
      roughness: 0.32
    });

    return {
      animeGloveMaterial,
      forearmGloveMaterial,
      animeGlovePalmMaterial,
      silverJewelryMaterial,
      obsidianClawMaterial,
      crimsonClawMaterial,
      outlineMaterial,
      crimsonAuraMaterial
    };
  }

  /**
   * Helper: Attach Inverted Hull Anime Line-Art Outline
   */
  function buildAnimeMesh(geometry, fillMaterial, outlineMaterial, outlineScale = 1.022) {
    const group = new THREE.Group();
    const fillMesh = new THREE.Mesh(geometry, fillMaterial);
    group.add(fillMesh);

    if (outlineMaterial) {
      const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
      outlineMesh.scale.set(outlineScale, outlineScale, outlineScale);
      group.add(outlineMesh);
    }

    return { group, fillMesh };
  }

  /**
   * Helper: Curved Razor-Sharp Stiletto Claw Builder
   */
  function createAnimeStilettoClaw(baseRadius, length, clawMaterial, outlineMat) {
    const group = new THREE.Group();
    const curvePoints = [];
    const segments = 16;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = t * length;
      // Slender lethal curve: needle-sharp tip
      const r = baseRadius * Math.pow(1.0 - t, 1.35);
      curvePoints.push(new THREE.Vector2(r, y));
    }
    const clawGeo = new THREE.LatheGeometry(curvePoints, 18);
    clawGeo.computeVertexNormals();

    const clawMesh = new THREE.Mesh(clawGeo, clawMaterial);
    clawMesh.rotation.x = -0.15;
    clawMesh.position.set(0, 0, -baseRadius * 0.08);
    group.add(clawMesh);

    if (outlineMat) {
      const outMesh = new THREE.Mesh(clawGeo, outlineMat);
      outMesh.scale.set(1.035, 1.025, 1.035);
      outMesh.rotation.x = -0.15;
      outMesh.position.set(0, 0, -baseRadius * 0.08);
      group.add(outMesh);
    }

    return group;
  }

  /**
   * 6. ANIME FEMALE GLOVE HAND (AUTHENTIC ARLECCHINO GOTHIC AESTHETIC) & SOVEREIGN VFX
   * Precision-modeled after the user's reference image:
   * - Long slender gothic forearm with diamond argyle cross-hatching lattice pattern
   * - Slender, aristocratic, elongated palm (no chunky swollen spheres)
   * - Long, needle-sharp stiletto digits with double silver rings on proximal knuckles
   * - Lethal Blood-Crimson Red index claw with intense emissive glow
   * - Pitch-black obsidian glossy claws for other fingers
   * - Sovereign Snap VFX: Anamorphic Crimson Slash Flare, Razor Shockwave & Dark Crystal Embers
   */
  function createRealisticHumanHandAndVortex() {
    humanHandGroup = new THREE.Group();
    // Positioned in aesthetic 3/4 posture matching reference hand presence
    humanHandGroup.position.set(0.12, -0.32, 3.8);
    humanHandGroup.rotation.set(-0.16, 0.38, -0.10);
    humanHandGroup.scale.set(1.30, 1.30, 1.30);
    humanHandGroup.visible = false;

    const {
      animeGloveMaterial,
      forearmGloveMaterial,
      animeGlovePalmMaterial,
      silverJewelryMaterial,
      obsidianClawMaterial,
      crimsonClawMaterial,
      outlineMaterial,
      crimsonAuraMaterial
    } = createAnimeCelMaterials();

    // 6.1 Unified Continuous Anatomical Arm, Wrist & Palm Geometry (Zero Roblox seams!)
    function createSeamlessArmAndPalmGeometry() {
      const geo = new THREE.BufferGeometry();
      const numSlices = 38;
      const numRadial = 48;
      const positions = [];
      const uvs = [];
      const indices = [];

      const forearmSplitSlice = 22; // Boundary between forearm texture and palm glove

      for (let s = 0; s < numSlices; s++) {
        const v = s / (numSlices - 1);
        // y from -2.4 (base of forearm) to +0.86 (metacarpal knuckle arch)
        const y = -2.4 + v * 3.26;

        let rx, rz, cx = 0, cz = 0;

        if (y < -0.45) {
          // Forearm region: smooth athletic taper from base to wrist
          const armT = (y + 2.4) / 1.95; // 0 at base, 1 at wrist
          rx = THREE.MathUtils.lerp(0.46, 0.29, Math.pow(armT, 0.82));
          rz = THREE.MathUtils.lerp(0.44, 0.20, Math.pow(armT, 0.82));
          cx = Math.sin(armT * Math.PI) * 0.022;
          cz = -Math.sin(armT * Math.PI) * 0.012;
        } else if (y < -0.08) {
          // Carpal Wrist: slender, elegant, continuous transition
          const wristT = (y + 0.45) / 0.37;
          rx = THREE.MathUtils.lerp(0.29, 0.37, wristT);
          rz = THREE.MathUtils.lerp(0.20, 0.21, wristT);
          cx = 0.01;
          cz = 0;
        } else {
          // Palm region: flares smoothly towards knuckles
          const palmT = (y + 0.08) / 0.94;
          rx = THREE.MathUtils.lerp(0.37, 0.48, Math.pow(palmT, 0.72));
          rz = THREE.MathUtils.lerp(0.21, 0.15, palmT);
          cx = THREE.MathUtils.lerp(0.01, 0.02, palmT);
          cz = THREE.MathUtils.lerp(0.0, -0.015, palmT);
        }

        for (let r = 0; r < numRadial; r++) {
          const u = r / numRadial;
          const theta = u * Math.PI * 2;
          let px = Math.cos(theta) * rx + cx;
          let pz = Math.sin(theta) * rz + cz;
          let py = y;

          // Sculpt organic anatomical contours into the palm region
          if (y >= -0.08) {
            const palmT = (y + 0.08) / 0.94;

            // 1. Thenar Eminence (Thumb muscle ball on thumb-palmar side: px < 0, pz > 0)
            if (px < -0.05 && pz > 0 && palmT < 0.65) {
              const thenarDistX = Math.abs(px + 0.26) / 0.26;
              const thenarDistY = Math.abs(palmT - 0.30) / 0.28;
              if (thenarDistX < 1.0 && thenarDistY < 1.0) {
                const thenarStrength = Math.cos(thenarDistX * Math.PI * 0.5) * Math.cos(thenarDistY * Math.PI * 0.5);
                pz += thenarStrength * 0.10;
                px -= thenarStrength * 0.055;
              }
            }

            // 2. Hypothenar Eminence (Pinky side muscle pad: px > 0.10, pz > 0)
            if (px > 0.10 && pz > 0 && palmT < 0.55) {
              const hypoDistX = Math.abs(px - 0.28) / 0.22;
              const hypoDistY = Math.abs(palmT - 0.28) / 0.25;
              if (hypoDistX < 1.0 && hypoDistY < 1.0) {
                const hypoStrength = Math.cos(hypoDistX * Math.PI * 0.5) * Math.cos(hypoDistY * Math.PI * 0.5);
                pz += hypoStrength * 0.045;
              }
            }

            // 3. Palm Hollow (Lòng bàn tay cupped depression)
            if (Math.abs(px) < 0.12 && pz > 0.02 && palmT > 0.15 && palmT < 0.75) {
              const cupStrength = Math.cos((px / 0.12) * Math.PI * 0.5) * Math.sin(((palmT - 0.15) / 0.60) * Math.PI);
              pz -= cupStrength * 0.038;
            }

            // 4. Metacarpal Knuckle Arch height curvature
            if (palmT > 0.65) {
              const archT = (palmT - 0.65) / 0.35;
              const knuckleYOffset = Math.sin((px + 0.46) / 0.92 * Math.PI) * 0.07 * archT;
              py += knuckleYOffset;
            }
          }

          positions.push(px, py, pz);
          uvs.push(u, v * 3.0);
        }
      }

      for (let s = 0; s < numSlices - 1; s++) {
        for (let r = 0; r < numRadial; r++) {
          const nextR = (r + 1) % numRadial;
          const i0 = s * numRadial + r;
          const i1 = s * numRadial + nextR;
          const i2 = (s + 1) * numRadial + nextR;
          const i3 = (s + 1) * numRadial + r;

          indices.push(i0, i1, i2);
          indices.push(i0, i2, i3);
        }
      }

      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);

      // Define multi-material groups for seamless normal continuation:
      // Group 0: Forearm argyle diamond lattice
      const forearmIndexCount = forearmSplitSlice * numRadial * 6;
      geo.addGroup(0, forearmIndexCount, 0);
      // Group 1: Palm midnight obsidian glove
      const palmIndexCount = indices.length - forearmIndexCount;
      geo.addGroup(forearmIndexCount, palmIndexCount, 1);

      geo.computeVertexNormals();
      return geo;
    }

    const armPalmGeo = createSeamlessArmAndPalmGeometry();
    const armPalmMesh = new THREE.Mesh(armPalmGeo, [forearmGloveMaterial, animeGlovePalmMaterial]);
    wristMesh = armPalmMesh;
    humanHandGroup.add(armPalmMesh);

    // Anatomical base cut cap and sleek silver rim
    const cutCapGeo = new THREE.CircleGeometry(0.46, 32);
    const cutCapMesh = new THREE.Mesh(cutCapGeo, animeGloveMaterial);
    cutCapMesh.rotation.x = Math.PI / 2;
    cutCapMesh.position.set(0, -2.4, 0);
    humanHandGroup.add(cutCapMesh);

    const cutRimGeo = new THREE.TorusGeometry(0.46, 0.018, 8, 32);
    const cutRimMesh = new THREE.Mesh(cutRimGeo, silverJewelryMaterial);
    cutRimMesh.rotation.x = Math.PI / 2;
    cutRimMesh.position.set(0, -2.4, 0);
    humanHandGroup.add(cutRimMesh);

    // Iconic Geometric Diamond Motif on Dorsal Hand (Back of hand)
    const dorsalDiamondShape = new THREE.Shape();
    dorsalDiamondShape.moveTo(0, 0.48);
    dorsalDiamondShape.lineTo(0.25, 0.10);
    dorsalDiamondShape.lineTo(0, -0.36);
    dorsalDiamondShape.lineTo(-0.25, 0.10);
    dorsalDiamondShape.closePath();

    const innerHole = new THREE.Path();
    innerHole.moveTo(0, 0.36);
    innerHole.lineTo(0.18, 0.10);
    innerHole.lineTo(0, -0.26);
    innerHole.lineTo(-0.18, 0.10);
    innerHole.closePath();
    dorsalDiamondShape.holes.push(innerHole);

    const dorsalDiamondGeo = new THREE.ShapeGeometry(dorsalDiamondShape);
    const dorsalMesh = new THREE.Mesh(dorsalDiamondGeo, silverJewelryMaterial);
    dorsalMesh.position.set(0.02, 0.22, -0.14);
    dorsalMesh.rotation.y = Math.PI;
    dorsalMesh.scale.set(0.80, 0.80, 1);
    humanHandGroup.add(dorsalMesh);

    // 6.3 Organic Phalanx Builder (Seamless nested profile, NO Roblox ball joints!)
    function createOrganicPhalanx(radBase, radTip, length, isTip, isIndexClaw = false) {
      const group = new THREE.Group();

      const points = [];
      const segments = 16;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = t * length;
        const waist = Math.sin(t * Math.PI) * 0.055;
        let r = THREE.MathUtils.lerp(radBase, radTip, t) * (1.0 - waist);
        // Soft rounded proximal dome at base (t < 0.15) to sleeve smoothly into parent joint
        if (t < 0.15) {
          const capT = t / 0.15;
          r = radBase * (0.85 + 0.15 * Math.sin(capT * Math.PI * 0.5));
        }
        points.push(new THREE.Vector2(Math.max(0.002, r), y));
      }

      const latheGeo = new THREE.LatheGeometry(points, 20);
      latheGeo.computeVertexNormals();
      const phalanxMesh = new THREE.Mesh(latheGeo, animeGloveMaterial);
      group.add(phalanxMesh);

      // Fingertip & Deadly Stiletto Claw (Connected directly without separate sphere joints)
      if (isTip) {
        const clawMat = isIndexClaw ? crimsonClawMaterial : obsidianClawMaterial;
        const clawLen = length * (isIndexClaw ? 0.98 : 0.85);
        const stilettoClaw = createAnimeStilettoClaw(radTip * 0.96, clawLen, clawMat, null);
        stilettoClaw.position.set(0, length * 0.90, 0);
        group.add(stilettoClaw);
      }

      return group;
    }

    // Helper: Double silver ring band (matching reference image 1)
    function createDoubleSilverRingBand(radius, tubeRadius, spacing = 0.042) {
      const ringGroup = new THREE.Group();
      const ringGeo = new THREE.TorusGeometry(radius, tubeRadius, 8, 22);

      const r1 = new THREE.Mesh(ringGeo, silverJewelryMaterial);
      r1.rotation.x = Math.PI / 2;
      r1.position.y = -spacing / 2;
      ringGroup.add(r1);

      const r2 = new THREE.Mesh(ringGeo, silverJewelryMaterial);
      r2.rotation.x = Math.PI / 2;
      r2.position.y = spacing / 2;
      ringGroup.add(r2);

      return ringGroup;
    }

    function createAnimeFinger(name, rootX, rootY, l1, l2, l3, r1, r2, r3, r4, restSpread = 0, isIndex = false) {
      const root = new THREE.Group();
      root.position.set(rootX, rootY, 0.02);
      root.rotation.z = restSpread;

      const p1 = createOrganicPhalanx(r1, r2, l1, false);
      root.add(p1);

      const p2 = createOrganicPhalanx(r2, r3, l2, false);
      p2.position.set(0, l1 * 0.95, 0); // Smooth sleeve overlap
      p1.add(p2);

      const p3 = createOrganicPhalanx(r3, r4, l3, true, isIndex);
      p3.position.set(0, l2 * 0.95, 0); // Smooth sleeve overlap
      p2.add(p3);

      humanHandGroup.add(root);

      return { root, p1, p2, p3 };
    }

    // 6.4 5 Slender, Elegant Digits (Anatomical Proportions from Images 2 & 3)
    // Thumb: Starts on radial side of palm, smooth natural opposition
    handFingers.thumb = (function () {
      const thumbRoot = new THREE.Group();
      thumbRoot.position.set(-0.42, 0.04, 0.08);
      thumbRoot.rotation.set(0.28, 0.42, 0.45);

      const p1 = createOrganicPhalanx(0.175, 0.145, 0.58, false);
      thumbRoot.add(p1);

      // Double silver rings on thumb
      const tRings = createDoubleSilverRingBand(0.175, 0.018, 0.045);
      tRings.position.set(0, 0.28, 0);
      p1.add(tRings);

      const p2 = createOrganicPhalanx(0.145, 0.115, 0.46, true, false);
      p2.position.set(0, 0.58 * 0.95, 0);
      p1.add(p2);

      humanHandGroup.add(thumbRoot);
      return { root: thumbRoot, p1, p2 };
    })();

    // Index Finger: Slender, elongated with double silver rings + ARLECCHINO'S BLOOD-CRIMSON CLAW
    // Proportions: l1 = 0.60, l2 = 0.46, l3 = 0.34 (~1.40)
    handFingers.index = createAnimeFinger('index', -0.33, 0.86, 0.60, 0.46, 0.34, 0.148, 0.132, 0.116, 0.092, -0.06, true);
    const idxRings1 = createDoubleSilverRingBand(0.148, 0.016, 0.042);
    idxRings1.position.set(0, 0.25, 0);
    handFingers.index.p1.add(idxRings1);
    const idxRings2 = createDoubleSilverRingBand(0.132, 0.016, 0.038);
    idxRings2.position.set(0, 0.20, 0);
    handFingers.index.p2.add(idxRings2);

    // Middle Finger: Dominant center digit ~1.58 length with double silver rings
    // Proportions: l1 = 0.68, l2 = 0.52, l3 = 0.38 (~1.58)
    handFingers.middle = createAnimeFinger('middle', -0.07, 0.94, 0.68, 0.52, 0.38, 0.155, 0.138, 0.120, 0.095, 0.00, false);
    const midRings1 = createDoubleSilverRingBand(0.155, 0.017, 0.044);
    midRings1.position.set(0, 0.28, 0);
    handFingers.middle.p1.add(midRings1);
    const midRings2 = createDoubleSilverRingBand(0.138, 0.016, 0.040);
    midRings2.position.set(0, 0.22, 0);
    handFingers.middle.p2.add(midRings2);

    // Ring Finger: Second longest digit ~1.46 length with double silver rings
    // Proportions: l1 = 0.62, l2 = 0.48, l3 = 0.36 (~1.46)
    handFingers.ring = createAnimeFinger('ring', 0.18, 0.88, 0.62, 0.48, 0.36, 0.145, 0.130, 0.115, 0.090, 0.06, false);
    const ringRings1 = createDoubleSilverRingBand(0.145, 0.016, 0.042);
    ringRings1.position.set(0, 0.26, 0);
    handFingers.ring.p1.add(ringRings1);
    const ringRings2 = createDoubleSilverRingBand(0.130, 0.015, 0.038);
    ringRings2.position.set(0, 0.21, 0);
    handFingers.ring.p2.add(ringRings2);

    // Pinky Finger: Petite, elegant digit ~1.08 length
    // Proportions: l1 = 0.46, l2 = 0.35, l3 = 0.27 (~1.08)
    handFingers.pinky = createAnimeFinger('pinky', 0.41, 0.73, 0.46, 0.35, 0.27, 0.125, 0.110, 0.095, 0.075, 0.13, false);
    const pinkyRings = createDoubleSilverRingBand(0.125, 0.014, 0.036);
    pinkyRings.position.set(0, 0.18, 0);
    handFingers.pinky.p1.add(pinkyRings);

    // Set Initial Natural Resting Curvature
    applyAnatomicalRestPose();

    // 6.5 Soft Crimson-Wine Backdrop Disc (Highlights hand & forearm, softened so aura is delicate)
    const auraCanvas = document.createElement('canvas');
    auraCanvas.width = 512;
    auraCanvas.height = 512;
    const aCtx = auraCanvas.getContext('2d');
    const aGrad = aCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
    aGrad.addColorStop(0.00, 'rgba(205, 32, 68, 0.34)'); // Softened gentle crimson core
    aGrad.addColorStop(0.38, 'rgba(135, 16, 42, 0.20)');
    aGrad.addColorStop(0.72, 'rgba(50, 6, 16, 0.07)');
    aGrad.addColorStop(1.00, 'rgba(0, 0, 0, 0)');
    aCtx.fillStyle = aGrad;
    aCtx.fillRect(0, 0, 512, 512);

    const auraTexture = new THREE.CanvasTexture(auraCanvas);
    const handAuraPlaneGeo = new THREE.PlaneGeometry(5.2, 6.5);
    const handAuraPlaneMat = new THREE.MeshBasicMaterial({
      map: auraTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.45
    });
    handBackAuraMesh = new THREE.Mesh(handAuraPlaneGeo, handAuraPlaneMat);
    handBackAuraMesh.position.set(-0.02, 0.15, -0.38);
    humanHandGroup.add(handBackAuraMesh);

    mainGroup.add(humanHandGroup);

    // 6.6 3D CARDS VORTEX (Lá bài 3D xoáy tụ về bàn tay thay cho pháo bông!)
    vortexGroup = new THREE.Group();
    vortexShards = [];

    const vortexCardGeo = new THREE.PlaneGeometry(0.44, 0.68);
    const vortexCardMat = new THREE.MeshStandardMaterial({
      map: globalCardTexture,
      side: THREE.DoubleSide,
      transparent: true,
      roughness: 0.35,
      metalness: 0.30,
      opacity: 0.95
    });

    const vortexCardCount = 38;
    for (let i = 0; i < vortexCardCount; i++) {
      const mesh = new THREE.Mesh(vortexCardGeo, vortexCardMat.clone());
      const radius = 3.6 + Math.random() * 5.4;
      const angle = (i / vortexCardCount) * Math.PI * 4 + Math.random() * 0.8;
      const y = -1.2 + (Math.random() - 0.5) * 4.6;
      const z = (Math.random() - 0.5) * 3.5;

      mesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius + z);
      mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
      vortexGroup.add(mesh);

      vortexShards.push({
        mesh,
        initRadius: radius,
        currentRadius: radius,
        angle,
        speed: 2.2 + Math.random() * 2.5,
        initY: y,
        initZ: z,
        rotSpeedX: 0.03 + Math.random() * 0.05,
        rotSpeedY: 0.04 + Math.random() * 0.06,
        rotSpeedZ: 0.02 + Math.random() * 0.04,
        scale: 0.75 + Math.random() * 0.45
      });
    }
    mainGroup.add(vortexGroup);

    // 6.7 Anamorphic Crimson Blade Slash Flare (Cinematic Horizontal Light Streak)
    const flareCanvas = document.createElement('canvas');
    flareCanvas.width = 512;
    flareCanvas.height = 64;
    const fCtx = flareCanvas.getContext('2d');
    const fGrad = fCtx.createRadialGradient(256, 32, 0, 256, 32, 256);
    fGrad.addColorStop(0.00, 'rgba(255, 210, 220, 0.95)');  // Soft crimson-white core
    fGrad.addColorStop(0.18, 'rgba(200, 18, 48, 0.85)');   // Deep blood crimson
    fGrad.addColorStop(0.55, 'rgba(120, 8, 26, 0.35)');   // Dark wine aura
    fGrad.addColorStop(1.00, 'rgba(0, 0, 0, 0)');
    fCtx.fillStyle = fGrad;
    fCtx.fillRect(0, 0, 512, 64);

    const flareTex = new THREE.CanvasTexture(flareCanvas);
    const flareGeo = new THREE.PlaneGeometry(1.0, 0.22);
    const flareMat = new THREE.MeshBasicMaterial({
      map: flareTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0,
      side: THREE.DoubleSide
    });
    anamorphicFlareMesh = new THREE.Mesh(flareGeo, flareMat);
    anamorphicFlareMesh.position.set(-0.16, 0.32, 4.08);
    mainGroup.add(anamorphicFlareMesh);

    // 6.8 Soft Concentric Water Ripple Shockwave in White & Deep Crimson (Sắc nét, thanh thoát như lúc búng tay)
    const rippleCanvas = document.createElement('canvas');
    rippleCanvas.width = 512;
    rippleCanvas.height = 512;
    const rCtx = rippleCanvas.getContext('2d');
    
    // Procedural multi-ring water ripple gradient in Crisp White & Deep Crimson
    const rGrad = rCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
    rGrad.addColorStop(0.00, 'rgba(204, 20, 54, 0)');
    rGrad.addColorStop(0.12, 'rgba(204, 20, 54, 0.08)');
    // Wave 1 (Deep Crimson base with Crisp Pure White crest)
    rGrad.addColorStop(0.19, 'rgba(204, 20, 54, 0.75)');
    rGrad.addColorStop(0.23, 'rgba(255, 255, 255, 0.98)');
    rGrad.addColorStop(0.27, 'rgba(153, 27, 27, 0.35)');
    rGrad.addColorStop(0.36, 'rgba(10, 1, 4, 0.15)');
    // Wave 2
    rGrad.addColorStop(0.42, 'rgba(225, 29, 72, 0.75)');
    rGrad.addColorStop(0.46, 'rgba(255, 255, 255, 1.00)');
    rGrad.addColorStop(0.50, 'rgba(159, 18, 57, 0.38)');
    rGrad.addColorStop(0.60, 'rgba(10, 1, 4, 0.18)');
    // Wave 3 (Main outer crest)
    rGrad.addColorStop(0.68, 'rgba(244, 63, 94, 0.80)');
    rGrad.addColorStop(0.72, 'rgba(255, 255, 255, 1.00)');
    rGrad.addColorStop(0.76, 'rgba(190, 18, 60, 0.40)');
    rGrad.addColorStop(0.85, 'rgba(10, 1, 4, 0.20)');
    // Wave 4 (Outermost dissipating ripple)
    rGrad.addColorStop(0.90, 'rgba(225, 29, 72, 0.60)');
    rGrad.addColorStop(0.93, 'rgba(255, 255, 255, 0.75)');
    rGrad.addColorStop(1.00, 'rgba(10, 1, 4, 0)');
    rCtx.fillStyle = rGrad;
    rCtx.fillRect(0, 0, 512, 512);

    // Subtle 3D crest highlight & deep crimson feathering
    const waveRadii = [56, 116, 182, 230];
    const waveWidths = [10, 14, 20, 16];
    for (let w = 0; w < waveRadii.length; w++) {
      // Crimson body aura
      rCtx.beginPath();
      rCtx.arc(256, 256, waveRadii[w], 0, Math.PI * 2);
      rCtx.strokeStyle = 'rgba(204, 20, 54, 0.70)';
      rCtx.lineWidth = waveWidths[w];
      rCtx.stroke();

      // Sharp pure white specular catch-light on the wave crest
      rCtx.beginPath();
      rCtx.arc(256, 255, waveRadii[w], 0, Math.PI * 2);
      rCtx.strokeStyle = 'rgba(255, 255, 255, 0.98)';
      rCtx.lineWidth = 3;
      rCtx.stroke();
    }

    const waterRippleTex = new THREE.CanvasTexture(rippleCanvas);
    const rippleGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const rippleMat = new THREE.MeshBasicMaterial({
      map: waterRippleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0,
      side: THREE.DoubleSide
    });
    waterRippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
    waterRippleMesh.position.set(-0.16, 0.32, 4.05);
    mainGroup.add(waterRippleMesh);

    // Trailing echo ripple mesh for natural water dispersion
    const rippleEchoMat = rippleMat.clone();
    waterRippleEchoMesh = new THREE.Mesh(rippleGeo, rippleEchoMat);
    waterRippleEchoMesh.position.set(-0.16, 0.32, 4.04);
    mainGroup.add(waterRippleEchoMesh);

    sovereignRingMesh = waterRippleMesh;

    // 6.8b Occult Crimson Thread Slashes (Arlecchino's signature blood-thread slashes cutting reality)
    sovereignEmbersGroup = new THREE.Group();
    sovereignEmberData = [];

    const slashAngles = [-0.58, 0.30, 1.18, -1.32];
    const slashLengths = [3.8, 3.4, 4.0, 3.2];

    const slashCanvas = document.createElement('canvas');
    slashCanvas.width = 256;
    slashCanvas.height = 16;
    const slCtx = slashCanvas.getContext('2d');
    const slGrad = slCtx.createLinearGradient(0, 0, 256, 0);
    slGrad.addColorStop(0.00, 'rgba(190, 14, 42, 0)');
    slGrad.addColorStop(0.25, 'rgba(215, 18, 52, 0.7)');
    slGrad.addColorStop(0.50, 'rgba(255, 60, 90, 1.0)'); // Razor-thin core
    slGrad.addColorStop(0.75, 'rgba(215, 18, 52, 0.7)');
    slGrad.addColorStop(1.00, 'rgba(190, 14, 42, 0)');
    slCtx.fillStyle = slGrad;
    slCtx.fillRect(0, 0, 256, 16);

    const slashTex = new THREE.CanvasTexture(slashCanvas);

    for (let i = 0; i < 4; i++) {
      const sGeo = new THREE.PlaneGeometry(slashLengths[i], 0.032);
      const sMat = new THREE.MeshBasicMaterial({
        map: slashTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.rotation.z = slashAngles[i];
      sMesh.position.set(-0.16, 0.32, 4.08);
      sMesh.visible = false;
      sovereignEmbersGroup.add(sMesh);
      sovereignEmberData.push({
        mesh: sMesh,
        angle: slashAngles[i],
        alpha: 0
      });
    }

    // 6.9 Eerie Dark Crimson Ether Mist (Mythical & occult vapor, replacing cartoon star sparkles)
    const mistCanvas = document.createElement('canvas');
    mistCanvas.width = 128;
    mistCanvas.height = 128;
    const mCtx = mistCanvas.getContext('2d');
    const mGrad = mCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    mGrad.addColorStop(0.00, 'rgba(150, 12, 34, 0.50)');
    mGrad.addColorStop(0.45, 'rgba(80, 8, 20, 0.22)');
    mGrad.addColorStop(1.00, 'rgba(0, 0, 0, 0)');
    mCtx.fillStyle = mGrad;
    mCtx.fillRect(0, 0, 128, 128);

    const mistTex = new THREE.CanvasTexture(mistCanvas);
    const mistGeo = new THREE.PlaneGeometry(1.1, 1.1);

    for (let i = 0; i < 6; i++) {
      const mMat = new THREE.MeshBasicMaterial({
        map: mistTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0,
        side: THREE.DoubleSide
      });
      const mMesh = new THREE.Mesh(mistGeo, mMat);
      mMesh.visible = false;
      mMesh.position.set(-0.16, 0.32, 4.02);
      sovereignEmbersGroup.add(mMesh);
      sovereignEmberData.push({
        mesh: mMesh,
        isMist: true,
        angle: (i / 6) * Math.PI * 2,
        dist: 0.05,
        speed: 0.35 + Math.random() * 0.45,
        alpha: 0,
        scale: 0.6 + Math.random() * 0.3,
        rotSpeed: (Math.random() - 0.5) * 0.015
      });
    }

    mainGroup.add(sovereignEmbersGroup);
  }

  /**
   * 6. 3D VOLUMETRIC SAKURA & GOLDEN DUST PARTICLES
   */
  function createSakuraAndDustParticles() {
    particleSystem = new THREE.Group();
    particleData = [];

    const count = CONFIG.particleCount;

    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0.25);
    petalShape.bezierCurveTo(0.18, 0.22, 0.22, -0.05, 0, -0.25);
    petalShape.bezierCurveTo(-0.22, -0.05, -0.18, 0.22, 0, 0.25);
    const petalGeo = new THREE.ShapeGeometry(petalShape, 12);
    
    // Base natural sakura petals (soft translucent, NO emissive glow = 80% of petals)
    const baseSakuraMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb7c5,
      emissive: 0x000000,
      emissiveIntensity: 0,
      roughness: 0.45,
      metalness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72
    });

    // Rare glowing sakura petals (only ~20% of petals glow, soft subtle emissive glow = 0.32)
    const glowingSakuraMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb7c5,
      emissive: 0xff8098,
      emissiveIntensity: 0.32,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });

    const goldDustMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe28a,
      emissive: 0x8a5e0d,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.80,
      transparent: true,
      opacity: 0.80
    });

    const sphereGeo = new THREE.SphereGeometry(0.042, 8, 8);

    for (let i = 0; i < count; i++) {
      const isSakura = i % 3 !== 0;
      const isGlowingSakura = isSakura && (i % 5 === 0); // Only 1 in 5 sakura petals glow!
      
      let mat;
      if (isSakura) {
        mat = isGlowingSakura ? glowingSakuraMaterial.clone() : baseSakuraMaterial.clone();
      } else {
        mat = goldDustMaterial.clone();
      }

      const mesh = new THREE.Mesh(isSakura ? petalGeo : sphereGeo, mat);

      const x = (Math.random() - 0.5) * 24;
      const y = (Math.random() - 0.5) * 18;
      const z = (Math.random() - 0.5) * 14 - 1;

      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);

      const scale = isSakura ? (0.35 + Math.random() * 0.45) : (0.35 + Math.random() * 0.65);
      mesh.scale.set(scale, scale, scale);

      particleSystem.add(mesh);

      particleData.push({
        mesh,
        baseY: y,
        isSakura,
        isGlowing: isGlowingSakura,
        baseGlow: isGlowingSakura ? 0.32 : 0,
        speedY: 0.006 + Math.random() * 0.012,
        speedX: (Math.random() - 0.5) * 0.005,
        speedZ: (Math.random() - 0.5) * 0.004,
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        rotSpeedZ: (Math.random() - 0.5) * 0.018,
        wobbleSpeed: 1.0 + Math.random() * 2.0,
        wobbleRadius: 0.2 + Math.random() * 0.5,
        seed: Math.random() * Math.PI * 2
      });
    }

    mainGroup.add(particleSystem);
  }

  /**
   * 7. INTRO CHOREOGRAPHY (SWIRL & FIST CLENCH -> FINGER SNAP -> CARDS FLY OUT)
   */
  function startIntroTimeline(onSnap, onComplete) {
    onSnapCallback = onSnap;
    onIntroCompleteCallback = onComplete;

    if (!renderer || !humanHandGroup) {
      pendingIntroCall = { onSnap, onComplete };
      setTimeout(() => {
        if (typeof document !== 'undefined' && document.body && document.body.classList.contains('is-loading')) {
          document.body.classList.remove('is-loading');
        }
      }, 1000);
      return;
    }

    // Dismiss plain loading screen: 3D scene is ready and intro is starting!
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('is-loading');
    }

    isIntroPlaying = true;
    introStartTime = clock.getElapsedTime();
    hasSnapped = false;

    if (humanHandGroup) {
      humanHandGroup.visible = true;
      humanHandGroup.scale.set(1.30, 1.30, 1.30);
      humanHandGroup.position.set(0.12, -0.32, 3.8);
      humanHandGroup.rotation.set(-0.16, 0.38, -0.10);
      applyAnatomicalRestPose();
    }
    if (vortexGroup) {
      vortexGroup.visible = true;
    }
    if (cardRainGroup) {
      cardRainGroup.visible = false;
    }
  }

  /**
   * Triggers the High-Energy Finger Snap Burst (Mature Occult Crimson Aesthetic)
   */
  function triggerSnapBurst() {
    hasSnapped = true;

    // 1. Silent Web Audio hook (No synthetic thump/click oscillators = zero "bục bục" noise)
    playSnapChimeSound();

    // 2. Trigger 3D Card Rain ("mưa bài rơi xuống")
    triggerCardRain();

    // 3. Steady ambient bloom - completely eliminate bloom/light flash so sakura petals never blink
    if (snapFlashLight) {
      snapFlashLight.intensity = 0;
    }
    if (bloomPass) {
      bloomPass.strength = CONFIG.bloomStrength;
    }

    // 4. Anamorphic Crimson Slash Flare & Water Ripple Waves
    if (anamorphicFlareMesh) {
      anamorphicFlareMesh.material.opacity = 0.95;
      anamorphicFlareMesh.scale.set(0.1, 0.22, 1.0);
      if (typeof gsap !== 'undefined') {
        gsap.to(anamorphicFlareMesh.scale, { x: 26.0, y: 0.01, duration: 0.28, ease: 'power4.out' });
        gsap.to(anamorphicFlareMesh.material, { opacity: 0, duration: 0.28, ease: 'power2.out' });
      }
    }

    if (waterRippleMesh) {
      waterRippleMesh.material.opacity = 0.95;
      waterRippleMesh.scale.set(0.1, 0.1, 0.1);
      if (typeof gsap !== 'undefined') {
        gsap.to(waterRippleMesh.scale, { x: 26.0, y: 26.0, z: 26.0, duration: 0.68, ease: 'power2.out' });
        gsap.to(waterRippleMesh.material, { opacity: 0, duration: 0.68, ease: 'power2.out' });
      }
    }

    if (waterRippleEchoMesh) {
      waterRippleEchoMesh.material.opacity = 0;
      waterRippleEchoMesh.scale.set(0.08, 0.08, 0.08);
      if (typeof gsap !== 'undefined') {
        gsap.to(waterRippleEchoMesh.material, { opacity: 0.75, duration: 0.1, delay: 0.08 });
        gsap.to(waterRippleEchoMesh.scale, { x: 22.0, y: 22.0, z: 22.0, duration: 0.62, delay: 0.08, ease: 'power2.out' });
        gsap.to(waterRippleEchoMesh.material, { opacity: 0, duration: 0.54, delay: 0.18, ease: 'power2.out' });
      }
    }

    // 5. Trigger Occult Crimson Thread Slashes & Eerie Ether Mist (No star sparkles!)
    for (let i = 0; i < sovereignEmberData.length; i++) {
      const s = sovereignEmberData[i];
      s.mesh.visible = true;
      s.mesh.position.set(-0.16, 0.32, 4.05);

      if (s.isMist) {
        s.alpha = 0.65;
        s.dist = 0.05;
        if (s.mesh.material) s.mesh.material.opacity = 0.65;
        s.mesh.scale.set(s.scale, s.scale, s.scale);
      } else {
        // Razor slash flash
        s.alpha = 1.0;
        if (s.mesh.material) s.mesh.material.opacity = 1.0;
        s.mesh.scale.set(1.0, 1.0, 1.0);
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(s.mesh.scale,
            { x: 0.2, y: 1.0 },
            { x: 1.2, y: 0.01, duration: 0.22, ease: 'power3.out' }
          );
          gsap.to(s.mesh.material, { opacity: 0, duration: 0.22, ease: 'power2.out' });
        }
      }
    }

    // 6. Notify DOM (Starts Inazuma.m4a immediately + 4 hero cards fly to home)
    if (onSnapCallback) {
      onSnapCallback();
    }

    // 7. Camera slight kinetic recoil
    cameraRecoilZ = -0.45;
  }

  /**
   * Silenced snap hook: Eliminates all synthetic click/thump oscillators ("bục bục" sound)
   * Ensures 100% clean, pure auto-playback directly into Inazuma.m4a with zero artifacts.
   */
  function playSnapChimeSound() {
    // Pure silence: Eliminates all synthetic click/thump oscillators ("bục bục" sound)
    // Audio playback is directly and purely handled by Playlist/Inazuma.m4a
  }

  /**
   * 8. BIO-KINEMATIC ANIMATION & RENDER LOOP
   */
  function render() {
    if (!isRunning) return;

    const elapsedTime = clock.getElapsedTime();

    // 8.1 Mouse Parallax & Scroll Interpolation (Lerp)
    mouse.x += (mouse.targetX - mouse.x) * mouse.ease;
    mouse.y += (mouse.targetY - mouse.y) * mouse.ease;
    scrollState.progress += (scrollState.targetProgress - scrollState.progress) * 0.05;

    // Combined Camera Positioning: Mouse Tilt + Scroll Parallax
    const scrollZOffset = scrollState.progress * 2.5;
    const scrollYOffset = -scrollState.progress * 1.5;

    camera.position.x = mouse.x * 1.6;
    camera.position.y = -mouse.y * 1.2 + scrollYOffset;
    cameraRecoilZ += (0 - cameraRecoilZ) * 0.12;
    camera.position.z = 14 + scrollZOffset + cameraRecoilZ;
    camera.lookAt(0, scrollYOffset * 0.3, 0);

    if (goldLight) {
      goldLight.position.x = 4.5 + mouse.x * 2.5;
      goldLight.position.y = 5.5 - mouse.y * 2.5 + scrollYOffset;
    }

    // Dynamic breathing pulse on the subtle dark silhouette halo
    if (crimsonAuraMaterialRef) {
      crimsonAuraMaterialRef.opacity = 0.28 + Math.sin(elapsedTime * 3.2) * 0.06;
    }
    if (handBackAuraMesh && handBackAuraMesh.material) {
      handBackAuraMesh.material.opacity = 0.42 + Math.sin(elapsedTime * 2.6) * 0.08;
      const s = 1.0 + Math.sin(elapsedTime * 2.4) * 0.025;
      handBackAuraMesh.scale.set(s, s, 1);
    }

    // 8.2 BUTTERY-SMOOTH CONTINUOUS INTRO ANIMATION TIMELINE
    if (isIntroPlaying) {
      const progress = elapsedTime - introStartTime;

      // Phase 1: (0.0s -> 0.95s) 3D Cards swirl and converge smoothly into palm, hand raises gracefully
      if (progress < 0.95) {
        const u = smoothstep(0, 0.90, progress);
        const easeU = easeInOutCubic(u);
        const breathe = Math.sin(progress * 3.5) * 0.010 * (1 - u);

        // 3D Cards spiral smoothly and gather into palm
        for (let i = 0; i < vortexShards.length; i++) {
          const vs = vortexShards[i];
          vs.angle += vs.speed * 0.040;
          vs.currentRadius = vs.initRadius * (1 - easeU * 0.96) + 0.12;
          vs.mesh.position.x = Math.cos(vs.angle) * vs.currentRadius + 0.10 * easeU;
          vs.mesh.position.z = Math.sin(vs.angle) * vs.currentRadius + 0.20 * easeU + vs.initZ * (1 - easeU);
          vs.mesh.position.y = vs.initY * (1 - easeU) + 0.35 * easeU;
          vs.mesh.rotation.x += vs.rotSpeedX;
          vs.mesh.rotation.y += vs.rotSpeedY;
          vs.mesh.rotation.z += vs.rotSpeedZ;
          const cardScale = vs.scale * Math.max(0.01, 1 - easeU * 0.85);
          vs.mesh.scale.setScalar(cardScale);
          vs.mesh.material.opacity = Math.max(0, 0.95 * (1 - easeU * 0.90));
        }

        // Smooth continuous rise from REST POSE towards pre-snap poise
        if (handFingers.index) {
          handFingers.index.p1.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.index.p1X, TENSION_POSE.index.p1X * 0.75, easeU) + breathe;
          handFingers.index.p2.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.index.p2X, TENSION_POSE.index.p2X * 0.75, easeU) + breathe;
          handFingers.index.p3.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.index.p3X, TENSION_POSE.index.p3X, easeU);
          handFingers.index.root.rotation.z = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.index.rootZ, TENSION_POSE.index.rootZ, easeU);
        }
        if (handFingers.middle) {
          handFingers.middle.p1.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.middle.p1X, TENSION_POSE.middle.p1X * 0.75, easeU) + breathe;
          handFingers.middle.p2.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.middle.p2X, TENSION_POSE.middle.p2X * 0.75, easeU) + breathe;
          handFingers.middle.p3.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.middle.p3X, TENSION_POSE.middle.p3X, easeU);
          handFingers.middle.root.rotation.z = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.middle.rootZ, TENSION_POSE.middle.rootZ, easeU);
        }
        if (handFingers.ring) {
          handFingers.ring.p1.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.ring.p1X, TENSION_POSE.ring.p1X * 0.85, easeU) + breathe;
          handFingers.ring.p2.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.ring.p2X, TENSION_POSE.ring.p2X * 0.85, easeU) + breathe;
          handFingers.ring.p3.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.ring.p3X, TENSION_POSE.ring.p3X, easeU);
          handFingers.ring.root.rotation.z = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.ring.rootZ, TENSION_POSE.ring.rootZ, easeU);
        }
        if (handFingers.pinky) {
          handFingers.pinky.p1.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.pinky.p1X, TENSION_POSE.pinky.p1X * 0.85, easeU) + breathe;
          handFingers.pinky.p2.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.pinky.p2X, TENSION_POSE.pinky.p2X * 0.85, easeU) + breathe;
          handFingers.pinky.p3.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.pinky.p3X, TENSION_POSE.pinky.p3X, easeU);
          handFingers.pinky.root.rotation.z = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.pinky.rootZ, TENSION_POSE.pinky.rootZ, easeU);
        }
        if (handFingers.thumb) {
          handFingers.thumb.p1.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.thumb.p1X, TENSION_POSE.thumb.p1X * 0.80, easeU);
          handFingers.thumb.p1.rotation.z = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.thumb.p1Z, TENSION_POSE.thumb.p1Z * 0.80, easeU);
          handFingers.thumb.p2.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.thumb.p2X, TENSION_POSE.thumb.p2X * 0.80, easeU);
        }

        if (humanHandGroup) {
          humanHandGroup.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.hand.rotX, TENSION_POSE.hand.rotX, easeU);
          humanHandGroup.rotation.y = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.hand.rotY, TENSION_POSE.hand.rotY, easeU);
          humanHandGroup.rotation.z = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.hand.rotZ, TENSION_POSE.hand.rotZ, easeU);
        }
      }
      // Phase 2: (0.95s -> 1.35s) Quick, deliberate tension sweep (0.40s tempo - no sluggish wait!)
      else if (progress >= 0.95 && progress < 1.35) {
        const tP2 = (progress - 0.95) / 0.40;
        const easeP2 = easeInOutCubic(tP2);

        // Smooth tension sweep: middle finger pad glides firmly against thumb pad, compressing with natural bio-mechanical force
        if (handFingers.middle) {
          handFingers.middle.p1.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.middle.p1X * 0.75, TENSION_POSE.middle.p1X, easeP2);
          handFingers.middle.p2.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.middle.p2X * 0.75, TENSION_POSE.middle.p2X, easeP2);
          handFingers.middle.p3.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.middle.p3X, TENSION_POSE.middle.p3X + 0.12, easeP2);
          handFingers.middle.root.rotation.z = TENSION_POSE.middle.rootZ;
        }
        if (handFingers.thumb) {
          handFingers.thumb.p1.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.thumb.p1X * 0.80, TENSION_POSE.thumb.p1X, easeP2);
          handFingers.thumb.p1.rotation.z = THREE.MathUtils.lerp(TENSION_POSE.thumb.p1Z * 0.80, TENSION_POSE.thumb.p1Z, easeP2);
          handFingers.thumb.p2.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.thumb.p2X * 0.80, TENSION_POSE.thumb.p2X, easeP2);
        }
        if (handFingers.index) {
          // Arlecchino's poised index finger gracefully arches upwards
          handFingers.index.p1.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.index.p1X * 0.75, TENSION_POSE.index.p1X, easeP2);
          handFingers.index.p2.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.index.p2X * 0.75, TENSION_POSE.index.p2X, easeP2);
          handFingers.index.p3.rotation.x = TENSION_POSE.index.p3X;
          handFingers.index.root.rotation.z = TENSION_POSE.index.rootZ;
        }
        if (handFingers.ring) {
          handFingers.ring.p1.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.ring.p1X * 0.85, TENSION_POSE.ring.p1X, easeP2);
          handFingers.ring.p2.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.ring.p2X * 0.85, TENSION_POSE.ring.p2X, easeP2);
        }
        if (handFingers.pinky) {
          handFingers.pinky.p1.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.pinky.p1X * 0.85, TENSION_POSE.pinky.p1X, easeP2);
          handFingers.pinky.p2.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.pinky.p2X * 0.85, TENSION_POSE.pinky.p2X, easeP2);
        }

        if (humanHandGroup) {
          humanHandGroup.rotation.x = TENSION_POSE.hand.rotX;
          humanHandGroup.rotation.y = TENSION_POSE.hand.rotY;
          humanHandGroup.rotation.z = TENSION_POSE.hand.rotZ;
          humanHandGroup.position.z = 3.8;
        }

        if (vortexGroup && vortexGroup.visible) {
          vortexGroup.visible = false;
        }
      }
      // Phase 3: (1.35s -> 1.65s) Crisp Snap Strike & Recoil Trigger (0.30s)
      else if (progress >= 1.35 && progress < 1.65) {
        if (!hasSnapped) {
          triggerSnapBurst();
        }

        if (vortexGroup && vortexGroup.visible) {
          vortexGroup.visible = false;
        }

        const snapT = progress - 1.35;
        const strikeDuration = 0.12; // Clean, readable strike duration

        if (snapT <= strikeDuration) {
          // Explosive strike acceleration onto thenar eminence
          const s = snapT / strikeDuration;
          const sEase = s * s * (3 - 2 * s);

          if (handFingers.middle) {
            handFingers.middle.p1.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.middle.p1X, IMPACT_POSE.middle.p1X, sEase);
            handFingers.middle.p2.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.middle.p2X, IMPACT_POSE.middle.p2X, sEase);
            handFingers.middle.p3.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.middle.p3X + 0.12, IMPACT_POSE.middle.p3X, sEase);
            handFingers.middle.root.rotation.z = THREE.MathUtils.lerp(TENSION_POSE.middle.rootZ, IMPACT_POSE.middle.rootZ, sEase);
          }
          if (handFingers.thumb) {
            handFingers.thumb.p1.rotation.z = THREE.MathUtils.lerp(TENSION_POSE.thumb.p1Z, IMPACT_POSE.thumb.p1Z, sEase);
            handFingers.thumb.p1.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.thumb.p1X, IMPACT_POSE.thumb.p1X, sEase);
            handFingers.thumb.p2.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.thumb.p2X, IMPACT_POSE.thumb.p2X, sEase);
          }
          if (handFingers.index) {
            handFingers.index.p1.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.index.p1X, IMPACT_POSE.index.p1X, sEase);
            handFingers.index.p2.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.index.p2X, IMPACT_POSE.index.p2X, sEase);
          }

          if (humanHandGroup) {
            humanHandGroup.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.hand.rotX, IMPACT_POSE.hand.rotX, sEase);
            humanHandGroup.rotation.y = THREE.MathUtils.lerp(TENSION_POSE.hand.rotY, IMPACT_POSE.hand.rotY, sEase);
            humanHandGroup.rotation.z = THREE.MathUtils.lerp(TENSION_POSE.hand.rotZ, IMPACT_POSE.hand.rotZ, sEase);
          }
        } else {
          // Smooth organic biological recoil oscillation
          const tau = snapT - strikeDuration;
          const bounceMiddle = Math.exp(-tau * 9.0) * Math.sin(tau * 18.0) * 0.05;
          const bounceThumb = Math.exp(-tau * 8.0) * Math.sin(tau * 16.0) * 0.03;
          const bounceHand = Math.exp(-tau * 10.0) * Math.sin(tau * 18.0) * 0.05;

          if (handFingers.middle) {
            handFingers.middle.p1.rotation.x = IMPACT_POSE.middle.p1X + bounceMiddle;
            handFingers.middle.p2.rotation.x = IMPACT_POSE.middle.p2X + bounceMiddle * 0.7;
          }
          if (handFingers.thumb) {
            handFingers.thumb.p1.rotation.z = IMPACT_POSE.thumb.p1Z + bounceThumb;
          }
          if (humanHandGroup) {
            humanHandGroup.position.z = 3.8 - bounceHand;
            humanHandGroup.rotation.x = IMPACT_POSE.hand.rotX + bounceHand * 0.35;
          }
        }
      }
      // Phase 4: (1.65s -> 1.95s) Crisp Post-Snap Aftermath Hold (0.30s - shortened per user request)
      else if (progress >= 1.65 && progress < 1.95) {
        const settleProgress = (progress - 1.65) / 0.30;
        const settleBreathe = Math.sin(settleProgress * Math.PI) * 0.008;

        if (handFingers.middle) {
          handFingers.middle.p1.rotation.x = IMPACT_POSE.middle.p1X + settleBreathe;
          handFingers.middle.p2.rotation.x = IMPACT_POSE.middle.p2X;
          handFingers.middle.p3.rotation.x = IMPACT_POSE.middle.p3X;
        }
        if (handFingers.thumb) {
          handFingers.thumb.p1.rotation.z = IMPACT_POSE.thumb.p1Z;
          handFingers.thumb.p1.rotation.x = IMPACT_POSE.thumb.p1X;
        }
        if (handFingers.index) {
          handFingers.index.p1.rotation.x = IMPACT_POSE.index.p1X;
          handFingers.index.p2.rotation.x = IMPACT_POSE.index.p2X;
        }

        if (humanHandGroup) {
          humanHandGroup.position.z = 3.8;
          humanHandGroup.rotation.x = IMPACT_POSE.hand.rotX + settleBreathe * 0.4;
          humanHandGroup.rotation.y = IMPACT_POSE.hand.rotY;
          humanHandGroup.rotation.z = IMPACT_POSE.hand.rotZ;
        }
      }
      // Phase 5: (1.95s -> 2.50s) Post-Snap Drift & Seamless Hand Dissolution (0.55s)
      else if (progress >= 1.95 && progress <= introDuration) {
        const t = (progress - 1.95) / (introDuration - 1.95);
        const easeT = easeInOutCubic(t);
        const fade = Math.max(0, 1 - easeT);

        if (handFingers.middle) {
          handFingers.middle.p1.rotation.x = THREE.MathUtils.lerp(IMPACT_POSE.middle.p1X, 1.60, easeT);
          handFingers.middle.p2.rotation.x = THREE.MathUtils.lerp(IMPACT_POSE.middle.p2X, 1.68, easeT);
        }
        if (handFingers.thumb) {
          handFingers.thumb.p1.rotation.z = THREE.MathUtils.lerp(IMPACT_POSE.thumb.p1Z, 0.55, easeT);
        }
        if (handFingers.index) {
          handFingers.index.p1.rotation.x = THREE.MathUtils.lerp(IMPACT_POSE.index.p1X, 0.30, easeT);
        }

        // Bàn tay lùi dần vào chiều sâu z và tan biến vào sương đỏ
        if (humanHandGroup) {
          humanHandGroup.position.z = 3.8 - easeT * 9.5;
          humanHandGroup.position.y = -0.32 - easeT * 1.8;
          humanHandGroup.scale.setScalar(1.30 * Math.max(0, 1 - easeT));
          if (t >= 0.96) {
            humanHandGroup.visible = false;
          }
        }

        if (crimsonAuraMaterialRef) {
          crimsonAuraMaterialRef.opacity = 0.28 * fade;
        }
        if (handBackAuraMesh && handBackAuraMesh.material) {
          handBackAuraMesh.material.opacity = 0.45 * fade;
        }

        if (vortexGroup && vortexGroup.visible) {
          vortexGroup.visible = false;
        }
      }
      // Phase 6: Intro Complete - Bàn tay biến mất sạch sẽ, về UI Home
      else if (progress > introDuration) {
        isIntroPlaying = false;
        if (humanHandGroup) humanHandGroup.visible = false;
        if (vortexGroup) vortexGroup.visible = false;
        if (onIntroCompleteCallback) {
          onIntroCompleteCallback();
          onIntroCompleteCallback = null;
        }
        startAmbientCardRain();
      }
    }


    // 8.3 Animate Eerie Occult Crimson Ether Mist (Dissolves gracefully into void)
    if (sovereignEmbersGroup) {
      for (let i = 0; i < sovereignEmberData.length; i++) {
        const s = sovereignEmberData[i];
        if (s.isMist && s.mesh.visible) {
          s.dist += s.speed * 0.025;
          s.mesh.position.x = -0.16 + Math.cos(s.angle) * s.dist;
          s.mesh.position.y = 0.32 + Math.sin(s.angle) * s.dist * 0.75 + Math.sin(elapsedTime * 2.5 + i) * 0.02;
          s.mesh.rotation.z += s.rotSpeed;
          s.alpha -= 0.016;
          if (s.mesh.material) {
            s.mesh.material.opacity = Math.max(0, s.alpha);
          }
          const scale = Math.max(0.01, s.scale * (1.0 + (1 - s.alpha) * 0.8));
          s.mesh.scale.set(scale, scale, scale);
          if (s.alpha <= 0) {
            s.mesh.visible = false;
          }
        }
      }
    }

    // 8.4 Animate 3D Falling Card Rain ("mưa bài rơi xuống")
    if (cardRainGroup && cardRainGroup.visible) {
      let anyActive = false;
      for (let i = 0; i < cardRainData.length; i++) {
        const c = cardRainData[i];
        if (!c.active) continue;
        anyActive = true;

        c.mesh.position.y += c.vy;
        c.mesh.position.x += c.vx + Math.sin(elapsedTime * c.flutterSpeed + c.flutterPhase) * 0.018;
        c.mesh.position.z += c.vz;

        c.mesh.rotation.x += c.rotSpeedX;
        c.mesh.rotation.y += c.rotSpeedY;
        c.mesh.rotation.z += c.rotSpeedZ;

        if (c.mesh.position.y < -1) {
          const maxOp = c.baseOpacity || 0.88;
          const fade = Math.max(0, (c.mesh.position.y - (-8)) / 7);
          c.mesh.material.opacity = Math.min(maxOp, fade * maxOp);
        }

        if (c.mesh.position.y < -8) {
          c.active = false;
          c.mesh.visible = false;
          if (isCardRainLooping) {
            c.mesh.position.set((Math.random() - 0.5) * 18, 8 + Math.random() * 4, 2 + (Math.random() - 0.5) * 6);
            c.baseOpacity = 0.88;
            c.mesh.material.opacity = 0.88;
            c.mesh.visible = true;
            c.active = true;
          }
        }
      }
      if (!anyActive && !isIntroPlaying && !isCardRainLooping) {
        cardRainGroup.visible = false;
      }
    }

    // 8.5 Animate 3D Particles (Sakura Flutter & Gold Drift)
    for (let i = 0; i < particleData.length; i++) {
      const p = particleData[i];
      const m = p.mesh;

      m.position.y -= p.speedY;
      m.position.x += p.speedX + Math.sin(elapsedTime * p.wobbleSpeed + p.seed) * 0.004;
      m.position.z += p.speedZ;

      m.rotation.x += p.rotSpeedX;
      m.rotation.y += p.rotSpeedY;
      m.rotation.z += p.rotSpeedZ;

      // Càng xuống đáy thì hết phát sáng dần:
      // Ở trên cao (y >= 4) phát sáng nhẹ (baseGlow ~ 0.32), từ y = 4 xuống y = -5 tắt dần về 0
      if (p.isGlowing && m.material) {
        const fallProgress = Math.max(0, Math.min(1, (m.position.y - (-5)) / 9));
        m.material.emissiveIntensity = p.baseGlow * fallProgress;
      }

      if (m.position.y < -10) {
        m.position.y = 10;
        m.position.x = (Math.random() - 0.5) * 24;
        m.position.z = (Math.random() - 0.5) * 14 - 1;
        if (p.isGlowing && m.material) {
          m.material.emissiveIntensity = p.baseGlow;
        }
      }
    }

    // 8.6 Render with Post-Processing Bloom or standard renderer
    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }

    animationFrameId = requestAnimationFrame(render);
  }

  function startAnimationLoop() {
    if (!isRunning) {
      isRunning = true;
      clock.start();
      animationFrameId = requestAnimationFrame(render);
    }
  }

  function stopAnimationLoop() {
    if (isRunning) {
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }
  }

  /**
   * 9. EVENT HANDLERS & RESIZE
   */
  function bindEvents() {
    window.addEventListener('resize', onWindowResize, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouse.targetX = (touch.clientX / window.innerWidth - 0.5) * 2;
        mouse.targetY = (touch.clientY / window.innerHeight - 0.5) * 2;
      }
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAnimationLoop();
      } else {
        startAnimationLoop();
      }
    });
  }

  function onWindowResize() {
    if (!renderer || !camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    const maxPR = (width <= 768) ? 1.15 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPR));

    if (composer) {
      composer.setSize(width, height);
      if (bloomPass) {
        bloomPass.resolution.set(width, height);
      }
    }
  }

  /**
   * 10. PUBLIC API CONTROLLER (window.JPC3D)
   */
  function exposePublicAPI() {
    window.JPC3D = {
      get scene() { return scene; },
      get camera() { return camera; },
      get renderer() { return renderer; },
      get composer() { return composer; },
      get mainGroup() { return mainGroup; },
      get heroKnotGroup() { return null; },
      get humanHandGroup() { return humanHandGroup; },
      get cardRainGroup() { return cardRainGroup; },

      /**
       * Play the 3D Intro Sequence
       */
      playSnapIntro: function (onSnap, onComplete) {
        startIntroTimeline(onSnap, onComplete);
      },

      /**
       * Card rain controls for page transitions
       */
      startCardRainLoop: function () {
        isCardRainLooping = true;
        triggerCardRain();
      },
      stopCardRainLoop: function () {
        isCardRainLooping = false;
      },
      triggerCardRain: function () {
        triggerCardRain();
      },
      startAmbientCardRain: function () {
        startAmbientCardRain();
      },

      /**
       * Instant skip to settled ambient state
       */
      finishInstant3D: function () {
        isIntroPlaying = false;
        if (humanHandGroup) humanHandGroup.visible = false;
        if (vortexGroup) vortexGroup.visible = false;
        if (sovereignRingMesh && sovereignRingMesh.material) sovereignRingMesh.material.opacity = 0;
        if (anamorphicFlareMesh && anamorphicFlareMesh.material) anamorphicFlareMesh.material.opacity = 0;
        if (sovereignEmbersGroup) sovereignEmbersGroup.visible = false;
        startAmbientCardRain();
      },

      /**
       * Add any custom 3D Mesh / Object
       */
      addObject: function (object3D) {
        if (scene && object3D) {
          scene.add(object3D);
          return object3D;
        }
      },

      /**
       * Remove an object from the 3D scene
       */
      removeObject: function (object3D) {
        if (scene && object3D) {
          scene.remove(object3D);
        }
      },

      /**
       * Load a 3D GLTF / GLB Model
       */
      loadGLTF: function (url, onLoad, onProgress, onError) {
        if (!GLTFLoader) {
          console.error('[JPC 3D] GLTFLoader is not available.');
          if (onError) onError(new Error('GLTFLoader not found'));
          return;
        }
        const loader = new GLTFLoader();
        loader.load(url, (gltf) => {
          scene.add(gltf.scene);
          if (onLoad) onLoad(gltf);
        }, onProgress, onError);
      },

      /**
       * Enable / Disable OrbitControls for interactive 3D inspection
       */
      enableOrbitControls: function (enable = true) {
        if (!OrbitControls || !camera || !renderer) return;
        if (enable) {
          if (!controls) {
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
          }
          controls.enabled = true;
        } else if (controls) {
          controls.enabled = false;
        }
      },

      /**
       * Trigger a lively 3D Pulse with Bloom Flare
       */
      pulse: function (intensity = 1.25) {
        if (typeof gsap === 'undefined') return;
        const isMobile = window.innerWidth <= 768;
        if (goldLight) {
          gsap.to(goldLight, {
            intensity: isMobile ? 2.4 : 3.8,
            duration: 0.18,
            yoyo: true,
            repeat: 1
          });
        }
        // On mobile, skip heavy multi-pass BloomPass shader tween to prevent GPU frame stall
        if (bloomPass && !isMobile) {
          gsap.to(bloomPass, {
            strength: 1.4,
            duration: 0.18,
            yoyo: true,
            repeat: 1
          });
        }
      },

      /**
       * Smoothly Animate 3D Camera Position
       */
      animateCamera: function ({ x = 0, y = 0, z = 14, duration = 1.5, ease = 'power2.inOut' } = {}) {
        if (!camera) return;
        if (typeof gsap !== 'undefined') {
          gsap.to(camera.position, {
            x,
            y,
            z,
            duration,
            ease
          });
        } else {
          camera.position.set(x, y, z);
        }
      },

      /**
       * Parallax update on page scroll (e.g. from Lenis)
       */
      onScrollUpdate: function (progress, scrollY) {
        scrollState.targetProgress = progress;
        scrollState.scrollY = scrollY;
      },

      /**
       * Transition 3D scene elements when changing web SPA views
       */
      transitionView: function (viewId) {
        // Keep 3D canvas and falling cards clearly alive & visible across all views!
        const targetOpacity = (viewId === 'contact') ? 0.45 : 0.85;

        if (typeof gsap !== 'undefined' && canvas) {
          gsap.to(canvas, {
            opacity: targetOpacity,
            duration: 0.8,
            ease: 'power2.out'
          });
        }
        startAmbientCardRain();
      },

      /**
       * Pause rendering loop to save 100% GPU resources when modal/portal is open
       */
      pause: function () {
        stopAnimationLoop();
      },

      /**
       * Resume rendering loop smoothly
       */
      resume: function () {
        startAnimationLoop();
      }
    };
  }

  // Expose API immediately
  exposePublicAPI();

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
