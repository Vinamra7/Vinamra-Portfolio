'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
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
      renderer.setClearColor(0x11151c);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);

      const scene = new THREE.Scene();
      const clock = new THREE.Clock();

      // Use the same gradient HDR as home page
      const hdrEquirect = assets.hdrs.gradient;
      hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = hdrEquirect;

      scene.fog = new THREE.FogExp2(0x11151c, 0.00375);

      // Setup camera
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 50, 100);

      // Create materials
      const wallMaterial = new THREE.MeshPhysicalMaterial({
         color: 0xff7700,
         envMapIntensity: 0.5
      });

      const humanMaterial = new THREE.MeshStandardMaterial({
         color: 0x000000
      });

      // Load walking human model
      new FBXLoader().load('/assets/human_walk_04.fbx', (human) => {
         const mixer = new THREE.AnimationMixer(human);
         const clipAction = mixer.clipAction(human.animations[0]);
         clipAction.loop = THREE.LoopRepeat;
         clipAction.play();

         human.traverse((child) => {
            if (child.isMesh) child.material = humanMaterial;
         });

         human.position.set(0, 1.5, -100);
         human.scale.setScalar(0.09);
         scene.add(human);
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
      bloomPass.strength = 1.5;
      bloomPass.radius = 1;
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

      animate();

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
