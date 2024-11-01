// components/ThreeScene.js

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const ThreeScene = ({ showContent }) => {
    const canvasRef = useRef(null);

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

        // Add a gradient HDR background
        const hdrEquirect = new RGBELoader()
            .setPath("https://miroleon.github.io/daily-assets/")
            .load("GRADIENT_01_01_comp.hdr", function () {
                hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
            });

        // Add some fog to the scene for moodyness
        scene.fog = new THREE.Fog(0x11151c, 1, 100);
        scene.fog = new THREE.FogExp2(0x11151c, 0.4);

        // Load a texture for the 3d model
        const surfaceImperfection = new THREE.TextureLoader().load(
            "https://miroleon.github.io/daily-assets/surf_imp_02.jpg"
        );
        surfaceImperfection.wrapT = THREE.RepeatWrapping;
        surfaceImperfection.wrapS = THREE.RepeatWrapping;

        // Create a new MeshPhysicalMaterial for the 3d model
        const hands_mat = new THREE.MeshPhysicalMaterial({
            color: 0x606060,
            roughness: 0.2,
            metalness: 1,
            roughnessMap: surfaceImperfection,
            envMap: hdrEquirect,
            envMapIntensity: 1.5
        });

        // Load the 3d model as FBX
        const fbxloader = new FBXLoader();
        fbxloader.load(
            "https://miroleon.github.io/daily-assets/two_hands_01.fbx",
            function (object) {
                object.traverse(function (child) {
                    if (child.isMesh) {
                        child.material = hands_mat;
                    }
                });
                object.position.set(0, 0, 0);
                object.scale.setScalar(0.05);
                scene.add(object);
            }
        );

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

        const displacementTexture = new THREE.TextureLoader().load(
            "https://raw.githubusercontent.com/miroleon/displacement_texture_freebie/main/assets/1K/jpeg/normal/ml-dpt-21-1K_normal.jpeg",
            function (texture) {
                texture.minFilter = THREE.NearestFilter;
            }
        );

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
        opacity: showContent ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out'
    }} />;
};

export default ThreeScene;
