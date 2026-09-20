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
    knotColor: 0xd4af37,
    knotEmissive: 0x3d2005,
    accentRed: 0x8a1c1c,
    goldLight: 0xf6d382,
    particleCount: window.innerWidth <= 768 ? 95 : 185,
    bloomStrength: 0.68,
    bloomRadius: 0.45,
    bloomThreshold: 0.28
  };

  // Core Engine State
  let canvas, renderer, scene, camera, controls;
  let composer = null, bloomPass = null;
  let mainGroup, heroKnotGroup, particleSystem;
  let humanHandGroup, handFingers = {}, thenarPad, hypothenarPad, wristMesh;
  let vortexGroup, shockwaveMesh, burstSparks;
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
  const clock = new THREE.Clock();

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
  let burstSparkData = [];

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
    createHero3DObjects();
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
    ambientLight = new THREE.AmbientLight(0xfff5ea, 0.95);
    scene.add(ambientLight);

    goldLight = new THREE.PointLight(CONFIG.goldLight, 2.6, 40, 1.2);
    goldLight.position.set(4.5, 5.5, 7.5);
    scene.add(goldLight);

    rimLight = new THREE.PointLight(0x991b1b, 3.5, 32, 1.4);
    rimLight.position.set(-5.5, -3.5, -2.5);
    scene.add(rimLight);

    skinFillLight = new THREE.DirectionalLight(0xffeedb, 0.8);
    skinFillLight.position.set(1.5, 3.0, 8.0);
    scene.add(skinFillLight);

    snapFlashLight = new THREE.PointLight(0xfffae8, 0, 48, 2);
    snapFlashLight.position.set(0, 0, 4);
    scene.add(snapFlashLight);
  }

  /**
   * 4. 3D HERO SACRED GEOMETRY (Musubi Knot & Celestial Rings)
   */
  function createHero3DObjects() {
    heroKnotGroup = new THREE.Group();
    heroKnotGroup.position.set(0, 0, 0);

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: CONFIG.knotColor,
      emissive: CONFIG.knotEmissive,
      emissiveIntensity: 0.45,
      roughness: 0.18,
      metalness: 0.90
    });

    const innerGlowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd97d,
      emissive: 0x6a4005,
      emissiveIntensity: 0.5,
      roughness: 0.1,
      metalness: 0.95,
      wireframe: true,
      transparent: true,
      opacity: 0.40
    });

    const knotGeo = new THREE.TorusKnotGeometry(1.65, 0.36, 128, 32, 2, 3);
    const knotMesh = new THREE.Mesh(knotGeo, goldMaterial);
    knotMesh.name = 'knotSolid';
    heroKnotGroup.add(knotMesh);

    const ringGeo1 = new THREE.TorusGeometry(3.0, 0.025, 16, 100);
    const ring1 = new THREE.Mesh(ringGeo1, innerGlowMaterial);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    ring1.name = 'ringOuter1';
    heroKnotGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.8, 0.018, 16, 100);
    const ring2 = new THREE.Mesh(ringGeo2, goldMaterial);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    ring2.name = 'ringOuter2';
    heroKnotGroup.add(ring2);

    heroKnotGroup.scale.set(0.001, 0.001, 0.001);
    heroKnotGroup.visible = false;
    mainGroup.add(heroKnotGroup);
  }

  /**
   * 5. ANIME 2D CEL-SHADED MATERIALS & INK OUTLINE ENGINE
   */
  function createAnimeCelMaterials() {
    // 5.1 4-Step Discrete Quantized Anime Cel Gradient Ramp
    const rampCanvas = document.createElement('canvas');
    rampCanvas.width = 4;
    rampCanvas.height = 1;
    const rCtx = rampCanvas.getContext('2d');
    
    // Anime cel color steps: [Deep Shadow, Soft Shadow, Midtone Skin, Key Highlight]
    const animeColors = ['#bf6e56', '#df947e', '#f8d7c2', '#fff6ee'];
    for (let i = 0; i < 4; i++) {
      rCtx.fillStyle = animeColors[i];
      rCtx.fillRect(i, 0, 1, 1);
    }

    const gradientMap = new THREE.CanvasTexture(rampCanvas);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.generateMipmaps = false;

    // 5.2 Deep Maroon-Ink Anime Cel Outline Material (Inverted Hull)
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x220909, // Deep anime manga ink contour
      side: THREE.BackSide
    });

    // 5.3 Anime Toon Skin Material
    const animeSkinMaterial = new THREE.MeshToonMaterial({
      color: 0xfce1d0,
      gradientMap: gradientMap,
      emissive: 0x3d1212,
      emissiveIntensity: 0.24
    });

    // 5.4 Anime Rosy Palmar Material
    const animePalmMaterial = new THREE.MeshToonMaterial({
      color: 0xf5beaa,
      gradientMap: gradientMap,
      emissive: 0x4a1818,
      emissiveIntensity: 0.30
    });

    // 5.5 Anime Keratin Nail Material with Crisp Glint
    const animeNailMaterial = new THREE.MeshToonMaterial({
      color: 0xfff0f6,
      gradientMap: gradientMap,
      emissive: 0x441010,
      emissiveIntensity: 0.18
    });

    return { animeSkinMaterial, animePalmMaterial, animeNailMaterial, outlineMaterial };
  }

  /**
   * Helper: Attach Inverted Hull Anime Line-Art Outline
   */
  function buildAnimeMesh(geometry, fillMaterial, outlineMaterial, outlineScale = 1.055) {
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
   * 6. 2D ANIME CEL-SHADED HAND & DYNAMIC MANA VORTEX BUILDER
   */
  function createRealisticHumanHandAndVortex() {
    humanHandGroup = new THREE.Group();
    // Positioned in aesthetic 3/4 anime character posture
    humanHandGroup.position.set(0.2, -0.35, 3.8);
    humanHandGroup.rotation.set(-0.18, 0.42, -0.12);
    humanHandGroup.scale.set(1.42, 1.42, 1.42);

    const { animeSkinMaterial, animePalmMaterial, animeNailMaterial, outlineMaterial } = createAnimeCelMaterials();

    // 6.1 Anime Slender Forearm & Wrist
    const forearmGeo = new THREE.CylinderGeometry(0.42, 0.54, 1.6, 24);
    forearmGeo.computeVertexNormals();
    const forearmObj = buildAnimeMesh(forearmGeo, animeSkinMaterial, outlineMaterial, 1.050);
    wristMesh = forearmObj.fillMesh;
    forearmObj.group.position.set(0.12, -1.15, -0.08);
    forearmObj.group.rotation.z = -0.06;
    humanHandGroup.add(forearmObj.group);

    // Carpal Wrist Joint
    const wristJointGeo = new THREE.SphereGeometry(0.46, 24, 20);
    const wristJointObj = buildAnimeMesh(wristJointGeo, animeSkinMaterial, outlineMaterial, 1.052);
    wristJointObj.group.position.set(0.04, -0.42, 0);
    wristJointObj.group.scale.set(1.06, 0.72, 0.88);
    humanHandGroup.add(wristJointObj.group);

    // 6.2 Anime Sculpted Palm with Clean 2D Cel Contours
    const palmGeo = new THREE.BoxGeometry(1.24, 1.18, 0.44, 6, 6, 6);
    const pPos = palmGeo.attributes.position;
    for (let i = 0; i < pPos.count; i++) {
      const px = pPos.getX(i);
      const py = pPos.getY(i);
      const pz = pPos.getZ(i);

      if (pz > 0 && Math.abs(px) < 0.36 && py > -0.22 && py < 0.32) {
        pPos.setZ(i, pz - 0.10);
      }
      if (Math.abs(px) > 0.42 && pz > 0) {
        pPos.setZ(i, pz - 0.05);
      }
    }
    palmGeo.computeVertexNormals();
    const palmObj = buildAnimeMesh(palmGeo, animePalmMaterial, outlineMaterial, 1.048);
    palmObj.group.position.set(0, 0.08, 0);
    humanHandGroup.add(palmObj.group);

    // Anime Thenar Eminence (Gò mô cái - Fleshy thumb muscle)
    const thenarGeo = new THREE.SphereGeometry(0.40, 22, 18);
    thenarPad = new THREE.Mesh(thenarGeo, animePalmMaterial);
    const thenarOutline = new THREE.Mesh(thenarGeo, outlineMaterial);
    thenarOutline.scale.set(1.052, 1.052, 1.052);
    const thenarGroup = new THREE.Group();
    thenarGroup.add(thenarPad);
    thenarGroup.add(thenarOutline);
    thenarGroup.position.set(-0.42, -0.12, 0.18);
    thenarGroup.scale.set(1.20, 1.42, 1.02);
    thenarGroup.rotation.z = -0.34;
    humanHandGroup.add(thenarGroup);

    // Anime Hypothenar Eminence (Gò mô út)
    const hypothenarGeo = new THREE.SphereGeometry(0.32, 20, 16);
    hypothenarPad = new THREE.Mesh(hypothenarGeo, animePalmMaterial);
    const hypothenarOutline = new THREE.Mesh(hypothenarGeo, outlineMaterial);
    hypothenarOutline.scale.set(1.052, 1.052, 1.052);
    const hypothenarGroup = new THREE.Group();
    hypothenarGroup.add(hypothenarPad);
    hypothenarGroup.add(hypothenarOutline);
    hypothenarGroup.position.set(0.44, -0.18, 0.12);
    hypothenarGroup.scale.set(0.92, 1.46, 0.86);
    humanHandGroup.add(hypothenarGroup);

    // Anime Knuckle Ridge & Interdigital Web Space
    const knucklePadGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.06, 16);
    knucklePadGeo.computeVertexNormals();
    const knucklePadObj = buildAnimeMesh(knucklePadGeo, animePalmMaterial, outlineMaterial, 1.050);
    knucklePadObj.group.position.set(0, 0.52, 0.13);
    knucklePadObj.group.rotation.z = Math.PI / 2;
    humanHandGroup.add(knucklePadObj.group);

    // 6.3 Anime Slender Phalanx Builder with Ink Contours & Highlights
    function createAnimePhalanx(radBase, radTip, length, isTip) {
      const group = new THREE.Group();

      // Slender anime finger silhouette profile
      const points = [];
      const segments = 12;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = t * length;
        const waist = Math.sin(t * Math.PI) * 0.14;
        const r = THREE.MathUtils.lerp(radBase, radTip, t) * (1.0 - waist);
        points.push(new THREE.Vector2(r, y));
      }

      const latheGeo = new THREE.LatheGeometry(points, 20);
      latheGeo.computeVertexNormals();
      const latheObj = buildAnimeMesh(latheGeo, animeSkinMaterial, outlineMaterial, 1.058);
      group.add(latheObj.group);

      // Smooth Anime Joint Capsule (Prevents joint seams when bending)
      const jointGeo = new THREE.SphereGeometry(radBase * 1.02, 16, 14);
      const jointObj = buildAnimeMesh(jointGeo, animeSkinMaterial, outlineMaterial, 1.055);
      group.add(jointObj.group);

      // Ventral Soft Anime Pulp Pad
      const pulpGeo = new THREE.SphereGeometry(radBase * 0.90, 14, 12);
      const pulpMesh = new THREE.Mesh(pulpGeo, animePalmMaterial);
      pulpMesh.position.set(0, length * 0.50, radBase * 0.35);
      pulpMesh.scale.set(0.85, length * 0.80, 0.70);
      group.add(pulpMesh);

      // Anime Fingertip & Glinting Nail
      if (isTip) {
        const tipDomeGeo = new THREE.SphereGeometry(radTip, 16, 16);
        const tipDomeObj = buildAnimeMesh(tipDomeGeo, animeSkinMaterial, outlineMaterial, 1.058);
        tipDomeObj.group.position.set(0, length, 0);
        group.add(tipDomeObj.group);

        const tipPulpGeo = new THREE.SphereGeometry(radTip * 1.12, 14, 14);
        const tipPulp = new THREE.Mesh(tipPulpGeo, animePalmMaterial);
        tipPulp.position.set(0, length * 0.78, radTip * 0.44);
        tipPulp.scale.set(0.90, 1.20, 0.92);
        group.add(tipPulp);

        // Anime 2D Curved Keratin Nail with Cel Glint
        const nailGeo = new THREE.CylinderGeometry(radTip * 0.88, radTip * 0.92, length * 0.58, 14, 1, false, -Math.PI * 0.40, Math.PI * 0.80);
        nailGeo.computeVertexNormals();
        const nailObj = buildAnimeMesh(nailGeo, animeNailMaterial, outlineMaterial, 1.055);
        nailObj.group.position.set(0, length * 0.70, -radTip * 0.08);
        nailObj.group.rotation.y = Math.PI;
        nailObj.group.rotation.x = -0.10;
        group.add(nailObj.group);
      }

      return group;
    }

    function createAnimeFinger(name, rootX, rootY, l1, l2, l3, r1, r2, r3, r4, restSpread = 0) {
      const root = new THREE.Group();
      root.position.set(rootX, rootY, 0.02);
      root.rotation.z = restSpread;

      const p1 = createAnimePhalanx(r1, r2, l1, false);
      root.add(p1);

      const p2 = createAnimePhalanx(r2, r3, l2, false);
      p2.position.set(0, l1, 0);
      p1.add(p2);

      const p3 = createAnimePhalanx(r3, r4, l3, true);
      p3.position.set(0, l2, 0);
      p2.add(p3);

      humanHandGroup.add(root);

      return { root, p1, p2, p3 };
    }

    // 6.4 5 Elegant Anime Digits (Slender Aesthetic Proportions)
    handFingers.thumb = (function () {
      const thumbRoot = new THREE.Group();
      thumbRoot.position.set(-0.52, -0.06, 0.15);
      thumbRoot.rotation.set(0.35, 0.45, 0.58);

      const p1 = createAnimePhalanx(0.23, 0.20, 0.56, false);
      thumbRoot.add(p1);

      const p2 = createAnimePhalanx(0.20, 0.17, 0.48, true);
      p2.position.set(0, 0.56, 0);
      p1.add(p2);

      humanHandGroup.add(thumbRoot);
      return { root: thumbRoot, p1, p2 };
    })();

    handFingers.index  = createAnimeFinger('index',  -0.38, 0.56, 0.52, 0.42, 0.30, 0.165, 0.145, 0.130, 0.115, -0.07);
    handFingers.middle = createAnimeFinger('middle', -0.12, 0.62, 0.58, 0.48, 0.34, 0.175, 0.158, 0.140, 0.122,  0.00);
    handFingers.ring   = createAnimeFinger('ring',    0.16, 0.56, 0.54, 0.44, 0.31, 0.165, 0.145, 0.130, 0.115,  0.06);
    handFingers.pinky  = createAnimeFinger('pinky',   0.42, 0.47, 0.42, 0.34, 0.24, 0.140, 0.125, 0.110, 0.095,  0.13);

    mainGroup.add(humanHandGroup);

    // 6.5 Anime Glowing Golden Card & Mana Vortex
    vortexGroup = new THREE.Group();
    vortexShards = [];

    const shardGeo = new THREE.PlaneGeometry(0.38, 0.52);
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

    // 6.6 2D Anime Golden Shockwave Burst Ring
    const shockwaveGeo = new THREE.RingGeometry(0.12, 0.46, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xfff0a8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.position.set(-0.25, 0.25, 4.0);
    mainGroup.add(shockwaveMesh);

    // 6.7 4-Point Anime Starburst Sparkles (✦ Manga / Anime Spark Stars)
    burstSparks = new THREE.Group();
    burstSparkData = [];

    // 4-point anime star geometry
    const starShape = new THREE.Shape();
    starShape.moveTo(0, 0.22);
    starShape.lineTo(0.04, 0.04);
    starShape.lineTo(0.22, 0);
    starShape.lineTo(0.04, -0.04);
    starShape.lineTo(0, -0.22);
    starShape.lineTo(-0.04, -0.04);
    starShape.lineTo(-0.22, 0);
    starShape.lineTo(-0.04, 0.04);
    starShape.closePath();

    const animeStarGeo = new THREE.ShapeGeometry(starShape);
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xfffae0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1
    });

    for (let i = 0; i < 90; i++) {
      const spark = new THREE.Mesh(animeStarGeo, sparkMat.clone());
      spark.visible = false;
      burstSparks.add(spark);
      burstSparkData.push({
        mesh: spark,
        vx: 0,
        vy: 0,
        vz: 0,
        alpha: 0,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        decay: 0.026 + Math.random() * 0.026
      });
    }
    mainGroup.add(burstSparks);
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
      humanHandGroup.scale.set(1.42, 1.42, 1.42);
      humanHandGroup.position.set(0.2, -0.35, 3.8);
      humanHandGroup.rotation.set(-0.18, 0.42, -0.12);
    }
    if (vortexGroup) {
      vortexGroup.visible = true;
    }
    if (heroKnotGroup) {
      heroKnotGroup.visible = false;
      heroKnotGroup.scale.set(0.001, 0.001, 0.001);
    }
  }

  /**
   * Triggers the High-Energy Finger Snap Burst
   */
  function triggerSnapBurst() {
    hasSnapped = true;

    // 1. Synthesize Web Audio Snap Chime
    playSnapChimeSound();

    // 2. Light flash spike & Bloom flare spike
    if (snapFlashLight) {
      snapFlashLight.intensity = 6.2;
      if (typeof gsap !== 'undefined') {
        gsap.to(snapFlashLight, { intensity: 0, duration: 0.65, ease: 'power2.out' });
      }
    }

    if (bloomPass && typeof gsap !== 'undefined') {
      gsap.fromTo(bloomPass,
        { strength: 2.2 },
        { strength: CONFIG.bloomStrength, duration: 0.85, ease: 'power2.out' }
      );
    }

    // 3. Shockwave ring expansion
    if (shockwaveMesh) {
      shockwaveMesh.material.opacity = 0.95;
      shockwaveMesh.scale.set(0.1, 0.1, 0.1);
      if (typeof gsap !== 'undefined') {
        gsap.to(shockwaveMesh.scale, { x: 15.0, y: 15.0, z: 15.0, duration: 0.75, ease: 'power3.out' });
        gsap.to(shockwaveMesh.material, { opacity: 0, duration: 0.75, ease: 'power2.out' });
      }
    }

    // 4. Radial Spark Particles
    for (let i = 0; i < burstSparkData.length; i++) {
      const s = burstSparkData[i];
      s.mesh.visible = true;
      s.mesh.position.set(-0.25, 0.25, 4.0);
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const speed = 0.18 + Math.random() * 0.35;

      s.vx = Math.cos(theta) * Math.cos(phi) * speed;
      s.vy = Math.sin(phi) * speed + 0.04;
      s.vz = Math.sin(theta) * Math.cos(phi) * speed;
      s.alpha = 1.0;
    }

    // 5. Notify DOM (Cards fly out from center in HTML/CSS)
    if (onSnapCallback) {
      onSnapCallback();
    }

    // 6. Camera slight kinetic recoil
    if (typeof gsap !== 'undefined' && camera) {
      gsap.fromTo(camera.position, 
        { z: 13.0 }, 
        { z: 14, duration: 0.55, ease: 'elastic.out(1.1, 0.35)' }
      );
    }
  }

  /**
   * Synthesize crisp snap and magical sparkle sound using Web Audio API
   */
  function playSnapChimeSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!window._jpcAudioCtx) window._jpcAudioCtx = new AudioCtx();
      const ctx = window._jpcAudioCtx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(950, ctx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(3600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.065);

      gain.gain.setValueAtTime(0.40, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.085);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.09);

      // Shimmering Golden Chime
      setTimeout(() => {
        try {
          const chimeOsc = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(1580, ctx.currentTime);
          chimeOsc.frequency.exponentialRampToValueAtTime(3160, ctx.currentTime + 0.38);
          chimeGain.gain.setValueAtTime(0.14, ctx.currentTime);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.48);
          chimeOsc.connect(chimeGain);
          chimeGain.connect(ctx.destination);
          chimeOsc.start(ctx.currentTime);
          chimeOsc.stop(ctx.currentTime + 0.5);
        } catch (_) {}
      }, 30);
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
    camera.position.z = 14 + scrollZOffset;
    camera.lookAt(0, scrollYOffset * 0.3, 0);

    if (goldLight) {
      goldLight.position.x = 4.5 + mouse.x * 2.5;
      goldLight.position.y = 5.5 - mouse.y * 2.5 + scrollYOffset;
    }

    // 8.2 INTRO ANIMATION TIMELINE
    if (isIntroPlaying) {
      const progress = elapsedTime - introStartTime;

      // Phase 1: (0.0s -> 1.35s) Swirl & Hand Gathering
      if (progress < 1.35) {
        const p = Math.min(1, progress / 1.30);

        for (let i = 0; i < vortexShards.length; i++) {
          const vs = vortexShards[i];
          vs.angle += vs.speed * 0.038;
          vs.currentRadius = vs.initRadius * (1 - p * 0.88) + 0.28;
          vs.mesh.position.x = Math.cos(vs.angle) * vs.currentRadius;
          vs.mesh.position.z = Math.sin(vs.angle) * vs.currentRadius + vs.z * (1 - p);
          vs.mesh.position.y = vs.y * (1 - p * 0.9) + Math.sin(vs.angle * 2) * 0.2;
          vs.mesh.rotation.x += 0.04;
          vs.mesh.rotation.y += 0.06;
          vs.mesh.scale.setScalar(vs.scale * (1 - p * 0.5));
        }

        const waveP = easeInOutCubic(p);
        if (handFingers.index) {
          handFingers.index.p1.rotation.x = waveP * 0.55;
          handFingers.index.p2.rotation.x = waveP * 0.65;
          handFingers.index.p3.rotation.x = waveP * 0.45;
        }
        if (handFingers.middle) {
          handFingers.middle.p1.rotation.x = waveP * 0.60;
          handFingers.middle.p2.rotation.x = waveP * 0.70;
          handFingers.middle.p3.rotation.x = waveP * 0.50;
        }
        if (handFingers.ring) {
          handFingers.ring.p1.rotation.x = waveP * 0.75;
          handFingers.ring.p2.rotation.x = waveP * 0.85;
          handFingers.ring.p3.rotation.x = waveP * 0.60;
        }
        if (handFingers.pinky) {
          handFingers.pinky.p1.rotation.x = waveP * 0.85;
          handFingers.pinky.p2.rotation.x = waveP * 0.95;
          handFingers.pinky.p3.rotation.x = waveP * 0.65;
        }
        if (handFingers.thumb) {
          handFingers.thumb.p1.rotation.x = waveP * 0.42;
          handFingers.thumb.p1.rotation.z = 0.58 - waveP * 0.35;
        }

        if (humanHandGroup) {
          humanHandGroup.rotation.y = 0.42 + Math.sin(progress * 2.2) * 0.08;
          humanHandGroup.rotation.x = -0.18 + Math.cos(progress * 1.8) * 0.05;
        }
      }
      // Phase 2: (1.35s -> 1.84s) Finger-Snap Stance Tension
      else if (progress >= 1.35 && progress < 1.84) {
        const setupProgress = (progress - 1.35) / (1.84 - 1.35);
        const easeSetup = easeInOutCubic(setupProgress);

        if (handFingers.middle) {
          handFingers.middle.p1.rotation.x = THREE.MathUtils.lerp(0.60, 1.48, easeSetup);
          handFingers.middle.p2.rotation.x = THREE.MathUtils.lerp(0.70, 1.55, easeSetup);
          handFingers.middle.p3.rotation.x = THREE.MathUtils.lerp(0.50, 0.85, easeSetup);
          handFingers.middle.root.rotation.z = THREE.MathUtils.lerp(0.00, -0.12, easeSetup);
        }
        if (handFingers.thumb) {
          handFingers.thumb.p1.rotation.x = THREE.MathUtils.lerp(0.42, 0.76, easeSetup);
          handFingers.thumb.p1.rotation.z = THREE.MathUtils.lerp(0.23, -0.58, easeSetup);
          handFingers.thumb.p2.rotation.x = THREE.MathUtils.lerp(0.00, 0.45, easeSetup);
        }
        if (handFingers.index) {
          handFingers.index.p1.rotation.x = THREE.MathUtils.lerp(0.55, 0.22, easeSetup);
          handFingers.index.p2.rotation.x = THREE.MathUtils.lerp(0.65, 0.28, easeSetup);
          handFingers.index.p3.rotation.x = THREE.MathUtils.lerp(0.45, 0.18, easeSetup);
          handFingers.index.root.rotation.z = THREE.MathUtils.lerp(-0.07, -0.16, easeSetup);
        }
        if (handFingers.ring) {
          handFingers.ring.p1.rotation.x = THREE.MathUtils.lerp(0.75, 1.65, easeSetup);
          handFingers.ring.p2.rotation.x = THREE.MathUtils.lerp(0.85, 1.70, easeSetup);
          handFingers.ring.p3.rotation.x = THREE.MathUtils.lerp(0.60, 1.10, easeSetup);
        }
        if (handFingers.pinky) {
          handFingers.pinky.p1.rotation.x = THREE.MathUtils.lerp(0.85, 1.70, easeSetup);
          handFingers.pinky.p2.rotation.x = THREE.MathUtils.lerp(0.95, 1.75, easeSetup);
          handFingers.pinky.p3.rotation.x = THREE.MathUtils.lerp(0.65, 1.15, easeSetup);
        }

        if (humanHandGroup) {
          humanHandGroup.rotation.x = THREE.MathUtils.lerp(-0.18, -0.32, easeSetup);
          humanHandGroup.rotation.y = THREE.MathUtils.lerp(0.42, 0.55, easeSetup);
          humanHandGroup.rotation.z = THREE.MathUtils.lerp(-0.12, -0.20, easeSetup);
        }
      }
      // Phase 3: (1.84s -> 2.15s) Instant Snap Impact
      else if (progress >= 1.84 && progress < 2.15) {
        const snapT = progress - 1.84;

        if (snapT < 0.04) {
          if (handFingers.middle) {
            handFingers.middle.p1.rotation.x = 1.52;
            handFingers.middle.p2.rotation.x = 1.58;
          }
        } else {
          if (!hasSnapped) {
            triggerSnapBurst();
          }

          const strikeProgress = Math.min(1, (snapT - 0.04) / 0.10);
          const bounce = Math.exp(-strikeProgress * 9) * Math.sin(strikeProgress * Math.PI * 4.5) * 0.22;

          if (handFingers.middle) {
            handFingers.middle.p1.rotation.x = THREE.MathUtils.lerp(1.52, 2.05, easeOutQuad(strikeProgress)) + bounce;
            handFingers.middle.p2.rotation.x = THREE.MathUtils.lerp(1.58, 1.95, easeOutQuad(strikeProgress)) + bounce;
            handFingers.middle.p3.rotation.x = 1.20 + bounce * 0.5;
            handFingers.middle.root.rotation.z = THREE.MathUtils.lerp(-0.12, 0.05, strikeProgress);
          }
          if (handFingers.thumb) {
            handFingers.thumb.p1.rotation.z = THREE.MathUtils.lerp(-0.58, 0.72, easeOutQuad(strikeProgress));
            handFingers.thumb.p1.rotation.x = THREE.MathUtils.lerp(0.76, 0.38, strikeProgress);
            handFingers.thumb.p2.rotation.x = THREE.MathUtils.lerp(0.45, 0.12, strikeProgress);
          }
          if (handFingers.index) {
            handFingers.index.p1.rotation.x = 0.22 + bounce * 0.4;
            handFingers.index.p2.rotation.x = 0.28 + bounce * 0.3;
          }

          if (humanHandGroup) {
            humanHandGroup.rotation.x = -0.32 + strikeProgress * 0.38 + bounce * 0.8;
            humanHandGroup.rotation.z = -0.20 + strikeProgress * 0.14 + bounce * 0.4;
            humanHandGroup.position.z = 3.8 + bounce * 0.5;
          }
        }
      }
      // Phase 4: (2.15s -> 3.6s) Post-Snap Relaxation & Sacred Knot Entrance
      else if (progress >= 2.15 && progress <= introDuration) {
        const t = (progress - 2.15) / (introDuration - 2.15);
        const easeT = easeInOutCubic(t);

        if (handFingers.middle) {
          handFingers.middle.p1.rotation.x = THREE.MathUtils.lerp(2.05, 0.25, easeT);
          handFingers.middle.p2.rotation.x = THREE.MathUtils.lerp(1.95, 0.30, easeT);
          handFingers.middle.p3.rotation.x = THREE.MathUtils.lerp(1.20, 0.20, easeT);
        }
        if (handFingers.index) {
          handFingers.index.p1.rotation.x = THREE.MathUtils.lerp(0.22, 0.20, easeT);
          handFingers.index.p2.rotation.x = THREE.MathUtils.lerp(0.28, 0.25, easeT);
          handFingers.index.p3.rotation.x = THREE.MathUtils.lerp(0.18, 0.18, easeT);
        }
        if (handFingers.ring) {
          handFingers.ring.p1.rotation.x = THREE.MathUtils.lerp(1.65, 0.35, easeT);
          handFingers.ring.p2.rotation.x = THREE.MathUtils.lerp(1.70, 0.38, easeT);
          handFingers.ring.p3.rotation.x = THREE.MathUtils.lerp(1.10, 0.25, easeT);
        }
        if (handFingers.pinky) {
          handFingers.pinky.p1.rotation.x = THREE.MathUtils.lerp(1.70, 0.45, easeT);
          handFingers.pinky.p2.rotation.x = THREE.MathUtils.lerp(1.75, 0.48, easeT);
          handFingers.pinky.p3.rotation.x = THREE.MathUtils.lerp(1.15, 0.30, easeT);
        }
        if (handFingers.thumb) {
          handFingers.thumb.p1.rotation.z = THREE.MathUtils.lerp(0.72, 0.55, easeT);
          handFingers.thumb.p1.rotation.x = THREE.MathUtils.lerp(0.38, 0.30, easeT);
        }

        if (humanHandGroup) {
          humanHandGroup.position.z = 3.8 - easeT * 8.5;
          humanHandGroup.position.y = -0.35 - easeT * 1.6;
          humanHandGroup.scale.setScalar(1.42 * (1 - easeT * 0.92));
          if (t > 0.88) humanHandGroup.visible = false;
        }

        if (vortexGroup && vortexGroup.visible) {
          vortexGroup.visible = false;
        }

        if (heroKnotGroup) {
          heroKnotGroup.visible = true;
          const knotScale = Math.min(1.0, easeT * 1.18);
          heroKnotGroup.scale.set(knotScale, knotScale, knotScale);
        }
      }
      // Phase 5: Intro Complete
      else if (progress > introDuration) {
        isIntroPlaying = false;
        if (humanHandGroup) humanHandGroup.visible = false;
        if (vortexGroup) vortexGroup.visible = false;
        if (heroKnotGroup) {
          heroKnotGroup.visible = true;
          heroKnotGroup.scale.set(1, 1, 1);
        }
        if (onIntroCompleteCallback) {
          onIntroCompleteCallback();
          onIntroCompleteCallback = null;
        }
      }
    }

    // 8.3 Animate 2D Anime Starburst Sparks (Physics, Rotation & Decay)
    if (burstSparks) {
      for (let i = 0; i < burstSparkData.length; i++) {
        const s = burstSparkData[i];
        if (s.mesh.visible) {
          s.mesh.position.x += s.vx;
          s.mesh.position.y += s.vy;
          s.mesh.position.z += s.vz;
          s.mesh.rotation.z += s.rotSpeed || 0.08;
          s.vy -= 0.0055;
          s.alpha -= s.decay;
          const scale = Math.max(0.01, s.alpha * 1.2);
          s.mesh.scale.set(scale, scale, scale);
          if (s.alpha <= 0) {
            s.mesh.visible = false;
          }
        }
      }
    }

    // 8.4 Rotate Ambient Hero 3D Knot & Orbit Rings
    if (heroKnotGroup && heroKnotGroup.visible) {
      heroKnotGroup.rotation.x = Math.sin(elapsedTime * 0.4) * 0.25 + mouse.y * 0.4;
      heroKnotGroup.rotation.y = elapsedTime * 0.35 + mouse.x * 0.6;
      heroKnotGroup.rotation.z = Math.cos(elapsedTime * 0.3) * 0.15;

      const ring1 = heroKnotGroup.getObjectByName('ringOuter1');
      const ring2 = heroKnotGroup.getObjectByName('ringOuter2');
      if (ring1) ring1.rotation.z -= 0.008;
      if (ring2) ring2.rotation.y += 0.006;
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
      get heroKnotGroup() { return heroKnotGroup; },
      get humanHandGroup() { return humanHandGroup; },

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
        if (shockwaveMesh) shockwaveMesh.material.opacity = 0;
        if (heroKnotGroup) {
          heroKnotGroup.visible = true;
          heroKnotGroup.scale.set(1, 1, 1);
          heroKnotGroup.position.set(0, 0, 0);
        }
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
        if (!heroKnotGroup) return;

        if (typeof gsap !== 'undefined') {
          gsap.to(heroKnotGroup.scale, {
            x: intensity,
            y: intensity,
            z: intensity,
            duration: 0.18,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              heroKnotGroup.scale.set(1, 1, 1);
            }
          });
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
        } else {
          heroKnotGroup.scale.set(intensity, intensity, intensity);
          setTimeout(() => {
            if (heroKnotGroup) heroKnotGroup.scale.set(1, 1, 1);
          }, 200);
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
        if (!heroKnotGroup) return;

        const isHome = viewId === 'home' || !viewId;
        const targetScale = isHome ? 1.0 : 0.45;
        const targetY = isHome ? 0 : 3.5;
        const targetOpacity = isHome ? 0.85 : 0.25;

        if (typeof gsap !== 'undefined') {
          gsap.to(heroKnotGroup.scale, {
            x: targetScale,
            y: targetScale,
            z: targetScale,
            duration: 1.0,
            ease: 'power3.out'
          });
          gsap.to(heroKnotGroup.position, {
            y: targetY,
            duration: 1.0,
            ease: 'power3.out'
          });
          if (canvas) {
            gsap.to(canvas, {
              opacity: targetOpacity,
              duration: 0.8,
              ease: 'power2.out'
            });
          }
        } else {
          heroKnotGroup.scale.set(targetScale, targetScale, targetScale);
          heroKnotGroup.position.y = targetY;
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
