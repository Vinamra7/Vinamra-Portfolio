'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import AssetLoader from '../../../utils/assetLoader';

const ProjectsBackground = ({ showContent }) => {
   const canvasRef = useRef(null);
   const assets = AssetLoader.getLoadedAssets();

   useEffect(() => {
      if (typeof window === "undefined" || !showContent) return;

      // Setup renderer
      const renderer = new THREE.WebGLRenderer({
         canvas: canvasRef.current,
         antialias: true
      });
      renderer.setClearColor(0x11151c); // Dark blue background
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio at 2
      renderer.setSize(window.innerWidth, window.innerHeight);

      const scene = new THREE.Scene();
      const clock = new THREE.Clock();

      // Use the same gradient HDR as home page
      const hdrEquirect = assets.hdrs.gradient;
      hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = hdrEquirect;

      scene.fog = new THREE.FogExp2(0x11151c, 0.00375); // Match fog color to background

      // Setup camera
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 50, 100);

      // Create materials
      const wallMaterial = new THREE.MeshPhysicalMaterial({
         color: 0x87CEFA, // Light blue color
         envMapIntensity: 0.5
      });

      // Create expanding wall
      const wall = new THREE.Mesh(
         new THREE.PlaneGeometry(10, 100),
         wallMaterial
      );
      wall.position.set(0, 50, -110);
      scene.add(wall);

      // Setup post-processing
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      const afterimagePass = new AfterimagePass();
      afterimagePass.uniforms['damp'].value = 0.9;
      composer.addPass(afterimagePass);

      const bloomPass = new UnrealBloomPass(
         new THREE.Vector2(window.innerWidth, window.innerHeight),
         1.5, 0.4, 0.85
      );
      bloomPass.threshold = 0.1;
      bloomPass.strength = 1.5; // Increased strength for better glow
      bloomPass.radius = 0.8; // Adjusted radius for smoother glow
      composer.addPass(bloomPass);

      // Handle window resize
      const handleResize = () => {
         camera.aspect = window.innerWidth / window.innerHeight;
         camera.updateProjectionMatrix();
         renderer.setSize(window.innerWidth, window.innerHeight);
         composer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      // Animation loop
      const animate = () => {
         const delta = clock.getDelta();

         camera.position.z = 100 - (25 * Math.sin(clock.elapsedTime * 0.1));
         scene.fog.density = 0.00375 - (0.00075 * Math.sin(clock.elapsedTime * 0.1));
         wall.scale.x = 1 + (25 * Math.sin(clock.elapsedTime * 0.1));

         composer.render();
         requestAnimationFrame(animate);
      };

      if (showContent) {
         animate();
      }

      return () => {
         window.removeEventListener('resize', handleResize);
         renderer.dispose();
         composer.dispose();
      };
   }, [showContent, assets]);

   return (
      <canvas
         ref={canvasRef}
         style={{
            width: "100%",
            height: "100%",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 0,
            opacity: showContent ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out'
         }}
      />
   );
};

export default ProjectsBackground;