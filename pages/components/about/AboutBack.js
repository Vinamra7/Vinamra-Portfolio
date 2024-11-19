'use client'

import { Vector3 } from 'three'
import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, SpotLight } from '@react-three/drei'

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
            {/* Reduced ambient light intensity for better spotlight visibility */}
            <ambientLight intensity={0.02} />
            {/* Adjusted hemisphere light */}
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

    // Create a modified material with adjusted properties
    const enhancedMaterial = materials['Material.002'].clone()
    enhancedMaterial.roughness = 0.4
    enhancedMaterial.metalness = 0.6
    enhancedMaterial.envMapIntensity = 2.0

    return (
        <>
            <MovingSpot 
                color="#0c8cbf" 
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
                color="#697D95" 
                position={[3, 4, 1]} 
                castShadow
                intensity={3}
                distance={12}
                angle={0.6}
                penumbra={0.4}
                decay={1.2}
                shadow-mapSize={[512, 512]}
                shadow-bias={-0.001}
            />

            <mesh
                ref={astronautRef}
                position={[4, -2, 0]}
                rotation={[0, -Math.PI/2, 0]}
                castShadow
                receiveShadow
                geometry={nodes.char_Cube001.geometry}
                material={enhancedMaterial}
                dispose={null}
            />

            {/* Add a floor to receive shadows */}
            {/* <mesh
                receiveShadow
                position={[0, -2.1, 0]}
                rotation-x={-Math.PI / 2}
            >
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial
                    color="#141923"
                    roughness={0.5}
                    metalness={0.3}
                    depthWrite={true}
                    transparent={true}
                    opacity={0.6}
                />
            </mesh> */}
        </>
    )
}

function MovingSpot({ vec = new Vector3(), ...props }) {
    const light = useRef()
    const viewport = useThree((state) => state.viewport)

    useFrame(() => {
        if (light.current && light.current.target) {
            // Get global mouse position instead of using Three.js mouse state
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