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

    // Build genuine elliptical paths instead of scaling circular torus meshes.
    // Every path has its own tilted plane and slow local precession. The planes
    // remain diagonal while their ellipse axes drift, creating visible crossings
    // without letting the whole system rotate into a set of flat-looking circles.
    const createOrbitTrack = ({
      radiusX,
      radiusY,
      tubeRadius,
      color,
      opacity,
      tilt,
      precessionAxis,
      precessionSpeed,
      metallic = false
    }) => {
      const ellipse = new THREE.EllipseCurve(
        0, 0, radiusX, radiusY, 0, Math.PI * 2, false, 0
      );
      const points = ellipse.getPoints(360).slice(0, -1).map(
        (point) => new THREE.Vector3(point.x, point.y, 0)
      );
      const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');

      const geometry = new THREE.TubeGeometry(curve, 360, tubeRadius, 8, true);
      const material = metallic
        ? new THREE.MeshStandardMaterial({
            color,
            metalness: 0.72,
            roughness: 0.32,
            emissive: 0x4b2017,
            emissiveIntensity: 0.16,
            transparent: true,
            opacity,
            depthWrite: false
          })
        : new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
            depthWrite: false
          });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.renderOrder = 2;

      const pivot = new THREE.Group();
      pivot.rotation.order = 'XYZ';
      pivot.rotation.set(tilt[0], tilt[1], tilt[2]);
      pivot.add(mesh);
      orbitSystem.add(pivot);

      return {
        pivot,
        curve,
        geometry,
        material,
        baseQuaternion: pivot.quaternion.clone(),
        precessionAxis: new THREE.Vector3(...precessionAxis).normalize(),
        precessionSpeed,
        animatedQuaternion: new THREE.Quaternion()
      };
    };

    // Four carefully spaced elliptical tracks. Their planes cross at
    // different angles, with one warm focal orbit and three quieter supports.
    const orbitTracks = [
      createOrbitTrack({
        radiusX: 2.06, radiusY: 1.16, tubeRadius: 0.013,
        color: 0xd97757, opacity: 0.9,
        tilt: [1.04, 0.34, -0.26],
        precessionAxis: [0.35, 1, 0.18],
        precessionSpeed: 0.24,
        metallic: true
      }),
      createOrbitTrack({
        radiusX: 2.2, radiusY: 1.38, tubeRadius: 0.0065,
        color: 0xe8e6dc, opacity: 0.34,
        tilt: [0.72, -0.94, 0.84],
        precessionAxis: [-0.82, 0.28, 0.5],
        precessionSpeed: -0.17
      }),
      createOrbitTrack({
        radiusX: 1.94, radiusY: 1.12, tubeRadius: 0.005,
        color: 0xc4a484, opacity: 0.24,
        tilt: [1.34, 0.66, -0.92],
        precessionAxis: [0.6, 0.55, -0.72],
        precessionSpeed: 0.14
      }),
      createOrbitTrack({
        radiusX: 2.12, radiusY: 0.84, tubeRadius: 0.004,
        color: 0xfaf9f5, opacity: 0.18,
        tilt: [0.86, 1.12, 1.24],
        precessionAxis: [-0.35, 0.72, 0.6],
        precessionSpeed: -0.12
      })
    ];

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
    // Follow the actual curve of the main terracotta ellipse, not an unrelated
    // circular 3D path. Parenting keeps the marker locked to that moving track.
    const primaryOrbit = orbitTracks[0];
    primaryOrbit.pivot.add(satellite);
    satellite.position.copy(primaryOrbit.curve.getPointAt(0));

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
      const framingRadius = 2.42;
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
        // Precess each complete orbital plane around its own world-space axis.
        // Unlike rotating an ellipse around its own normal, this changes the
        // visible angle of the track continuously and keeps the crossings alive.
        orbitTracks.forEach((track) => {
          track.animatedQuaternion.setFromAxisAngle(
            track.precessionAxis,
            time * track.precessionSpeed
          );
          track.pivot.quaternion.copy(track.animatedQuaternion)
            .multiply(track.baseQuaternion);
        });

        points.rotation.y = -time * 0.018;

        // The marker completes a smooth lap on the focal terracotta ellipse.
        const satelliteProgress = (time * 0.095) % 1;
        satellite.position.copy(primaryOrbit.curve.getPointAt(satelliteProgress));
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
      orbitTracks.forEach((track) => {
        track.geometry.dispose();
        track.material.dispose();
      });
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
