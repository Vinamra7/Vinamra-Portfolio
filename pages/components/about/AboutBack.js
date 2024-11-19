'use client'

import { Vector3 } from 'three'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, SpotLight, useTexture, Sparkles } from '@react-three/drei'

if (typeof window !== 'undefined') {
    window.mouseX = 0
    window.mouseY = 0
    window.addEventListener('mousemove', (e) => {
        window.mouseX = e.clientX
        window.mouseY = e.clientY
    })
}

export default function AboutBack() {
    return (
        <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [-2, 2, 6], fov: 50, near: 1, far: 20 }}
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
    const { nodes, materials } = useGLTF('https://lmiwzoiohfrsxaidpyfb.supabase.co/storage/v1/object/public/Models/low_poly_astro.glb')
    const astronautRef = useRef()

    // Enhanced material with better properties
    const enhancedMaterial = useMemo(() => {
        const material = materials['Material.002'].clone()
        material.roughness = 0.4
        material.metalness = 0.6
        material.envMapIntensity = 2.0
        return material
    }, [materials])

    // Floating animation
    useFrame((state) => {
        if (astronautRef.current) {
            const t = state.clock.getElapsedTime()
            astronautRef.current.position.y = -3.5 + Math.sin(t * 0.5) * 0.1
            astronautRef.current.rotation.z = Math.sin(t * 0.3) * 0.02
        }
    })

    return (
        <>
            <MovingSpot
                color="#697D95"
                position={[5, 4, 3]}
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
                position={[1.5, 4, 1]}
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
                position={[5, -3.5, 0]}
                rotation={[-0.095, -Math.PI/2, 0]}
                scale={1.5}
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