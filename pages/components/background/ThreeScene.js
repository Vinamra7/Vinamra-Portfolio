// components/ThreeScene.js

import React, { useEffect, useRef } from "react";
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
    const assets = AssetLoader.getLoadedAssets();

    useEffect(() => {
        if (typeof window === "undefined" || !showContent) return;

        // Create a renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById("canvas"),
            antialias: true
        });

        // Set a default background color
        renderer.setClearColor(0x11151c);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Create a new Three.js scene
        const scene = new THREE.Scene();

        // Create a new camera
        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        camera.position.set(0, 0, 10);

        // Add controls to the camera/orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
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
        scene.fog = new THREE.Fog(0x11151c, 1, 100);
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
        function update() {
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

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener("resize", onWindowResize);

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            composer.render();
            update();
        }

        animate();

        return () => {
            window.removeEventListener("resize", onWindowResize);
            controls.removeEventListener("start", () => {});
            controls.removeEventListener("end", () => {});
            renderer.dispose();
            composer.dispose();
        };
    }, [showContent]);

    return <canvas id="canvas" ref={canvasRef} style={{ 
        width: "100%", 
        height: "100%", 
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 0,
        opacity: showContent ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        pointerEvents: 'auto'
    }} />;
};

export default ThreeScene;
