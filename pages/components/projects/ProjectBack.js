import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AccumulativeShadows, RandomizedLight, Center, Environment, OrbitControls } from '@react-three/drei';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './ProjectBack.module.css';

function ProjectBack() {
    const [roughness, setRoughness] = useState(1);
    const [blur, setBlur] = useState(0.65);
    const [preset, setPreset] = useState('sunset');
    const presets = ['sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment', 'studio', 'city', 'park', 'lobby'];
    const [isOpen, setIsOpen] = useState(false);
    const CollapsiblePanel = ({title, children}) =>{
        return (
            <div className={`${styles['collapsible-panel']} ${isOpen ? styles.open : styles.closed}`}>
                <div className={styles['panel-header']} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <FaChevronRight /> : <FaChevronLeft />}
                    {isOpen && <span>{title}</span>}
                </div>
                {isOpen && (
                    <div className={styles['panel-content']}>
                        {children}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={styles['app-container']}>
            <CollapsiblePanel title="Settings">
                <div className={styles['settings-container']}>
                    <div className={styles['setting-item']}>
                        <label htmlFor="roughness">Roughness</label>
                        <input
                            type="range"
                            id="roughness"
                            min="0"
                            max="1"
                            step="0.01"
                            value={roughness}
                            onChange={(e) => setRoughness(parseFloat(e.target.value))}
                        />
                    </div>

                    <div className={styles['setting-item']}>
                        <label htmlFor="blur">Blur</label>
                        <input
                            type="range"
                            id="blur"
                            min="0"
                            max="1"
                            step="0.01"
                            value={blur}
                            onChange={(e) => setBlur(parseFloat(e.target.value))}
                        />
                    </div>

                    <div className={styles['setting-item']}>
                        <label htmlFor="preset">Preset</label>
                        <select
                            id="preset"
                            value={preset}
                            onChange={(e) => setPreset(e.target.value)}
                        >
                            {presets.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </CollapsiblePanel>
            <Canvas shadows camera={{ position: [0, 0, 4.5], fov: 50 }}>
                <group position={[0, -0.65, 0]}>
                    <Sphere roughness={roughness} />
                    <AccumulativeShadows temporal frames={200} color="purple" colorBlend={0.5} opacity={1} scale={10} alphaTest={0.85}>
                        <RandomizedLight amount={8} radius={5} ambient={0.5} position={[5, 3, 2]} bias={0.001} />
                    </AccumulativeShadows>
                </group>
                <Env preset={preset} blur={blur} />
                <OrbitControls autoRotate autoRotateSpeed={4} enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.1} maxPolarAngle={Math.PI / 2.1} />
            </Canvas>
        </div>
    );
}

function Sphere({ roughness }) {
    return (
        <Center top>
            <mesh castShadow>
                <sphereGeometry args={[0.75, 64, 64]} />
                <meshStandardMaterial metalness={1} roughness={roughness} />
            </mesh>
        </Center>
    );
}

function Env({ preset, blur }) {
    return <Environment preset={preset} background blur={blur} />;
}


export default ProjectBack;
