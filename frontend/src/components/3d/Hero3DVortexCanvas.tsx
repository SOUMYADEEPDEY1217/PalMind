import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hero3DVortexCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 550;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Radiant 3D Molten Torus Ring
    const torusGeometry = new THREE.TorusGeometry(8.5, 0.6, 24, 120);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4514,
      emissive: 0xff3b14,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9,
      wireframe: true,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.rotation.x = Math.PI / 3.2;
    torus.rotation.y = -Math.PI / 8;
    scene.add(torus);

    // 2. Secondary Glowing Inner Ring
    const innerRingGeo = new THREE.TorusGeometry(6.8, 0.08, 16, 100);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xffaa66,
      transparent: true,
      opacity: 0.65,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 3.2;
    innerRing.rotation.y = -Math.PI / 8;
    scene.add(innerRing);

    // 3. 3D Swirling Particle Vortex
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0xff5722); // Vibrant Coral
    const color2 = new THREE.Color(0xffa143); // Amber Flame
    const color3 = new THREE.Color(0xff3b14); // Molten Red

    for (let i = 0; i < particleCount; i++) {
      // Spiral radius & angle
      const angle = Math.random() * Math.PI * 2;
      const radius = 5.5 + Math.random() * 6.5;
      const spreadY = (Math.random() - 0.5) * 4.5;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.45 + spreadY * 0.4;
      const z = (Math.random() - 0.5) * 6;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color distribution
      const mixedColor = color1.clone().lerp(Math.random() > 0.5 ? color2 : color3, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Texture Generation (Soft glowing sphere sprite)
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 120, 60, 0.8)');
      gradient.addColorStop(0.7, 'rgba(255, 60, 20, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.38,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      map: particleTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMaterial);
    particles.rotation.x = Math.PI / 3.4;
    scene.add(particles);

    // 4. Floating 3D Geometric Nodes (Quantum Mind Nodes)
    const nodeCount = 5;
    const nodes: THREE.Mesh[] = [];
    const nodeGeos = [
      new THREE.OctahedronGeometry(0.55),
      new THREE.IcosahedronGeometry(0.5),
      new THREE.TetrahedronGeometry(0.6),
    ];
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      emissive: 0xff5722,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
    });

    for (let i = 0; i < nodeCount; i++) {
      const mesh = new THREE.Mesh(nodeGeos[i % nodeGeos.length], nodeMat);
      const angle = (i / nodeCount) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 9.5, Math.sin(angle) * 3.8, (Math.random() - 0.5) * 4);
      scene.add(mesh);
      nodes.push(mesh);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff5722, 5, 50);
    pointLight.position.set(0, 0, 8);
    scene.add(pointLight);

    const rimLight = new THREE.PointLight(0xff9e80, 2, 40);
    rimLight.position.set(0, 8, -6);
    scene.add(rimLight);

    // Mouse Interaction
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      targetX = (clientX / width - 0.5) * 2;
      targetY = (clientY / height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 900;
      const newHeight = container.clientHeight || 550;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera tilt towards mouse
      camera.position.x += (targetX * 2.2 - camera.position.x) * 0.05;
      camera.position.y += (-targetY * 1.5 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Torus rotations
      torus.rotation.z = elapsed * 0.12;
      innerRing.rotation.z = -elapsed * 0.08;

      // Particles slow vortex swirling
      particles.rotation.z = elapsed * 0.09;

      // Floating Nodes oscillation
      nodes.forEach((node, idx) => {
        node.rotation.x += 0.01 * (idx + 1);
        node.rotation.y += 0.015;
        node.position.y += Math.sin(elapsed * 1.5 + idx) * 0.005;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      torusGeometry.dispose();
      particleGeo.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[980px] h-[600px] pointer-events-none z-0 overflow-visible opacity-90 transition-opacity duration-1000"
    />
  );
};
