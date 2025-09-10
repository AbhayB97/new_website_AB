// src/main.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import anime from 'animejs/lib/anime.es.js';
import { TerminalUI } from './modules/TerminalUI.js';

// Scene Setup
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// Initialize terminal UI
const terminalUI = new TerminalUI();
terminalUI.init().catch(console.error);
window.portfolioApp = { terminalUI };

// Load 3D Model
let disassemblyTimeline;
const loader = new GLTFLoader();
loader.load(
  '/models/laptop.glb',
  (gltf) => {
    const root = gltf.scene;
    scene.add(root);
    console.log('Model loaded with parts:', root.children.map(m => m.name));
    buildDisassemblyTimeline(root.children);
  },
  undefined,
  (error) => console.error('GLTF load error:', error)
);

// Build Anime.js Timeline for Disassembly
function buildDisassemblyTimeline(parts) {
  disassemblyTimeline = anime.timeline({
    autoplay: false,
    easing: 'easeInOutQuad'
  });

  // Step 1: Open Lid
  const lid = parts.find((mesh) => /lid/i.test(mesh.name));
  if (lid) {
    disassemblyTimeline.add({
      targets: lid.rotation,
      x: [-Math.PI / 2, 0],
      duration: 1000
    });
  }

  // Step 2: Disassemble Other Parts
  disassemblyTimeline.add({
    targets: parts,
    translateY: (i) => 1 + i * 0.5,
    rotateZ: (i) => Math.PI / 2 * (i % 2 ? 1 : -1),
    duration: 1500,
    delay: anime.stagger(200)
  }, '+=200');

  // Hook scroll to timeline
  window.addEventListener('scroll', syncTimelineWithScroll);
}

// Sync Timeline Seek to Scroll Position
function syncTimelineWithScroll() {
  if (!disassemblyTimeline) return;
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
  disassemblyTimeline.seek(disassemblyTimeline.duration * progress);
}

// Render Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Handle Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
