import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import anime from 'animejs/lib/anime.es.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8);

// lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dl = new THREE.DirectionalLight(0xffffff, 0.8);
dl.position.set(5,10,7); scene.add(dl);

// load GLTF
let parts = [];
const loader = new GLTFLoader();
loader.load('/models/laptop.glb', (gltf) => {
  const root = gltf.scene;
  scene.add(root);

  // assume each direct child is a named part
  parts = root.children;

  // build disassembly timeline
  buildTimeline();
}, undefined, err=> console.error(err));

// an Anime.js timeline, but *paused* initially
let timeline;
function buildTimeline() {
  timeline = anime.timeline({ autoplay: false, easing: 'easeInOutQuad' });

  // Step 1: open lid
  const lid = parts.find(m => m.name.toLowerCase().includes('lid'));
  if (lid) {
    timeline.add({
      targets: lid.rotation,
      x: [-Math.PI/2, 0],
      duration: 1000
    });
  }

  // Step 2: disassemble each part in sequence
  timeline.add({
    targets: parts,
    translateY: i => 1 + i * 0.5,
    rotateZ: (i) => Math.PI/2 * (i%2?1:-1),
    duration: 1500,
    delay: anime.stagger(200)
  }, '+=200');

  // total duration = timeline.duration
  // now hook scroll
  window.addEventListener('scroll', syncTimelineWithScroll);
}

// sync function
function syncTimelineWithScroll() {
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const pct = Math.min(1, scrollY / maxScroll);
  if (timeline) timeline.seek(timeline.duration * pct);
}

// animate loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// handle resize
window.addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
