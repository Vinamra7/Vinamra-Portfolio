'use client'

import { Vector3 } from 'three'
import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, SpotLight, Sparkles } from '@react-three/drei'

if (typeof window !== 'undefined') {
    window.mouseX = 0
    window.mouseY = 0
    window.addEventListener('mousemove', (e) => {
        window.mouseX = e.clientX
        window.mouseY = e.clientY
    })
}

function useWindowSize() {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        function updateSize() {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        }
        
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', updateSize);
            updateSize();
        }

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return size;
}

export default function AboutBack() {
    const { width } = useWindowSize();
    
    // Adjust camera position and FOV based on screen size
    const cameraSettings = useMemo(() => {
        const isMobile = width < 768;
        const isTablet = width >= 768 && width < 1024;
        return {
            position: isMobile ? [-1, 1, 7] : isTablet ? [-1.5, 1.5, 6.5] : [-2, 2, 6],
            fov: isMobile ? 70 : 50,
            near: 1,
            far: 20
        };
    }, [width]);

    return (
        <Canvas
            shadows
            dpr={[1, 2]}
            camera={cameraSettings}
            gl={{
                clearColor: '#11151C',
                alpha: false,
                antialias: true,
                stencil: false,
                depth: true,
                powerPreference: "high-performance"
            }}
        >
            <color attach="background" args={['#11151C']} />
            <fog attach="fog" args={['#11151C', 5, 20]} />
            <ambientLight intensity={0.02} />
            <hemisphereLight
                intensity={0.05}
                groundColor="#11151C"
                color="#ffffff"
            />
            <Scene />
        </Canvas>
    )
}

function Scene() {
    const { width } = useWindowSize();
    const { nodes, materials } = useGLTF('https://lmiwzoiohfrsxaidpyfb.supabase.co/storage/v1/object/public/Models/low_poly_astro.glb')
    const astronautRef = useRef()

    // Calculate scale based on screen size with separate x, y, z scaling
    const modelScale = useMemo(() => {
        if (width < 480) {
            return [0.9, 0.9, 0.9]; // Mobile - smaller overall
        }
        if (width < 768) {
            return [1.1, 1.1, 1.1]; // Tablet - medium size
        }
        if (width < 1024) {
            return [1.3, 1.3, 1.3]; // Small desktop
        }
        return [1.5, 1.5, 1.5]; // Large desktop
    }, [width]);

    // Calculate position based on screen size
    const modelPosition = useMemo(() => {
        if (width < 480) {
            return [0, -2, 0]; // Mobile - centered and higher
        }
        if (width < 768) {
            return [1, -2.5, 0]; // Tablet
        }
        if (width < 1024) {
            return [2, -3, 0]; // Small desktop
        }
        return [5, -3.5, 0]; // Large desktop
    }, [width]);

    // Enhanced material with better properties
    const enhancedMaterial = useMemo(() => {
        const material = materials['Material.002'].clone()
        material.roughness = 0.4
        material.metalness = 0.6
        material.envMapIntensity = 2.0
        return material
    }, [materials])

    // Floating animation with screen-size-dependent amplitude
    useFrame((state) => {
        if (astronautRef.current) {
            const t = state.clock.getElapsedTime();
            const floatAmplitude = width < 768 ? 0.05 : 0.1; // Smaller floating movement on mobile
            const rotationAmplitude = width < 768 ? 0.01 : 0.02;
            
            const baseY = modelPosition[1];
            astronautRef.current.position.y = baseY + Math.sin(t * 0.5) * floatAmplitude;
            astronautRef.current.rotation.z = Math.sin(t * 0.3) * rotationAmplitude;
        }
    })

    return (
        <>
            <MovingSpot
                color="#697D95"
                position={width < 768 ? [3, 3, 3] : [5, 4, 3]}
                castShadow
                intensity={3.5}
                distance={12}
                angle={0.6}
                penumbra={0.4}
                decay={1.2}
                shadow-mapSize={[512, 512]}
                shadow-bias={-0.001}
            />
            <MovingSpot
                color="#0c8cbf"
                position={width < 768 ? [1, 3, 1] : [1.5, 4, 1]}
                castShadow
                intensity={3}
                distance={12}
                angle={0.6}
                penumbra={0.4}
                decay={1.2}
                shadow-mapSize={[512, 512]}
                shadow-bias={-0.001}
            />

            {/* Astronaut with floating animation */}
            <mesh
                ref={astronautRef}
                position={modelPosition}
                rotation={[-0.095, -Math.PI / 2, 0]}
                scale={modelScale}
                castShadow
                receiveShadow
                geometry={nodes.char_Cube001.geometry}
                material={enhancedMaterial}
                dispose={null}
            />

            {/* Subtle ground reflection */}
            {/*<mesh*/}
            {/*    receiveShadow*/}
            {/*    position={[5, -3.6, 0]}*/}
            {/*    rotation-x={-Math.PI / 2}*/}
            {/*>*/}
            {/*    <planeGeometry args={[4, 4]} />*/}
            {/*    <meshStandardMaterial*/}
            {/*        color="#141923"*/}
            {/*        roughness={0.8}*/}
            {/*        metalness={0.2}*/}
            {/*        transparent*/}
            {/*        opacity={0.3}*/}
            {/*    />*/}
            {/*</mesh>*/}

            {/* Particle effect around feet */}
            <Sparkles
                position={[5, -3.3, 0]}
                count={20}
                scale={[2, 0.5, 2]}
                size={0.4}
                speed={0.2}
                opacity={0.2}
                color="#0c8cbf"
            />
        </>
    )
}

function MovingSpot({ vec = new Vector3(), ...props }) {
    const light = useRef()
    const viewport = useThree((state) => state.viewport)

    useFrame(() => {
        if (light.current && light.current.target) {
            const mouseX = (window.mouseX || 0) / window.innerWidth * 2 - 1
            const mouseY = -((window.mouseY || 0) / window.innerHeight) * 2 + 1

            light.current.target.position.lerp(
                vec.set(
                    (mouseX * viewport.width) / 2,
                    (mouseY * viewport.height) / 2,
                    0
                ),
                0.1
            )
            light.current.target.updateMatrixWorld()
        }
    })

    return (
        <SpotLight
            ref={light}
            castShadow
            penumbra={1}
            distance={6}
            angle={0.35}
            attenuation={5}
            anglePower={4}
            intensity={1}
            shadow-mapSize={[512, 512]}
            shadow-bias={-0.0001}
            {...props}
        />
    )
}