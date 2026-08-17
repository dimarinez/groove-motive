import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const shapeColors = [0x111111, 0x2563eb, 0x00ff95, 0xff7a1a, 0xd4af37];

export default function FloatingShapesBackground({ isActive = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return undefined;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.set(0, 0, 18);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(6, 8, 10);
    scene.add(keyLight);

    const geometries = [
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.TetrahedronGeometry(0.9),
      new THREE.OctahedronGeometry(0.95),
      new THREE.TorusGeometry(0.75, 0.18, 12, 36),
      new THREE.IcosahedronGeometry(0.85)
    ];

    const shapes = Array.from({ length: 18 }, (_, index) => {
      const geometry = geometries[index % geometries.length];
      const material = new THREE.MeshStandardMaterial({
        color: shapeColors[index % shapeColors.length],
        roughness: 0.42,
        metalness: index % 3 === 0 ? 0.38 : 0.08,
        transparent: true,
        opacity: index % 4 === 0 ? 0.45 : 0.32,
        wireframe: index % 5 === 1
      });
      const mesh = new THREE.Mesh(geometry, material);
      const column = index % 6;
      const row = Math.floor(index / 6);
      const x = (column - 2.5) * 4.7 + (row % 2 ? 1.1 : -0.7);
      const y = (row - 1) * 4.2 + (column % 2 ? 1.4 : -0.8);
      const z = -3 - (index % 4) * 2.3;
      const scale = 0.85 + (index % 5) * 0.18;

      mesh.position.set(x, y, z);
      mesh.rotation.set(index * 0.7, index * 0.43, index * 0.31);
      mesh.scale.setScalar(scale);
      mesh.userData = {
        baseX: x,
        baseY: y,
        baseZ: z,
        drift: 0.35 + (index % 4) * 0.12,
        speed: 0.35 + (index % 6) * 0.06
      };

      scene.add(mesh);
      return mesh;
    });

    const pointer = { x: 0, y: 0 };
    let scrollY = window.scrollY || 0;
    let animationId = null;

    const handlePointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      scrollY = window.scrollY || 0;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const scrollParallax = scrollY * 0.0012;

      shapes.forEach((shape, index) => {
        const { baseX, baseY, baseZ, drift, speed } = shape.userData;
        shape.position.x = baseX + pointer.x * (0.55 + index * 0.012);
        shape.position.y = baseY - pointer.y * (0.45 + index * 0.01) + Math.sin(elapsed * speed + index) * drift - scrollParallax;
        shape.position.z = baseZ + Math.cos(elapsed * speed * 0.7 + index) * 0.35;
        shape.rotation.x += 0.002 + index * 0.00012;
        shape.rotation.y += 0.003 + index * 0.0001;
      });

      scene.rotation.x = pointer.y * 0.035;
      scene.rotation.y = pointer.x * 0.045;
      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) window.cancelAnimationFrame(animationId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      geometries.forEach((geometry) => geometry.dispose());
      shapes.forEach((shape) => shape.material.dispose());
      renderer.dispose();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="floating-shapes-background"
      aria-hidden="true"
    />
  );
}
