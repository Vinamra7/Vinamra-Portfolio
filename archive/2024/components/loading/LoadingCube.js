import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

const LoadingCube = () => {
  const containerRef = useRef();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Create cube with extremely tiny dimensions
    const geometry = new THREE.BoxGeometry(0.01, 0.01, 0.01); // Made extremely tiny (from 0.05 to 0.01)
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Position camera extremely close
    camera.position.z = 0.1; // Moved camera extremely close (from 0.3 to 0.1)

    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    // Face explosion animation
    const animateFaces = () => {
      const faces = cube.geometry.groups;
      faces.forEach((face, i) => {
        const direction = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize();

        gsap.to(cube.geometry.attributes.position.array, {
          duration: 0.5,
          delay: i * 0.1,
          ease: 'power2.out',
          onUpdate: () => {
            cube.geometry.attributes.position.needsUpdate = true;
          },
          yoyo: true,
          repeat: 1,
        });
      });
    };

    // Start animations
    animate();
    const explosionInterval = setInterval(animateFaces, 2000);

    // Cleanup
    return () => {
      clearInterval(explosionInterval);
      containerRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
};

export default LoadingCube;
