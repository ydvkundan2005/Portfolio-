import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js';

const canvas = document.getElementById('hero-canvas');
const frame = document.getElementById('scene-frame');
const visual = document.getElementById('hero-visual');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (canvas && frame && visual) {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 6.8);
    scene.add(new THREE.HemisphereLight(0xfaf9f5, 0x291e1a, 1.4));

    const keyLight = new THREE.PointLight(0xf1c2b1, 38, 20);
    keyLight.position.set(3.2, 2.7, 4.5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xd97757, 24, 18);
    rimLight.position.set(-3.1, -1.3, 2.2);
    scene.add(rimLight);
    const backLight = new THREE.PointLight(0xffffff, 10, 16);
    backLight.position.set(0, 2.8, -3);
    scene.add(backLight);

    const sculpture = new THREE.Group();
    scene.add(sculpture);
    const coreGeometry = new THREE.IcosahedronGeometry(1.08, 2);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe8d3c9, metalness: 0.78, roughness: 0.24, clearcoat: 1,
      clearcoatRoughness: 0.18, emissive: 0x28130e, emissiveIntensity: 0.28
    });
    sculpture.add(new THREE.Mesh(coreGeometry, coreMaterial));

    const wireGeometry = new THREE.IcosahedronGeometry(1.19, 2);
    const wireMaterial = new THREE.MeshBasicMaterial({ color: 0xd97757, wireframe: true, transparent: true, opacity: 0.16 });
    sculpture.add(new THREE.Mesh(wireGeometry, wireMaterial));

    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97757, metalness: 0.66, roughness: 0.35, emissive: 0x4b2017, emissiveIntensity: 0.22
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.012, 8, 150), ringMaterial);
    ringA.rotation.set(0.98, 0.15, 0.46);
    sculpture.add(ringA);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.88, 0.006, 6, 160), new THREE.MeshBasicMaterial({
      color: 0xe8e6dc, transparent: true, opacity: 0.34
    }));
    ringB.rotation.set(1.3, -0.7, -0.23);
    sculpture.add(ringB);
    const ringC = new THREE.Mesh(new THREE.TorusGeometry(1.43, 0.004, 5, 120), new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.23
    }));
    ringC.rotation.set(0.3, 0.65, 1.05);
    sculpture.add(ringC);

    const pointCount = 190;
    const pointPositions = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i += 1) {
      const radius = 2.2 + Math.random() * 1.25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pointPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pointPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pointPositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
    const points = new THREE.Points(pointGeometry, new THREE.PointsMaterial({
      color: 0xfaf9f5, size: 0.017, transparent: true, opacity: 0.48, sizeAttenuation: true, depthWrite: false
    }));
    scene.add(points);

    const satellite = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 20, 20),
      new THREE.MeshStandardMaterial({
        color: 0xd97757, emissive: 0x9d4e34, emissiveIntensity: 0.8, metalness: 0.25, roughness: 0.3
      })
    );
    scene.add(satellite);

    let pointerX = 0;
    let pointerY = 0;
    let smoothX = 0;
    let smoothY = 0;
    let visible = true;
    let rafId = 0;
    const clock = new THREE.Clock();
    const resize = () => {
      const rect = frame.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frame);
    window.addEventListener('resize', resize, { passive: true });

    if (!reducedMotion.matches && window.matchMedia('(pointer: fine)').matches) {
      visual.addEventListener('pointermove', (event) => {
        const rect = visual.getBoundingClientRect();
        pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.3;
        pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.24;
      });
      visual.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
      }, { threshold: 0 });
      observer.observe(visual);
    }

    const animate = () => {
      rafId = window.requestAnimationFrame(animate);
      if (!visible || document.hidden) return;
      const time = clock.getElapsedTime();
      smoothX += (pointerX - smoothX) * 0.035;
      smoothY += (pointerY - smoothY) * 0.035;
      if (!reducedMotion.matches) {
        sculpture.rotation.y = time * 0.17 + smoothX;
        sculpture.rotation.x = Math.sin(time * 0.28) * 0.09 + smoothY - Math.min(window.scrollY || 0, 700) / 700 * 0.12;
        sculpture.rotation.z = Math.sin(time * 0.18) * 0.035;
        ringA.rotation.z += 0.0016;
        ringB.rotation.x += 0.0008;
        ringC.rotation.y -= 0.0012;
        points.rotation.y = -time * 0.018;
        satellite.position.set(Math.cos(time * 0.48) * 1.83, Math.sin(time * 0.48) * 0.48, Math.sin(time * 0.48) * 0.95);
      }
      renderer.render(scene, camera);
    };
    document.documentElement.classList.add('has-scene');
    animate();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!document.hidden && !rafId) {
        animate();
      }
    });
    window.addEventListener('pagehide', () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      coreGeometry.dispose(); coreMaterial.dispose(); wireGeometry.dispose(); wireMaterial.dispose();
      pointGeometry.dispose(); renderer.dispose();
    }, { once: true });
  } catch (error) {
    console.warn('The 3D scene could not be started:', error);
  }
}
