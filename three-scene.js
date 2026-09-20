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
    return;
  }

  // Configuration Tokens
  const CONFIG = {
    canvasId: 'threeCanvas',
    gloveColor: 0x222432,
    accentRed: 0xff1e46,
    goldLight: 0xf6d382,
    particleCount: window.innerWidth <= 768 ? 95 : 185,
    bloomStrength: 0.68,
    bloomRadius: 0.45,
    bloomThreshold: 0.28
  };

  // Core Engine State
  let canvas, renderer, scene, camera, controls;
  let composer = null, bloomPass = null;
  let mainGroup, particleSystem;
  let cardRainGroup, cardRainData = [];
  let humanHandGroup, handFingers = {}, wristMesh;
  let handBackAuraMesh, crimsonAuraMaterialRef;
  let vortexGroup, sovereignRingMesh, anamorphicFlareMesh, sovereignEmbersGroup;
  let sovereignEmberData = [];
  let goldLight, rimLight, ambientLight, snapFlashLight, skinFillLight;
  let animationFrameId = null;
  let isRunning = false;
  let isIntroPlaying = false;
  let introStartTime = 0;
  const introDuration = 3.6; // seconds
  let hasSnapped = false;
  let onSnapCallback = null;
  let onIntroCompleteCallback = null;
  let pendingIntroCall = null;
  let cameraRecoilZ = 0;
  const clock = new THREE.Clock();

  // 1. Anatomical Resting Finger Curvature (Directly matching reference image pose)
  const ANATOMICAL_REST_POSE = {
    index:  { p1X: 0.26, p2X: 0.32, p3X: 0.18, rootZ: -0.06 },
    middle: { p1X: 0.34, p2X: 0.44, p3X: 0.24, rootZ:  0.00 },
    ring:   { p1X: 0.44, p2X: 0.54, p3X: 0.28, rootZ:  0.06 },
    pinky:  { p1X: 0.52, p2X: 0.64, p3X: 0.32, rootZ:  0.14 },
    thumb:  { p1X: 0.28, p1Z: 0.35, p2X: 0.22 },
    hand:   { rotX: -0.16, rotY: 0.38, rotZ: -0.10 }
  };

  // 2. High-Tension Stance Pose (Middle finger pad firmly locked against thumb ball)
  const TENSION_POSE = {
    index:  { p1X: 0.20, p2X: 0.24, p3X: 0.16, rootZ: -0.16 },
    middle: { p1X: 1.48, p2X: 1.55, p3X: 0.85, rootZ: -0.12 },
    ring:   { p1X: 1.65, p2X: 1.70, p3X: 1.10, rootZ:  0.06 },
    pinky:  { p1X: 1.70, p2X: 1.75, p3X: 1.15, rootZ:  0.14 },
    thumb:  { p1X: 0.76, p1Z: -0.58, p2X: 0.45 },
    hand:   { rotX: -0.30, rotY: 0.52, rotZ: -0.18 }
  };

  // 3. Post-Snap Impact Pose (Middle finger slammed onto thenar eminence, thumb flicked open)
  const IMPACT_POSE = {
    index:  { p1X: 0.24, p2X: 0.28, p3X: 0.18, rootZ: -0.16 },
    middle: { p1X: 2.05, p2X: 1.95, p3X: 1.18, rootZ:  0.04 },
    ring:   { p1X: 1.68, p2X: 1.72, p3X: 1.10, rootZ:  0.06 },
    pinky:  { p1X: 1.72, p2X: 1.78, p3X: 1.15, rootZ:  0.14 },
    thumb:  { p1X: 0.38, p1Z: 0.72, p2X: 0.12 },
    hand:   { rotX: -0.22, rotY: 0.46, rotZ: -0.10 }
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
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
  function setupLighting() {
    ambientLight = new THREE.AmbientLight(0xfff7ee, 1.15);
    scene.add(ambientLight);

    goldLight = new THREE.PointLight(CONFIG.goldLight, 3.2, 45, 1.1);
    goldLight.position.set(4.5, 5.5, 7.5);
    scene.add(goldLight);

    // Powerful Crimson Silhouette Rim Light grazing the hand from behind-left
    rimLight = new THREE.PointLight(0xff123d, 6.5, 28, 1.2);
    rimLight.position.set(-3.2, 1.0, 1.8);
    scene.add(rimLight);

    // Secondary Crimson Back-Light directly behind hand for halo effect
    const handBackLight = new THREE.PointLight(0xee0028, 4.8, 20, 1.3);
    handBackLight.position.set(0.12, 0.2, 1.0);
    scene.add(handBackLight);

    // Warm Golden Key Light illuminating the palmar details
    skinFillLight = new THREE.DirectionalLight(0xffeedb, 1.35);
    skinFillLight.position.set(1.5, 3.0, 8.0);
    scene.add(skinFillLight);

    snapFlashLight = new THREE.PointLight(0xfffae8, 0, 48, 2);
    snapFlashLight.position.set(0, 0, 4);
    scene.add(snapFlashLight);
  }

  /**
   * 4. 3D CARD RAIN SYSTEM (Mưa bài 3D rơi xuống khi búng tay)
   */
  function createCardRainSystem() {
    cardRainGroup = new THREE.Group();
    cardRainData = [];

    const cardGeo = new THREE.PlaneGeometry(0.55, 0.82);

    // Canvas texture for traditional Japanese JPC playing cards
    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 128;
    cardCanvas.height = 192;
    const cCtx = cardCanvas.getContext('2d');
    
    // Crimson lacquered back with golden diamond foil border
    cCtx.fillStyle = '#7a1414';
    cCtx.fillRect(0, 0, 128, 192);
    cCtx.strokeStyle = '#eecd7e';
    cCtx.lineWidth = 4;
    cCtx.strokeRect(6, 6, 116, 180);
    cCtx.strokeRect(10, 10, 108, 172);

    // Golden inner diamond crest
    cCtx.fillStyle = '#eecd7e';
    cCtx.beginPath();
    cCtx.moveTo(64, 52);
    cCtx.lineTo(96, 96);
    cCtx.lineTo(64, 140);
    cCtx.lineTo(32, 96);
    cCtx.closePath();
    cCtx.fill();

    // Inner sakura accent
    cCtx.fillStyle = '#7a1414';
    cCtx.beginPath();
    cCtx.arc(64, 96, 14, 0, Math.PI * 2);
    cCtx.fill();

    const cardTexture = new THREE.CanvasTexture(cardCanvas);
    cardTexture.minFilter = THREE.LinearFilter;
    cardTexture.generateMipmaps = false;

    const cardMaterial = new THREE.MeshToonMaterial({
      map: cardTexture,
      side: THREE.DoubleSide,
      transparent: true,
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
      c.mesh.material.opacity = 0.95;
      c.mesh.visible = true;
      c.active = true;
    }
  }

  /**
   * 5. ANIME FEMALE GLOVE & STILETTO CLAW MATERIALS ENGINE
   */
  function createAnimeCelMaterials() {
    // 5.1 4-Step Discrete Quantized Anime Cel Gradient Ramp for Obsidian Black Glove
    const rampCanvas = document.createElement('canvas');
    rampCanvas.width = 4;
    rampCanvas.height = 1;
    const rCtx = rampCanvas.getContext('2d');
    
    // Anime cel color steps: [Deep Inky Slate, Midnight Charcoal, Twilight Tone, Moonlit Sheen]
    const animeColors = ['#181a26', '#2b3044', '#3d4460', '#646f99'];
    for (let i = 0; i < 4; i++) {
      rCtx.fillStyle = animeColors[i];
      rCtx.fillRect(i, 0, 1, 1);
    }

    const gradientMap = new THREE.CanvasTexture(rampCanvas);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.generateMipmaps = false;

    // 5.2 Deep Manga Ink Contour Material (Inverted Hull)
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x141624,
      side: THREE.BackSide
    });

    // 5.2b Translucent Deep Crimson Red Aura Material (Wrapping the outer contour of the hand)
    const crimsonAuraMaterial = new THREE.MeshBasicMaterial({
      color: 0xff143c,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    crimsonAuraMaterialRef = crimsonAuraMaterial;

    // 5.3 Anime Dark Leather/Fabric Glove Material (with Crimson Subsurface Tone)
    const animeGloveMaterial = new THREE.MeshToonMaterial({
      color: 0x30364c,
      gradientMap: gradientMap,
      emissive: 0x480816,
      emissiveIntensity: 0.40
    });

    // 5.4 Anime Glove Palmar Material
    const animeGlovePalmMaterial = new THREE.MeshToonMaterial({
      color: 0x222638,
      gradientMap: gradientMap,
      emissive: 0x360610,
      emissiveIntensity: 0.32
    });

    // 5.5 High-Gloss Silver Jewelry Material (Rings & Diamond filigree)
    const silverJewelryMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x3c4558,
      emissiveIntensity: 0.50,
      roughness: 0.08,
      metalness: 0.98
    });

    // 5.6 Obsidian Glossy Stiletto Claw Material (Thumb, Middle, Ring, Pinky)
    const obsidianClawMaterial = new THREE.MeshStandardMaterial({
      color: 0x181a24,
      emissive: 0x3d0812,
      emissiveIntensity: 0.35,
      roughness: 0.10,
      metalness: 0.90
    });

    // 5.7 Vibrant Crimson Red Stiletto Claw Material (Index Finger Highlight)
    const crimsonClawMaterial = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0xd60028,
      emissiveIntensity: 1.55,
      roughness: 0.10,
      metalness: 0.60
    });

    // 5.8 Forearm Gothic Diamond Cross-Hatch Argyle Texture (Matching Arlecchino Sleeve Reference)
    const sleeveCanvas = document.createElement('canvas');
    sleeveCanvas.width = 512;
    sleeveCanvas.height = 512;
    const sCtx = sleeveCanvas.getContext('2d');

    // Deep midnight charcoal base
    sCtx.fillStyle = '#161922';
    sCtx.fillRect(0, 0, 512, 512);

    // Cross-hatching argyle diamond lattice bands
    const step = 64;
    sCtx.lineWidth = 5.0;
    sCtx.strokeStyle = '#090a10'; // Deep inky seams
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

    // Secondary subtle crimson gothic pinstripes
    sCtx.lineWidth = 1.8;
    sCtx.strokeStyle = 'rgba(215, 25, 60, 0.40)';
    for (let x = -512; x < 1024; x += step) {
      sCtx.beginPath();
      sCtx.moveTo(x + 2, 0);
      sCtx.lineTo(x + 514, 512);
      sCtx.stroke();
    }

    // Inner diamond core accents
    sCtx.fillStyle = '#1f2432';
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
      color: 0x222634,
      map: forearmDiamondTex,
      gradientMap: gradientMap,
      emissive: 0x3d0812,
      emissiveIntensity: 0.35,
      roughness: 0.30
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
   * Helper: Attach Inverted Hull Anime Line-Art Outline + Translucent Crimson Aura Shell
   */
  function buildAnimeMesh(geometry, fillMaterial, outlineMaterial, auraMaterial, outlineScale = 1.025, auraScale = 1.095) {
    const group = new THREE.Group();
    const fillMesh = new THREE.Mesh(geometry, fillMaterial);
    group.add(fillMesh);

    if (outlineMaterial) {
      const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
      outlineMesh.scale.set(outlineScale, outlineScale, outlineScale);
      group.add(outlineMesh);
    }

    if (auraMaterial) {
      const auraMesh = new THREE.Mesh(geometry, auraMaterial);
      auraMesh.scale.set(auraScale, auraScale, auraScale);
      group.add(auraMesh);
    }

    return { group, fillMesh };
  }

  /**
   * Helper: Curved Razor-Sharp Stiletto Claw Builder with Crimson Aura
   */
  function createAnimeStilettoClaw(baseRadius, length, clawMaterial, outlineMat, auraMat) {
    const group = new THREE.Group();
    const curvePoints = [];
    const segments = 14;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = t * length;
      const r = baseRadius * Math.pow(1.0 - t, 1.45);
      curvePoints.push(new THREE.Vector2(r, y));
    }
    const clawGeo = new THREE.LatheGeometry(curvePoints, 16);
    clawGeo.computeVertexNormals();

    const clawMesh = new THREE.Mesh(clawGeo, clawMaterial);
    clawMesh.rotation.x = -0.16;
    clawMesh.position.set(0, 0, -baseRadius * 0.10);
    group.add(clawMesh);

    if (outlineMat) {
      const outMesh = new THREE.Mesh(clawGeo, outlineMat);
      outMesh.scale.set(1.04, 1.03, 1.04);
      outMesh.rotation.x = -0.16;
      outMesh.position.set(0, 0, -baseRadius * 0.10);
      group.add(outMesh);
    }

    if (auraMat) {
      const auraMesh = new THREE.Mesh(clawGeo, auraMat);
      auraMesh.scale.set(1.14, 1.08, 1.14);
      auraMesh.rotation.x = -0.16;
      auraMesh.position.set(0, 0, -baseRadius * 0.10);
      group.add(auraMesh);
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

    // 6.1 Slender Gothic Forearm with Diamond Lattice Pattern (Arlecchino Sleeve Proportion)
    // Forearm height = 4.2, radiusTop = 0.34, radiusBottom = 0.52 (graceful long anime taper)
    const forearmGeo = new THREE.CylinderGeometry(0.34, 0.52, 4.2, 32, 8, false);
    const fPos = forearmGeo.attributes.position;
    for (let i = 0; i < fPos.count; i++) {
      const fx = fPos.getX(i);
      const fy = fPos.getY(i);
      const fz = fPos.getZ(i);
      const t = (fy + 2.1) / 4.2; // 0 at base cut, 1 at wrist
      // Graceful anime arm silhouette with slender wrist
      if (t > 0.60) {
        const taper = Math.sin(((t - 0.60) / 0.40) * Math.PI * 0.5) * 0.04;
        fPos.setX(i, fx * (1 - taper));
        fPos.setZ(i, fz * (1 - taper));
      }
    }
    forearmGeo.computeVertexNormals();

    const forearmObj = buildAnimeMesh(forearmGeo, forearmGloveMaterial, outlineMaterial, crimsonAuraMaterial, 1.02, 1.075);
    wristMesh = forearmObj.fillMesh;
    forearmObj.group.position.set(0.08, -2.42, -0.06);
    forearmObj.group.rotation.z = -0.05;
    humanHandGroup.add(forearmObj.group);

    // Anatomical base cut cap and sleek silver rim
    const cutCapGeo = new THREE.CircleGeometry(0.52, 32);
    const cutCapMesh = new THREE.Mesh(cutCapGeo, animeGloveMaterial);
    cutCapMesh.rotation.x = Math.PI / 2;
    cutCapMesh.position.set(0, -2.1, 0);
    forearmObj.group.add(cutCapMesh);

    const cutRimGeo = new THREE.TorusGeometry(0.52, 0.022, 8, 32);
    const cutRimMesh = new THREE.Mesh(cutRimGeo, silverJewelryMaterial);
    cutRimMesh.rotation.x = Math.PI / 2;
    cutRimMesh.position.set(0, -2.1, 0);
    forearmObj.group.add(cutRimMesh);

    // Carpal Wrist Transition (Slender flattened oval)
    const wristJointGeo = new THREE.SphereGeometry(0.34, 24, 20);
    const wristJointObj = buildAnimeMesh(wristJointGeo, animeGloveMaterial, outlineMaterial, crimsonAuraMaterial, 1.025, 1.080);
    wristJointObj.group.position.set(0.03, -0.32, -0.02);
    wristJointObj.group.scale.set(1.08, 0.72, 0.85);
    humanHandGroup.add(wristJointObj.group);

    // 6.2 Slender, Elongated Palm (Gothic Anime Aristocratic Silhouette)
    // Narrower, slimmer, elegant: width = 1.06, height = 1.54, depth = 0.28
    const palmGeo = new THREE.BoxGeometry(1.06, 1.54, 0.28, 14, 16, 8);
    const pPos = palmGeo.attributes.position;
    for (let i = 0; i < pPos.count; i++) {
      let px = pPos.getX(i);
      let py = pPos.getY(i);
      let pz = pPos.getZ(i);

      const ny = (py + 0.77) / 1.54; // 0 at wrist, 1 at knuckles
      // Slender trapezoid flare: narrower at wrist (0.82), graceful at knuckles (1.04)
      const widthFactor = THREE.MathUtils.lerp(0.82, 1.04, ny);
      px *= widthFactor;

      // Smooth anatomical hollow on palm face (pz > 0)
      if (pz > 0 && Math.abs(px) < 0.38 && py > -0.40 && py < 0.50) {
        pz -= 0.055 * Math.cos((px / 0.38) * Math.PI * 0.5) * Math.sin(ny * Math.PI);
      }
      // Streamlined thenar muscle contour smoothly sculpted into palm mesh (no bulky spheres!)
      if (pz > 0 && px < -0.15 && py < 0.20) {
        pz += 0.038 * (1 - Math.abs(px + 0.35) / 0.35) * Math.sin(((py + 0.5) / 0.7) * Math.PI);
      }
      // Smooth dorsal curve
      if (pz < 0) {
        pz -= Math.sin(ny * Math.PI) * 0.028;
      }

      pPos.setXYZ(i, px, py, pz);
    }
    palmGeo.computeVertexNormals();

    const palmObj = buildAnimeMesh(palmGeo, animeGloveMaterial, outlineMaterial, crimsonAuraMaterial, 1.025, 1.075);
    palmObj.group.position.set(0.02, 0.22, 0);
    humanHandGroup.add(palmObj.group);

    // Subtle sleek knuckle markers across metacarpal arch
    const knuckleData = [
      { x: -0.35, y: 0.86, z: 0.04, r: 0.16 },  // Index
      { x: -0.08, y: 0.90, z: 0.05, r: 0.17 },  // Middle (Highest)
      { x:  0.18, y: 0.86, z: 0.04, r: 0.16 },  // Ring
      { x:  0.42, y: 0.74, z: 0.03, r: 0.14 }   // Pinky
    ];
    knuckleData.forEach(kd => {
      const kGeo = new THREE.SphereGeometry(kd.r, 16, 14);
      const kObj = buildAnimeMesh(kGeo, animeGloveMaterial, outlineMaterial, crimsonAuraMaterial, 1.02, 1.080);
      kObj.group.position.set(kd.x, kd.y, kd.z);
      kObj.group.scale.set(0.95, 0.75, 0.85);
      humanHandGroup.add(kObj.group);
    });

    // Iconic Geometric Diamond Motif on Dorsal Hand (Back of hand)
    const dorsalDiamondShape = new THREE.Shape();
    dorsalDiamondShape.moveTo(0, 0.52);
    dorsalDiamondShape.lineTo(0.28, 0.10);
    dorsalDiamondShape.lineTo(0, -0.40);
    dorsalDiamondShape.lineTo(-0.28, 0.10);
    dorsalDiamondShape.closePath();

    const innerHole = new THREE.Path();
    innerHole.moveTo(0, 0.40);
    innerHole.lineTo(0.20, 0.10);
    innerHole.lineTo(0, -0.30);
    innerHole.lineTo(-0.20, 0.10);
    innerHole.closePath();
    dorsalDiamondShape.holes.push(innerHole);

    const dorsalDiamondGeo = new THREE.ShapeGeometry(dorsalDiamondShape);
    const dorsalMesh = new THREE.Mesh(dorsalDiamondGeo, silverJewelryMaterial);
    dorsalMesh.position.set(0.02, 0.24, -0.16);
    dorsalMesh.rotation.y = Math.PI;
    dorsalMesh.scale.set(0.85, 0.85, 1);
    humanHandGroup.add(dorsalMesh);

    // 6.3 Slender Phalanx Builder with Needle Stiletto Claws
    function createAnimePhalanx(radBase, radTip, length, isTip, isIndexClaw = false) {
      const group = new THREE.Group();

      const points = [];
      const segments = 14;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = t * length;
        const waist = Math.sin(t * Math.PI) * 0.055;
        const r = THREE.MathUtils.lerp(radBase, radTip, t) * (1.0 - waist);
        points.push(new THREE.Vector2(r, y));
      }

      const latheGeo = new THREE.LatheGeometry(points, 20);
      latheGeo.computeVertexNormals();
      const latheObj = buildAnimeMesh(latheGeo, animeGloveMaterial, outlineMaterial, crimsonAuraMaterial, 1.025, 1.085);
      group.add(latheObj.group);

      const jointGeo = new THREE.SphereGeometry(radBase * 1.02, 16, 14);
      const jointObj = buildAnimeMesh(jointGeo, animeGloveMaterial, outlineMaterial, crimsonAuraMaterial, 1.025, 1.085);
      group.add(jointObj.group);

      // Fingertip Dome & Deadly Stiletto Claw
      if (isTip) {
        const tipDomeGeo = new THREE.SphereGeometry(radTip, 16, 16);
        const tipDomeObj = buildAnimeMesh(tipDomeGeo, animeGloveMaterial, outlineMaterial, crimsonAuraMaterial, 1.025, 1.085);
        tipDomeObj.group.position.set(0, length, 0);
        group.add(tipDomeObj.group);

        const clawMat = isIndexClaw ? crimsonClawMaterial : obsidianClawMaterial;
        const clawLen = length * (isIndexClaw ? 0.95 : 0.82);
        const stilettoClaw = createAnimeStilettoClaw(radTip * 0.98, clawLen, clawMat, outlineMaterial, crimsonAuraMaterial);
        stilettoClaw.position.set(0, length * 0.88, 0);
        group.add(stilettoClaw);
      }

      return group;
    }

    // Helper: Double silver ring band (matching reference image)
    function createDoubleSilverRingBand(radius, tubeRadius, spacing = 0.045) {
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

      const p1 = createAnimePhalanx(r1, r2, l1, false);
      root.add(p1);

      const p2 = createAnimePhalanx(r2, r3, l2, false);
      p2.position.set(0, l1, 0);
      p1.add(p2);

      const p3 = createAnimePhalanx(r3, r4, l3, true, isIndex);
      p3.position.set(0, l2, 0);
      p2.add(p3);

      humanHandGroup.add(root);

      return { root, p1, p2, p3 };
    }

    // 6.4 5 Slender, Elegant Digits (Matching Arlecchino Reference Anatomy)
    // Thumb: Slender opposition with double silver rings and sharp obsidian claw
    handFingers.thumb = (function () {
      const thumbRoot = new THREE.Group();
      thumbRoot.position.set(-0.48, 0.04, 0.10);
      thumbRoot.rotation.set(0.30, 0.40, 0.48);

      const p1 = createAnimePhalanx(0.20, 0.165, 0.58, false);
      thumbRoot.add(p1);

      // Double silver rings on thumb proximal joint
      const tRings = createDoubleSilverRingBand(0.20, 0.022, 0.05);
      tRings.position.set(0, 0.28, 0);
      p1.add(tRings);

      const p2 = createAnimePhalanx(0.165, 0.13, 0.48, true, false);
      p2.position.set(0, 0.58, 0);
      p1.add(p2);

      humanHandGroup.add(thumbRoot);
      return { root: thumbRoot, p1, p2 };
    })();

    // Index Finger: Slender, elongated with double silver rings + LETHAL BLOOD-CRIMSON CLAW
    handFingers.index = createAnimeFinger('index', -0.35, 0.86, 0.58, 0.45, 0.36, 0.155, 0.135, 0.115, 0.095, -0.06, true);
    const idxRings1 = createDoubleSilverRingBand(0.155, 0.018, 0.045);
    idxRings1.position.set(0, 0.24, 0);
    handFingers.index.p1.add(idxRings1);
    const idxRings2 = createDoubleSilverRingBand(0.135, 0.018, 0.042);
    idxRings2.position.set(0, 0.20, 0);
    handFingers.index.p2.add(idxRings2);

    // Middle Finger: Dominant center digit ~1.65 length with double silver rings
    handFingers.middle = createAnimeFinger('middle', -0.08, 0.90, 0.66, 0.50, 0.40, 0.165, 0.145, 0.125, 0.10, 0.00, false);
    const midRings1 = createDoubleSilverRingBand(0.165, 0.020, 0.048);
    midRings1.position.set(0, 0.28, 0);
    handFingers.middle.p1.add(midRings1);
    const midRings2 = createDoubleSilverRingBand(0.145, 0.018, 0.044);
    midRings2.position.set(0, 0.22, 0);
    handFingers.middle.p2.add(midRings2);

    // Ring Finger: Slender digit with double silver rings + obsidian claw
    handFingers.ring = createAnimeFinger('ring', 0.18, 0.86, 0.60, 0.46, 0.38, 0.155, 0.135, 0.115, 0.095, 0.06, false);
    const ringRings1 = createDoubleSilverRingBand(0.155, 0.018, 0.045);
    ringRings1.position.set(0, 0.26, 0);
    handFingers.ring.p1.add(ringRings1);
    const ringRings2 = createDoubleSilverRingBand(0.135, 0.018, 0.042);
    ringRings2.position.set(0, 0.21, 0);
    handFingers.ring.p2.add(ringRings2);

    // Pinky Finger: Petite, elegant digit with silver ring + obsidian claw
    handFingers.pinky = createAnimeFinger('pinky', 0.42, 0.74, 0.46, 0.35, 0.28, 0.135, 0.115, 0.095, 0.075, 0.13, false);
    const pinkyRings = createDoubleSilverRingBand(0.135, 0.016, 0.040);
    pinkyRings.position.set(0, 0.18, 0);
    handFingers.pinky.p1.add(pinkyRings);

    // Set Initial Natural Resting Curvature
    applyAnatomicalRestPose();

    // 6.5 Volumetric Crimson Aura Energy Disc (Behind Hand for Supreme Visibility & Contrast)
    const auraCanvas = document.createElement('canvas');
    auraCanvas.width = 256;
    auraCanvas.height = 256;
    const aCtx = auraCanvas.getContext('2d');
    const aGrad = aCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    aGrad.addColorStop(0.00, 'rgba(255, 25, 65, 0.68)'); // Brilliant ruby red center
    aGrad.addColorStop(0.35, 'rgba(215, 18, 55, 0.42)');
    aGrad.addColorStop(0.68, 'rgba(135, 10, 32, 0.18)');
    aGrad.addColorStop(0.92, 'rgba(55, 5, 15, 0.05)');
    aGrad.addColorStop(1.00, 'rgba(0, 0, 0, 0)');
    aCtx.fillStyle = aGrad;
    aCtx.fillRect(0, 0, 256, 256);

    const auraTexture = new THREE.CanvasTexture(auraCanvas);
    const handAuraPlaneGeo = new THREE.PlaneGeometry(5.4, 6.6);
    const handAuraPlaneMat = new THREE.MeshBasicMaterial({
      map: auraTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.88
    });
    handBackAuraMesh = new THREE.Mesh(handAuraPlaneGeo, handAuraPlaneMat);
    handBackAuraMesh.position.set(-0.04, 0.25, -0.38);
    humanHandGroup.add(handBackAuraMesh);

    mainGroup.add(humanHandGroup);

    // 6.6 Glowing Energy Shards & Card Vortex
    vortexGroup = new THREE.Group();
    vortexShards = [];

    const shardGeo = new THREE.PlaneGeometry(0.35, 0.48);
    const shardMat = new THREE.MeshToonMaterial({
      color: 0xffdf88,
      emissive: 0x9e1b1b,
      emissiveIntensity: 0.75,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88
    });

    const vortexCount = 68;
    for (let i = 0; i < vortexCount; i++) {
      const mesh = new THREE.Mesh(shardGeo, shardMat.clone());
      const radius = 2.4 + Math.random() * 5.6;
      const angle = (i / vortexCount) * Math.PI * 6 + Math.random() * 0.5;
      const y = (Math.random() - 0.5) * 4.2;
      const z = (Math.random() - 0.5) * 3.0;

      mesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius + z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      vortexGroup.add(mesh);

      vortexShards.push({
        mesh,
        initRadius: radius,
        currentRadius: radius,
        angle,
        speed: 2.2 + Math.random() * 2.8,
        y,
        z,
        scale: 0.4 + Math.random() * 0.65
      });
    }
    mainGroup.add(vortexGroup);

    // 6.7 Anamorphic Crimson Blade Slash Flare (Cinematic Horizontal Light Streak)
    const flareCanvas = document.createElement('canvas');
    flareCanvas.width = 512;
    flareCanvas.height = 64;
    const fCtx = flareCanvas.getContext('2d');
    const fGrad = fCtx.createRadialGradient(256, 32, 0, 256, 32, 256);
    fGrad.addColorStop(0.00, 'rgba(255, 245, 220, 1.0)');  // Golden-white core
    fGrad.addColorStop(0.12, 'rgba(255, 30, 75, 0.95)');   // Brilliant crimson red
    fGrad.addColorStop(0.40, 'rgba(180, 10, 40, 0.40)');   // Deep blood aura
    fGrad.addColorStop(1.00, 'rgba(0, 0, 0, 0)');
    fCtx.fillStyle = fGrad;
    fCtx.fillRect(0, 0, 512, 64);

    const flareTex = new THREE.CanvasTexture(flareCanvas);
    const flareGeo = new THREE.PlaneGeometry(1.0, 0.28);
    const flareMat = new THREE.MeshBasicMaterial({
      map: flareTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0,
      side: THREE.DoubleSide
    });
    anamorphicFlareMesh = new THREE.Mesh(flareGeo, flareMat);
    anamorphicFlareMesh.position.set(-0.18, 0.32, 4.10);
    mainGroup.add(anamorphicFlareMesh);

    // 6.8 Razor-Thin Sovereign Shockwave Ring (Crimson & Gold Energy Wave)
    const shockwaveGeo = new THREE.RingGeometry(0.16, 0.20, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xff143c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    sovereignRingMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    sovereignRingMesh.position.set(-0.18, 0.32, 4.05);
    mainGroup.add(sovereignRingMesh);

    // 6.9 Sovereign Dark Crystal Embers (Gothic diamond shards, NO cartoon stars!)
    sovereignEmbersGroup = new THREE.Group();
    sovereignEmberData = [];

    const emberShape = new THREE.Shape();
    emberShape.moveTo(0, 0.16);
    emberShape.lineTo(0.028, 0);
    emberShape.lineTo(0, -0.16);
    emberShape.lineTo(-0.028, 0);
    emberShape.closePath();
    const emberGeo = new THREE.ShapeGeometry(emberShape);

    const emberCrimsonMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1
    });
    const emberGoldMat = new THREE.MeshBasicMaterial({
      color: 0xf5c678,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1
    });

    for (let i = 0; i < 42; i++) {
      const isGold = i % 3 === 0;
      const emberMesh = new THREE.Mesh(emberGeo, isGold ? emberGoldMat.clone() : emberCrimsonMat.clone());
      emberMesh.visible = false;
      sovereignEmbersGroup.add(emberMesh);
      sovereignEmberData.push({
        mesh: emberMesh,
        vx: 0,
        vy: 0,
        vz: 0,
        alpha: 0,
        rotSpeed: (Math.random() - 0.5) * 0.14,
        decay: 0.022 + Math.random() * 0.022
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
    
    const sakuraMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5b5c5,
      emissive: 0x4a1820,
      emissiveIntensity: 0.35,
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });

    const goldDustMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe28a,
      emissive: 0x8a5e0d,
      emissiveIntensity: 0.75,
      roughness: 0.2,
      metalness: 0.85,
      transparent: true,
      opacity: 0.88
    });

    const sphereGeo = new THREE.SphereGeometry(0.048, 8, 8);

    for (let i = 0; i < count; i++) {
      const isSakura = i % 3 !== 0;
      const mesh = new THREE.Mesh(
        isSakura ? petalGeo : sphereGeo,
        isSakura ? sakuraMaterial.clone() : goldDustMaterial.clone()
      );

      const x = (Math.random() - 0.5) * 24;
      const y = (Math.random() - 0.5) * 18;
      const z = (Math.random() - 0.5) * 14 - 1;

      mesh.position.set(x, y, z);
      mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);

      const scale = isSakura ? (0.35 + Math.random() * 0.45) : (0.4 + Math.random() * 0.8);
      mesh.scale.set(scale, scale, scale);

      particleSystem.add(mesh);

      particleData.push({
        mesh,
        baseY: y,
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
      return;
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
   * Triggers the High-Energy Finger Snap Burst
   */
  function triggerSnapBurst() {
    hasSnapped = true;

    // 1. Synthesize Web Audio Snap Sound (Authentic crisp finger-snap)
    playSnapChimeSound();

    // 2. Trigger 3D Card Rain ("mưa bài rơi xuống")
    triggerCardRain();

    // 3. Light flash spike & Bloom flare spike
    if (snapFlashLight) {
      snapFlashLight.intensity = 6.5;
      if (typeof gsap !== 'undefined') {
        gsap.to(snapFlashLight, { intensity: 0, duration: 0.65, ease: 'power2.out' });
      }
    }

    if (bloomPass && typeof gsap !== 'undefined') {
      gsap.fromTo(bloomPass,
        { strength: 2.4 },
        { strength: CONFIG.bloomStrength, duration: 0.85, ease: 'power2.out' }
      );
    }

    // 4. Anamorphic Crimson Blade Slash & Sovereign Shockwave Ring
    if (anamorphicFlareMesh) {
      anamorphicFlareMesh.material.opacity = 1.0;
      anamorphicFlareMesh.scale.set(0.1, 0.28, 1.0);
      if (typeof gsap !== 'undefined') {
        gsap.to(anamorphicFlareMesh.scale, { x: 32.0, y: 0.01, duration: 0.38, ease: 'power4.out' });
        gsap.to(anamorphicFlareMesh.material, { opacity: 0, duration: 0.38, ease: 'power2.out' });
      }
    }

    if (sovereignRingMesh) {
      sovereignRingMesh.material.opacity = 0.95;
      sovereignRingMesh.scale.set(0.1, 0.1, 0.1);
      if (typeof gsap !== 'undefined') {
        gsap.to(sovereignRingMesh.scale, { x: 22.0, y: 22.0, z: 22.0, duration: 0.65, ease: 'power3.out' });
        gsap.to(sovereignRingMesh.material, { opacity: 0, duration: 0.65, ease: 'power2.out' });
      }
    }

    // 5. Sovereign Dark Crystal Embers (Elegant diamond shards)
    for (let i = 0; i < sovereignEmberData.length; i++) {
      const s = sovereignEmberData[i];
      s.mesh.visible = true;
      s.mesh.position.set(-0.18, 0.32, 4.05);
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const speed = 0.14 + Math.random() * 0.26;

      s.vx = Math.cos(theta) * Math.cos(phi) * speed;
      s.vy = Math.sin(phi) * speed + 0.03;
      s.vz = Math.sin(theta) * Math.cos(phi) * speed;
      s.alpha = 1.0;
      if (s.mesh.material) {
        s.mesh.material.opacity = 1.0;
      }
      const initialScale = 0.8 + Math.random() * 0.5;
      s.mesh.scale.set(initialScale, initialScale, initialScale);
    }

    // 6. Notify DOM (Starts music immediately + 4 hero cards fly to home)
    if (onSnapCallback) {
      onSnapCallback();
    }

    // 7. Camera slight kinetic recoil (smooth impulse damped in render loop)
    cameraRecoilZ = -0.55;
  }

  /**
   * Synthesize crisp snap and mysterious sovereign resonance using Web Audio API
   */
  function playSnapChimeSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._jpcAudioCtx) window._jpcAudioCtx = new AudioCtx();
      const ctx = window._jpcAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const t = ctx.currentTime;

      // 1. Friction snap transient (Sharp Click Pop)
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(3200, t);
      clickFilter.Q.setValueAtTime(3.2, t);

      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(4200, t);
      clickOsc.frequency.exponentialRampToValueAtTime(180, t + 0.024);

      clickGain.gain.setValueAtTime(0.85, t);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.030);

      clickOsc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(t);
      clickOsc.stop(t + 0.032);

      // 2. Sovereign Sub-Bass Thump (Authoritative physical presence)
      const thumpOsc = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(140, t);
      thumpOsc.frequency.exponentialRampToValueAtTime(52, t + 0.09);

      thumpGain.gain.setValueAtTime(0.75, t);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(ctx.destination);
      thumpOsc.start(t);
      thumpOsc.stop(t + 0.13);

      // 3. Crisp Noise Burst (Acoustic Snap Release)
      const bufferSize = Math.floor(ctx.sampleRate * 0.022);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.20));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2600, t);
      noiseFilter.Q.setValueAtTime(1.8, t);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.55, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t);

      // 4. Mysterious Sovereign Resonance (Aristocratic low-mid crystal chord C#4 + G#4)
      setTimeout(() => {
        try {
          const rootOsc = ctx.createOscillator();
          const fifthOsc = ctx.createOscillator();
          const resFilter = ctx.createBiquadFilter();
          const resGain = ctx.createGain();

          resFilter.type = 'lowpass';
          resFilter.frequency.setValueAtTime(950, ctx.currentTime);

          rootOsc.type = 'triangle';
          rootOsc.frequency.setValueAtTime(277.18, ctx.currentTime); // C#4
          rootOsc.frequency.exponentialRampToValueAtTime(276.0, ctx.currentTime + 0.55);

          fifthOsc.type = 'sine';
          fifthOsc.frequency.setValueAtTime(415.30, ctx.currentTime); // G#4
          fifthOsc.frequency.exponentialRampToValueAtTime(414.0, ctx.currentTime + 0.55);

          resGain.gain.setValueAtTime(0.24, ctx.currentTime);
          resGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);

          rootOsc.connect(resFilter);
          fifthOsc.connect(resFilter);
          resFilter.connect(resGain);
          resGain.connect(ctx.destination);

          rootOsc.start(ctx.currentTime);
          fifthOsc.start(ctx.currentTime);
          rootOsc.stop(ctx.currentTime + 0.58);
          fifthOsc.stop(ctx.currentTime + 0.58);
        } catch (_) {}
      }, 15);
    } catch (_) {}
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

    // Dynamic breathing pulse on the Crimson Aura & Back Halo
    if (crimsonAuraMaterialRef) {
      crimsonAuraMaterialRef.opacity = 0.72 + Math.sin(elapsedTime * 3.8) * 0.12;
    }
    if (handBackAuraMesh) {
      handBackAuraMesh.material.opacity = 0.85 + Math.sin(elapsedTime * 3.2) * 0.12;
      const s = 1.0 + Math.sin(elapsedTime * 2.8) * 0.035;
      handBackAuraMesh.scale.set(s, s, 1);
    }

    // 8.2 BUTTERY-SMOOTH CONTINUOUS INTRO ANIMATION TIMELINE
    if (isIntroPlaying) {
      const progress = elapsedTime - introStartTime;

      // Phase 1: (0.0s -> 1.40s) Smooth Gathering & Convergence to Tension
      if (progress < 1.40) {
        const u = smoothstep(0, 1.35, progress);
        const easeU = easeInOutCubic(u);
        const breathe = Math.sin(progress * 3.2) * 0.02 * (1 - u);

        // Vortex energy shards spiral tightly into snap epicenter
        for (let i = 0; i < vortexShards.length; i++) {
          const vs = vortexShards[i];
          vs.angle += vs.speed * 0.04;
          vs.currentRadius = vs.initRadius * (1 - easeU * 0.90) + 0.22;
          vs.mesh.position.x = Math.cos(vs.angle) * vs.currentRadius;
          vs.mesh.position.z = Math.sin(vs.angle) * vs.currentRadius + vs.z * (1 - easeU);
          vs.mesh.position.y = vs.y * (1 - easeU * 0.88) + Math.sin(vs.angle * 2.0) * 0.15;
          vs.mesh.rotation.x += 0.04;
          vs.mesh.rotation.y += 0.06;
          vs.mesh.scale.setScalar(vs.scale * (1 - easeU * 0.35));
        }

        // Seamless continuous interpolation from REST POSE to TENSION POSE
        if (handFingers.index) {
          handFingers.index.p1.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.index.p1X, TENSION_POSE.index.p1X, easeU) + breathe;
          handFingers.index.p2.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.index.p2X, TENSION_POSE.index.p2X, easeU) + breathe;
          handFingers.index.p3.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.index.p3X, TENSION_POSE.index.p3X, easeU);
          handFingers.index.root.rotation.z = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.index.rootZ, TENSION_POSE.index.rootZ, easeU);
        }
        if (handFingers.middle) {
          handFingers.middle.p1.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.middle.p1X, TENSION_POSE.middle.p1X, easeU) + breathe;
          handFingers.middle.p2.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.middle.p2X, TENSION_POSE.middle.p2X, easeU) + breathe;
          handFingers.middle.p3.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.middle.p3X, TENSION_POSE.middle.p3X, easeU);
          handFingers.middle.root.rotation.z = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.middle.rootZ, TENSION_POSE.middle.rootZ, easeU);
        }
        if (handFingers.ring) {
          handFingers.ring.p1.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.ring.p1X, TENSION_POSE.ring.p1X, easeU) + breathe;
          handFingers.ring.p2.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.ring.p2X, TENSION_POSE.ring.p2X, easeU) + breathe;
          handFingers.ring.p3.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.ring.p3X, TENSION_POSE.ring.p3X, easeU);
          handFingers.ring.root.rotation.z = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.ring.rootZ, TENSION_POSE.ring.rootZ, easeU);
        }
        if (handFingers.pinky) {
          handFingers.pinky.p1.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.pinky.p1X, TENSION_POSE.pinky.p1X, easeU) + breathe;
          handFingers.pinky.p2.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.pinky.p2X, TENSION_POSE.pinky.p2X, easeU) + breathe;
          handFingers.pinky.p3.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.pinky.p3X, TENSION_POSE.pinky.p3X, easeU);
          handFingers.pinky.root.rotation.z = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.pinky.rootZ, TENSION_POSE.pinky.rootZ, easeU);
        }
        if (handFingers.thumb) {
          handFingers.thumb.p1.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.thumb.p1X, TENSION_POSE.thumb.p1X, easeU);
          handFingers.thumb.p1.rotation.z = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.thumb.p1Z, TENSION_POSE.thumb.p1Z, easeU);
          handFingers.thumb.p2.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.thumb.p2X, TENSION_POSE.thumb.p2X, easeU);
        }

        if (humanHandGroup) {
          humanHandGroup.rotation.x = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.hand.rotX, TENSION_POSE.hand.rotX, easeU);
          humanHandGroup.rotation.y = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.hand.rotY, TENSION_POSE.hand.rotY, easeU);
          humanHandGroup.rotation.z = THREE.MathUtils.lerp(ANATOMICAL_REST_POSE.hand.rotZ, TENSION_POSE.hand.rotZ, easeU);
        }
      }
      // Phase 2: (1.40s -> 1.75s) Elastic Stance Tension & Micro-Vibration
      else if (progress >= 1.40 && progress < 1.75) {
        // High-velocity orbital spin around contact point (no freeze!)
        for (let i = 0; i < vortexShards.length; i++) {
          const vs = vortexShards[i];
          vs.angle += vs.speed * 0.07;
          vs.mesh.position.x = Math.cos(vs.angle) * 0.22;
          vs.mesh.position.z = Math.sin(vs.angle) * 0.22;
          vs.mesh.position.y = Math.sin(vs.angle * 3.0) * 0.12;
          vs.mesh.rotation.x += 0.08;
          vs.mesh.rotation.y += 0.10;
        }

        // Delicate, authentic muscle tension quiver
        const quiver = Math.sin((progress - 1.40) * 38.0) * 0.005;

        if (handFingers.middle) {
          handFingers.middle.p1.rotation.x = TENSION_POSE.middle.p1X + quiver;
          handFingers.middle.p2.rotation.x = TENSION_POSE.middle.p2X + quiver;
          handFingers.middle.p3.rotation.x = TENSION_POSE.middle.p3X;
          handFingers.middle.root.rotation.z = TENSION_POSE.middle.rootZ;
        }
        if (handFingers.thumb) {
          handFingers.thumb.p1.rotation.x = TENSION_POSE.thumb.p1X + quiver * 0.8;
          handFingers.thumb.p1.rotation.z = TENSION_POSE.thumb.p1Z;
          handFingers.thumb.p2.rotation.x = TENSION_POSE.thumb.p2X;
        }
        if (handFingers.index) {
          handFingers.index.p1.rotation.x = TENSION_POSE.index.p1X;
          handFingers.index.p2.rotation.x = TENSION_POSE.index.p2X;
          handFingers.index.p3.rotation.x = TENSION_POSE.index.p3X;
          handFingers.index.root.rotation.z = TENSION_POSE.index.rootZ;
        }
        if (handFingers.ring) {
          handFingers.ring.p1.rotation.x = TENSION_POSE.ring.p1X;
          handFingers.ring.p2.rotation.x = TENSION_POSE.ring.p2X;
          handFingers.ring.p3.rotation.x = TENSION_POSE.ring.p3X;
          handFingers.ring.root.rotation.z = TENSION_POSE.ring.rootZ;
        }
        if (handFingers.pinky) {
          handFingers.pinky.p1.rotation.x = TENSION_POSE.pinky.p1X;
          handFingers.pinky.p2.rotation.x = TENSION_POSE.pinky.p2X;
          handFingers.pinky.p3.rotation.x = TENSION_POSE.pinky.p3X;
          handFingers.pinky.root.rotation.z = TENSION_POSE.pinky.rootZ;
        }

        if (humanHandGroup) {
          humanHandGroup.rotation.x = TENSION_POSE.hand.rotX;
          humanHandGroup.rotation.y = TENSION_POSE.hand.rotY;
          humanHandGroup.rotation.z = TENSION_POSE.hand.rotZ;
          humanHandGroup.position.z = 3.8;
        }
      }
      // Phase 3: (1.75s -> 2.15s) High-Speed Snap Impact & Damped Recoil
      else if (progress >= 1.75 && progress < 2.15) {
        if (!hasSnapped) {
          triggerSnapBurst();
        }

        if (vortexGroup && vortexGroup.visible) {
          vortexGroup.visible = false;
        }

        const snapT = progress - 1.75;
        const strikeDuration = 0.075;

        if (snapT <= strikeDuration) {
          // Explosive strike acceleration onto thenar eminence
          const s = snapT / strikeDuration;
          const sEase = s * s * (3 - 2 * s);

          if (handFingers.middle) {
            handFingers.middle.p1.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.middle.p1X, IMPACT_POSE.middle.p1X, sEase);
            handFingers.middle.p2.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.middle.p2X, IMPACT_POSE.middle.p2X, sEase);
            handFingers.middle.p3.rotation.x = THREE.MathUtils.lerp(TENSION_POSE.middle.p3X, IMPACT_POSE.middle.p3X, sEase);
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
          // Beautiful critically-damped biological recoil (smooth 1.5 cycles, no jittering)
          const tau = snapT - strikeDuration;
          const bounceMiddle = Math.exp(-tau * 14.0) * Math.sin(tau * 26.0) * 0.08;
          const bounceThumb = Math.exp(-tau * 12.0) * Math.sin(tau * 22.0) * 0.05;
          const bounceHand = Math.exp(-tau * 15.0) * Math.sin(tau * 24.0) * 0.12;

          if (handFingers.middle) {
            handFingers.middle.p1.rotation.x = IMPACT_POSE.middle.p1X + bounceMiddle;
            handFingers.middle.p2.rotation.x = IMPACT_POSE.middle.p2X + bounceMiddle * 0.7;
            handFingers.middle.p3.rotation.x = IMPACT_POSE.middle.p3X;
            handFingers.middle.root.rotation.z = IMPACT_POSE.middle.rootZ;
          }
          if (handFingers.thumb) {
            handFingers.thumb.p1.rotation.z = IMPACT_POSE.thumb.p1Z + bounceThumb;
            handFingers.thumb.p1.rotation.x = IMPACT_POSE.thumb.p1X;
            handFingers.thumb.p2.rotation.x = IMPACT_POSE.thumb.p2X;
          }
          if (handFingers.index) {
            handFingers.index.p1.rotation.x = IMPACT_POSE.index.p1X + bounceMiddle * 0.3;
            handFingers.index.p2.rotation.x = IMPACT_POSE.index.p2X + bounceMiddle * 0.2;
          }

          if (humanHandGroup) {
            humanHandGroup.position.z = 3.8 - bounceHand;
            humanHandGroup.rotation.x = IMPACT_POSE.hand.rotX + bounceHand * 0.4;
            humanHandGroup.rotation.y = IMPACT_POSE.hand.rotY;
            humanHandGroup.rotation.z = IMPACT_POSE.hand.rotZ + bounceHand * 0.2;
          }
        }
      }
      // Phase 4: (2.15s -> 3.5s) Post-Snap Drift & Seamless Hand Dissolution
      else if (progress >= 2.15 && progress <= introDuration) {
        const t = (progress - 2.15) / (introDuration - 2.15);
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

        // Bàn tay lùi dần vào chiều sâu z và mờ dần opacity, tan biến hoàn toàn
        if (humanHandGroup) {
          humanHandGroup.position.z = 3.8 - easeT * 9.5;
          humanHandGroup.position.y = -0.32 - easeT * 1.8;
          humanHandGroup.scale.setScalar(1.30 * Math.max(0, 1 - easeT));
          if (t >= 0.96) {
            humanHandGroup.visible = false;
          }
        }

        if (crimsonAuraMaterialRef) {
          crimsonAuraMaterialRef.opacity = 0.75 * fade;
        }
        if (handBackAuraMesh && handBackAuraMesh.material) {
          handBackAuraMesh.material.opacity = 0.85 * fade;
        }

        if (vortexGroup && vortexGroup.visible) {
          vortexGroup.visible = false;
        }
      }
      // Phase 5: Intro Complete - Bàn tay biến mất sạch sẽ, về UI Home
      else if (progress > introDuration) {
        isIntroPlaying = false;
        if (humanHandGroup) humanHandGroup.visible = false;
        if (vortexGroup) vortexGroup.visible = false;
        if (onIntroCompleteCallback) {
          onIntroCompleteCallback();
          onIntroCompleteCallback = null;
        }
      }
    }


    // 8.3 Animate Sovereign Dark Crystal Embers (Physics, Drag & Alpha Fade)
    if (sovereignEmbersGroup) {
      for (let i = 0; i < sovereignEmberData.length; i++) {
        const s = sovereignEmberData[i];
        if (s.mesh.visible) {
          s.mesh.position.x += s.vx;
          s.mesh.position.y += s.vy;
          s.mesh.position.z += s.vz;
          s.mesh.rotation.z += s.rotSpeed || 0.06;
          s.vx *= 0.96;
          s.vz *= 0.96;
          s.vy -= 0.0035;
          s.alpha -= s.decay;
          if (s.mesh.material) {
            s.mesh.material.opacity = Math.max(0, s.alpha);
          }
          const scale = Math.max(0.01, s.alpha * 1.1);
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
          const fade = Math.max(0, (c.mesh.position.y - (-8)) / 7);
          c.mesh.material.opacity = Math.min(0.95, fade * 0.95);
        }

        if (c.mesh.position.y < -8) {
          c.active = false;
          c.mesh.visible = false;
        }
      }
      if (!anyActive && !isIntroPlaying) {
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

      if (m.position.y < -10) {
        m.position.y = 10;
        m.position.x = (Math.random() - 0.5) * 24;
        m.position.z = (Math.random() - 0.5) * 14 - 1;
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

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
       * Instant skip to settled ambient state
       */
      finishInstant3D: function () {
        isIntroPlaying = false;
        if (humanHandGroup) humanHandGroup.visible = false;
        if (vortexGroup) vortexGroup.visible = false;
        if (cardRainGroup) cardRainGroup.visible = false;
        if (sovereignRingMesh && sovereignRingMesh.material) sovereignRingMesh.material.opacity = 0;
        if (anamorphicFlareMesh && anamorphicFlareMesh.material) anamorphicFlareMesh.material.opacity = 0;
        if (sovereignEmbersGroup) sovereignEmbersGroup.visible = false;
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
        if (typeof gsap !== 'undefined') {
          if (goldLight) {
            gsap.to(goldLight, {
              intensity: 3.8,
              duration: 0.18,
              yoyo: true,
              repeat: 1
            });
          }
          if (bloomPass) {
            gsap.to(bloomPass, {
              strength: 1.4,
              duration: 0.18,
              yoyo: true,
              repeat: 1
            });
          }
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
        const isHome = viewId === 'home' || !viewId;
        const targetOpacity = isHome ? 0.85 : 0.25;

        if (typeof gsap !== 'undefined' && canvas) {
          gsap.to(canvas, {
            opacity: targetOpacity,
            duration: 0.8,
            ease: 'power2.out'
          });
        }
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
