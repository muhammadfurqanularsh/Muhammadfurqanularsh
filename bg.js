const canvas = document.getElementById("bg");

// Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 15;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Particle setup
const COUNT = 150;
const RANGE = 20;
const positions = new Float32Array(COUNT * 3);
const velocities = new Float32Array(COUNT * 3);

for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * RANGE;
    positions[i3 + 1] = (Math.random() - 0.5) * RANGE;
    positions[i3 + 2] = (Math.random() - 0.5) * RANGE;

    velocities[i3] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
}

const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

const particleMat = new THREE.PointsMaterial({
    color: 0x00ffcc,
    size: 0.06,
    transparent: true,
    opacity: 0.9
});

const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// Lines
const MAX_DIST = 3;
const linePositions = new Float32Array(COUNT * COUNT * 3);
const lineGeo = new THREE.BufferGeometry();
lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

const lineMat = new THREE.LineBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.3
});
const lines = new THREE.LineSegments(lineGeo, lineMat);
scene.add(lines);

// Mouse interaction
let mouseX = 0, mouseY = 0;
document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Animation
function animate() {
    requestAnimationFrame(animate);

    const pos = particleGeo.attributes.position.array;
    let lineIndex = 0;

    // Move particles
    for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        pos[i3] += velocities[i3];
        pos[i3 + 1] += velocities[i3 + 1];
        pos[i3 + 2] += velocities[i3 + 2];

        // Bounce back
        for (let axis = 0; axis < 3; axis++) {
            if (pos[i3 + axis] > RANGE / 2 || pos[i3 + axis] < -RANGE / 2) {
                velocities[i3 + axis] *= -1;
            }
        }
    }

    // Draw lines
    for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
            const dx = pos[i * 3] - pos[j * 3];
            const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
            const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < MAX_DIST) {
                linePositions[lineIndex++] = pos[i * 3];
                linePositions[lineIndex++] = pos[i * 3 + 1];
                linePositions[lineIndex++] = pos[i * 3 + 2];
                linePositions[lineIndex++] = pos[j * 3];
                linePositions[lineIndex++] = pos[j * 3 + 1];
                linePositions[lineIndex++] = pos[j * 3 + 2];
            }
        }
    }

    lineGeo.setDrawRange(0, lineIndex / 3);
    lineGeo.attributes.position.needsUpdate = true;
    particleGeo.attributes.position.needsUpdate = true;

    // Camera follows mouse slightly
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;

    renderer.render(scene, camera);
}

animate();

// Handle resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
