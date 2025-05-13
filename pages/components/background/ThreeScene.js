// components/ThreeScene.js

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import AssetLoader from '../../../utils/assetLoader';

const ThreeScene = ({ showContent }) => {
    const canvasRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const controlsRef = useRef(null);
    const composerRef = useRef(null);
    const animationRef = useRef(null);
    const assets = AssetLoader.getLoadedAssets();

    useEffect(() => {
        if (typeof window === "undefined" || !showContent) return;

        let animationFrameId;
        
        // Create a renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById("canvas"),
            antialias: true,
            powerPreference: "high-performance" // Prefer high performance GPU
        });
        rendererRef.current = renderer;

        // Set a default background color
        renderer.setClearColor(0x11151c);
        // Cap pixel ratio at 2
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
        renderer.setSize(window.innerWidth, window.innerHeight);
        // Enable optimization
        renderer.info.autoReset = false;

        // Create a new Three.js scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create a new camera
        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        cameraRef.current = camera;

        camera.position.set(0, 0, 10);

        // Add controls to the camera/orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controlsRef.current = controls;
        controls.enableDamping = true;
        controls.enabled = true;
        controls.dampingFactor = 1;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.enableRotate = true;

        // Limit the angel that the camera can move
        const angleLimit = Math.PI / 7;
        controls.minPolarAngle = Math.PI / 2 - angleLimit;
        controls.maxPolarAngle = Math.PI / 2 + angleLimit;

        // Use preloaded HDR
        const hdrEquirect = assets.hdrs.gradient;
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;

        // Add some fog to the scene for moodyness
        scene.fog = new THREE.FogExp2(0x11151c, 0.4);

        // Use preloaded texture
        const surfaceImperfection = assets.textures.surfaceImperfection;
        surfaceImperfection.wrapT = THREE.RepeatWrapping;
        surfaceImperfection.wrapS = THREE.RepeatWrapping;

        // Create material using preloaded assets
        const hands_mat = new THREE.MeshPhysicalMaterial({
            color: 0x606060,
            roughness: 0.2,
            metalness: 1,
            roughnessMap: surfaceImperfection,
            envMap: hdrEquirect,
            envMapIntensity: 1.5
        });

        // Use preloaded model
        const object = assets.models.hands;
        object.traverse(function (child) {
            if (child.isMesh) {
                child.material = hands_mat;
                // Optimize geometry
                if (child.geometry) {
                    child.geometry.computeBoundingSphere();
                    // Optimize geometries
                    child.geometry.computeVertexNormals();
                    // Dispose unnecessary attributes
                    if (child.geometry.attributes.uv2) {
                        child.geometry.deleteAttribute('uv2');
                    }
                }
            }
        });
        object.position.set(0, 0, 0);
        object.scale.setScalar(0.05);
        scene.add(object);

        // POST PROCESSING
        const renderScene = new RenderPass(scene, camera);
        const afterimagePass = new AfterimagePass();
        afterimagePass.uniforms["damp"].value = 0.9;

        const bloomparams = {
            exposure: 1,
            bloomStrength: 1.75,
            bloomThreshold: 0.1,
            bloomRadius: 1
        };

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,
            0.4,
            0.85
        );
        bloomPass.threshold = bloomparams.bloomThreshold;
        bloomPass.strength = bloomparams.bloomStrength;
        bloomPass.radius = bloomparams.bloomRadius;

        const displacementShader = {
            uniforms: {
                tDiffuse: { value: null },
                displacement: { value: null },
                scale: { value: 0.1 },
                tileFactor: { value: 2 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform sampler2D displacement;
                uniform float scale;
                uniform float tileFactor;
                varying vec2 vUv;
                void main() {
                    if (vUv.x < 0.75 && vUv.x > 0.25 && vUv.y < 0.75 && vUv.y > 0.25) {
                        vec2 tiledUv = mod(vUv * tileFactor, 1.0);
                        vec2 disp = texture2D(displacement, tiledUv).rg * scale;
                        vec2 distUv = vUv + disp;
                        gl_FragColor = texture2D(tDiffuse, distUv);
                    } else {
                        gl_FragColor = texture2D(tDiffuse, vUv);
                    }
                }
            `
        };

        const displacementTexture = assets.textures.displacement;
        displacementTexture.minFilter = THREE.NearestFilter;

        const displacementPass = new ShaderPass(displacementShader);
        displacementPass.uniforms["displacement"].value = displacementTexture;
        displacementPass.uniforms["scale"].value = 0.025;
        displacementPass.uniforms["tileFactor"].value = 2;

        const composer = new EffectComposer(renderer);
        composerRef.current = composer;
        composer.addPass(renderScene);
        composer.addPass(afterimagePass);
        composer.addPass(bloomPass);
        composer.addPass(displacementPass);

        // Camera transition setup
        let isUserInteracting = false;
        let transitionProgress = 0;
        let transitionTime = 2;
        let transitionIncrement = 1 / (60 * transitionTime);
        let transitionStartCameraPosition = new THREE.Vector3();
        let transitionStartCameraQuaternion = new THREE.Quaternion();

        function easeInOutCubic(x) {
            return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
        }

        let theta = 0;
        let lastTime = 0;
        const targetFPS = 60;
        const frameInterval = 1000 / targetFPS;

        function update(currentTime) {
            const deltaTime = currentTime - lastTime;

            if (deltaTime < frameInterval) return; // Skip frame if too soon

            lastTime = currentTime - (deltaTime % frameInterval);
            theta += 0.005;

            let targetPosition = new THREE.Vector3(
                Math.sin(theta) * 3,
                Math.sin(theta),
                Math.cos(theta) * 3
            );

            let targetQuaternion = new THREE.Quaternion().setFromEuler(
                new THREE.Euler(0, -theta, 0)
            );

            if (isUserInteracting) {
                if (transitionProgress > 0) {
                    transitionProgress = 0;
                }
                transitionStartCameraPosition.copy(camera.position);
                transitionStartCameraQuaternion.copy(camera.quaternion);
            } else {
                if (transitionProgress < 1) {
                    transitionProgress += transitionIncrement;
                    let easedProgress = easeInOutCubic(transitionProgress);

                    camera.position.lerpVectors(
                        transitionStartCameraPosition,
                        targetPosition,
                        easedProgress
                    );
                    camera.quaternion.slerp(
                        transitionStartCameraQuaternion,
                        targetQuaternion,
                        easedProgress
                    );
                } else {
                    camera.position.copy(targetPosition);
                    camera.quaternion.copy(targetQuaternion);
                }
            }

            camera.lookAt(scene.position);
        }

        controls.addEventListener("start", function () {
            isUserInteracting = true;
        });

        controls.addEventListener("end", function () {
            isUserInteracting = false;
            transitionStartCameraPosition.copy(camera.position);
            transitionStartCameraQuaternion.copy(camera.quaternion);
            transitionProgress = 0;
        });

        // Debounced resize handler
        let resizeTimeout;
        function onWindowResize() {
            if (resizeTimeout) clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                composer.setSize(window.innerWidth, window.innerHeight);
            }, 250); // 250ms debounce time
        }

        function animate(currentTime) {
            animationFrameId = requestAnimationFrame(animate);
            
            // Skip rendering if not visible in the viewport
            const canvas = renderer.domElement;
            const rect = canvas.getBoundingClientRect();
            const isVisible = (
                rect.bottom > 0 &&
                rect.right > 0 &&
                rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
                rect.left < (window.innerWidth || document.documentElement.clientWidth)
            );
            
            if (!isVisible) return;
            
            update(currentTime);
            controls.update();
            composer.render();
            renderer.info.reset();
        }

        window.addEventListener("resize", onWindowResize);
        animate();

        // Cleanup function
        return () => {
            window.removeEventListener("resize", onWindowResize);
            cancelAnimationFrame(animationFrameId);
            
            // Dispose resources
            if (renderer) {
                renderer.dispose();
                renderer.forceContextLoss();
            }
            
            if (controls) {
                controls.dispose();
            }
            
            // Dispose geometries and materials
            if (scene) {
                scene.traverse((object) => {
                    if (object.geometry) {
                        object.geometry.dispose();
                    }
                    
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
            }
            
            // Clean composer passes
            if (composer) {
                composer.passes.forEach((pass) => {
                    if (pass.dispose) {
                        pass.dispose();
                    }
                });
            }
        };
    }, [showContent]);

    return (
        <canvas
            id="canvas"
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
                opacity: showContent ? 1 : 0,
                transition: "opacity 1s",
            }}
        />
    );
};

export default ThreeScene;
