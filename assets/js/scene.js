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

    // Keep the central sculpture independent from the orbit system so its shape
    // and motion remain unchanged while the orbital paths move around it.
    const orbitSystem = new THREE.Group();
    scene.add(orbitSystem);
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
    // Three elliptical tracks, deliberately inclined on different axes.
    // Their different planes create the crossing, armillary-sphere silhouette
    // instead of a set of flat concentric circles.
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.014, 10, 220), ringMaterial);
    ringA.rotation.set(1.1, 0.14, 0.28);
    ringA.scale.set(1.1, 0.8, 1);
    orbitSystem.add(ringA);

    const ringBMaterial = new THREE.MeshBasicMaterial({
      color: 0xe8e6dc, transparent: true, opacity: 0.3, depthWrite: false
    });
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.88, 0.007, 6, 220), ringBMaterial);
    ringB.rotation.set(0.42, 1.16, -0.62);
    ringB.scale.set(1, 0.72, 1);
    orbitSystem.add(ringB);

    const ringCMaterial = new THREE.MeshBasicMaterial({
      color: 0xc4a484, transparent: true, opacity: 0.2, depthWrite: false
    });
    const ringC = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.005, 5, 200), ringCMaterial);
    ringC.rotation.set(1.42, -0.9, 0.82);
    ringC.scale.set(1.14, 0.86, 1);
    orbitSystem.add(ringC);

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
    // The satellite is parented to the primary terracotta orbit. Its path
    // therefore stays on the visible track as the orbit rig precesses.
    ringA.add(satellite);
    satellite.position.set(1.62, 0, 0);

    let pointerX = 0;
    let pointerY = 0;
    let smoothX = 0;
    let smoothY = 0;
    let visible = true;
    let rafId = 0;
    const clock = new THREE.Clock();
    const resize = () => {
      const rect = frame.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const aspect = width / height;

      renderer.setSize(width, height, false);
      camera.aspect = aspect;

      // Fit the outer orbital ring inside the camera frustum at every container ratio.
      const framingRadius = 2.18;
      const halfFovRadians = THREE.MathUtils.degToRad(camera.fov / 2);
      const requiredDistance = (framingRadius / Math.tan(halfFovRadians)) * Math.max(1, 1 / aspect);
      camera.position.set(0, 0, Math.max(6.8, requiredDistance * 1.08));
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
        // Slow whole-system drift plus a restrained precession on each track.
        // The different inclinations remain visible throughout the rotation.
        orbitSystem.rotation.y = time * 0.11;
        orbitSystem.rotation.z = Math.sin(time * 0.19) * 0.055;
        ringA.rotation.z = 0.28 + Math.sin(time * 0.17) * 0.045;
        ringB.rotation.x = 0.42 + Math.sin(time * 0.14 + 1.1) * 0.04;
        ringC.rotation.y = -0.9 + Math.sin(time * 0.12 + 2.2) * 0.035;
        points.rotation.y = -time * 0.018;
        const satelliteAngle = time * 0.58;
        satellite.position.set(Math.cos(satelliteAngle) * 1.62, Math.sin(satelliteAngle) * 1.62, 0);
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
      coreGeometry.dispose();
      coreMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      ringA.geometry.dispose();
      ringMaterial.dispose();
      ringB.geometry.dispose();
      ringBMaterial.dispose();
      ringC.geometry.dispose();
      ringCMaterial.dispose();
      pointGeometry.dispose();
      points.material.dispose();
      satellite.geometry.dispose();
      satellite.material.dispose();
      renderer.dispose();
    }, { once: true });
  } catch (error) {
    console.warn('The 3D scene could not be started:', error);
  }
}
