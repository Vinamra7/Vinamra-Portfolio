import { Vector3 } from 'three'
import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, SpotLight, useDepthBuffer } from '@react-three/drei'

export default function AboutBack(){
    return (
        <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [-2, 2, 6], fov: 50, near: 1, far: 20 }}
            gl={{
                clearColor: '#2c3e50',
                alpha: false,
                antialias: true
            }}
        >
            <color attach="background" args={['#2c3e50']} />
            <fog attach="fog" args={['#2c3e50', 5, 20]} />
            <ambientLight intensity={0.015} />
            <Scene />
        </Canvas>
    )
}
function Scene() {
    const depthBuffer = useDepthBuffer({ frames: 1 })
    const { nodes, materials } = useGLTF('https://lmiwzoiohfrsxaidpyfb.supabase.co/storage/v1/object/public/Models/low_poly_astro.glb')
    const astronautRef = useRef()

    return (
        <>
            <MovingSpot depthBuffer={depthBuffer} color="#0c8cbf" position={[3, 3, 2]} />
            <MovingSpot depthBuffer={depthBuffer} color="#b00c3f" position={[1, 3, 0]} />
            <mesh
                ref={astronautRef}
                position={[3, -2, 0]}
                rotation={[0, -Math.PI/2 , 0]}
                castShadow
                receiveShadow
                geometry={nodes.char_Cube001.geometry}
                material={materials['Material.002']}
                dispose={null}
            />
            <mesh receiveShadow position={[0, -2.1, 0]} rotation-x={-Math.PI / 2}>
                <planeGeometry args={[50, 50]} />
                <meshPhongMaterial />
            </mesh>
        </>
    )
}

function MovingSpot({ vec = new Vector3(), ...props }) {
    const light = useRef()
    const viewport = useThree((state) => state.viewport)
    useFrame((state) => {
        light.current.target.position.lerp(vec.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, 0), 0.1)
        light.current.target.updateMatrixWorld()
    })
    return <SpotLight castShadow ref={light} penumbra={1} distance={6} angle={0.35} attenuation={5} anglePower={4} intensity={2} {...props} />
}