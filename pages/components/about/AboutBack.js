'use client'

import { Vector3 } from 'three'
import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, SpotLight } from '@react-three/drei'

export default function AboutBack() {
    return (
        <Canvas
            shadows="soft"
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
            {/* Increased ambient light intensity */}
            <ambientLight intensity={0.05} />
            {/* Added hemisphere light for better ambient lighting */}
            <hemisphereLight
                intensity={0.1}
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
    enhancedMaterial.roughness = 0.7
    enhancedMaterial.metalness = 0.3
    enhancedMaterial.envMapIntensity = 1.5

    return (
        <>
            <MovingSpot color="#0c8cbf" position={[3, 3, 2]} />
            <MovingSpot color="#697D95" position={[1, 3, 0]} />

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

            <mesh
                receiveShadow
                position={[0, -2.1, 0]}
                rotation-x={-Math.PI / 2}
            >
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial
                    color="#11151C"
                    roughness={0.9}
                    metalness={0.1}
                    depthWrite={true}
                />
            </mesh>
        </>
    )
}

function MovingSpot({ vec = new Vector3(), ...props }) {
    const light = useRef()
    const viewport = useThree((state) => state.viewport)

    useFrame((state) => {
        if (light.current && light.current.target) {
            light.current.target.position.lerp(
                vec.set(
                    (state.mouse.x * viewport.width) / 2,
                    (state.mouse.y * viewport.height) / 2,
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
            intensity={1} // Reduced spotlight intensity to balance with ambient light
            shadow-mapSize={[512, 512]}
            shadow-bias={-0.0001}
            {...props}
        >
            {/* <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color={props.color} />
            </mesh> */}
        </SpotLight>
    )
}