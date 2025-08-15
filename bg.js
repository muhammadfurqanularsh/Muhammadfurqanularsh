/* Three.js network background with distance-based lines + motion parallax
   - Respects prefers-reduced-motion
   - Pauses when tab is hidden
   - Lightweight for laptops
*/

const canvas = document.getElementById("bg");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scene / Camera / Renderer
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x06070a, 0.04);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 16);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* ===== Particles ===== */
const COUNT = prefersReduced ? 120 : 220;
const RANGE = 18;
const MAX_DIST = 3.4;

const positions = new Float32Array(COUNT * 3);
const velocities = new Float32Array(COUNT * 3);

for (let i = 0; i < COUNT; i++) {
  const i3 = i * 3;
  positions[i3]     = (Math.random() - 0.5) * RANGE;
  positions[i3 + 1] = (Math.random() - 0.5) * RANGE;
  positions[i3 + 2] = (Math.random() - 0.5) * RANGE;

  velocities[i3]     = (Math.random() - 0.5) * 0.02;
  velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
  velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
}

const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const pMat = new THREE.PointsMaterial({
  color: 0x00ffcc,
  size: 0.06,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const points = new THREE.Points(pGeo, pMat);
scene.add(points);

/* ===== Dynamic connection lines ===== */
const maxSegments = COUNT * COUNT;
const linePositions = new Float32Array(maxSegments * 3 * 2); // start+end for each segment
const lineColors = new Float32Array(maxSegments * 3 * 2);
const lGeo = new THREE.BufferGeometry();
lGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
lGeo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

const lMat = new THREE.LineBasicMaterial({
  vertexColors: true,
  transparent: true,
  opacity: 0.55,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const lines = new THREE.LineSegments(lGeo, lMat);
scene.add(lines);

/* ===== Mouse parallax ===== */
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
window.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

/* ===== Animation loop ===== */
let rafId;
let lastTime = performance.now();

function animate(now = performance.now()) {
  rafId = requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 16.67, 3); // normalize ~60fps
  lastTime = now;

  // move particles
  const pos = pGeo.attributes.position.array;
  let segIndex = 0;

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;

    if (!prefersReduced) {
      pos[i3]     += velocities[i3]     * dt;
      pos[i3 + 1] += velocities[i3 + 1] * dt;
      pos[i3 + 2] += velocities[i3 + 2] * dt;
    }

    // bounce
    for (let k = 0; k < 3; k++) {
      const axis = i3 + k;
      if (pos[axis] > RANGE / 2 || pos[axis] < -RANGE / 2) velocities[axis] *= -1;
    }
  }

  // build connections
  for (let i = 0; i < COUNT; i++) {
    const ia = i * 3;
    for (let j = i + 1; j < COUNT; j++) {
      const ja = j * 3;
      const dx = pos[ia] - pos[ja];
      const dy = pos[ia + 1] - pos[ja + 1];
      const dz = pos[ia + 2] - pos[ja + 2];
      const dist = Math.hypot(dx, dy, dz);

      if (dist < MAX_DIST) {
        // position
        linePositions[segIndex] = pos[ia];
        linePositions[segIndex + 1] = pos[ia + 1];
        linePositions[segIndex + 2] = pos[ia + 2];
        linePositions[segIndex + 3] = pos[ja];
        linePositions[segIndex + 4] = pos[ja + 1];
        linePositions[segIndex + 5] = pos[ja + 2];

        // color fades with distance
        const t = 1 - (dist / MAX_DIST);
        const r = 0.0 + 0.2 * t;
        const g = 1.0;
        const b = 0.8 + 0.2 * t;

        lineColors[segIndex] = r;      lineColors[segIndex + 1] = g;      lineColors[segIndex + 2] = b;
        lineColors[segIndex + 3] = r;  lineColors[segIndex + 4] = g;      lineColors[segIndex + 5] = b;

        segIndex += 6;
      }
    }
  }

  lGeo.setDrawRange(0, segIndex / 3);
  lGeo.attributes.position.needsUpdate = true;
  lGeo.attributes.color.needsUpdate = true;
  pGeo.attributes.position.needsUpdate = true;

  // subtle spin
  points.rotation.y += prefersReduced ? 0 : 0.0004 * dt;
  lines.rotation.y  += prefersReduced ? 0 : 0.0004 * dt;

  // camera parallax
  targetX = mouseX * 2.0;
  targetY = mouseY * 1.5;
  camera.position.x += (targetX - camera.position.x) * 0.05 * dt;
  camera.position.y += (targetY - camera.position.y) * 0.05 * dt;

  renderer.render(scene, camera);
}

/* Visibility pause for performance */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) cancelAnimationFrame(rafId);
  else { lastTime = performance.now(); animate(); }
});

/* Resize */
function onResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onResize);

/* Kickoff */
if (!prefersReduced) animate();
else renderer.render(scene, camera); // static first frame for reduced motion users