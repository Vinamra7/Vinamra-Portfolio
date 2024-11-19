import styles from './Projects.module.css';
import { useRef, useState } from 'react';

// Sample project data
const projects = [
  {
    title: 'AI-Powered Black Hole Simulator',
    description: 'An interactive 3D simulation exploring gravitational physics and black hole dynamics using advanced WebGL rendering.',
    imageUrl: '/vid/data.mp4',
    technologies: ['Three.js', 'WebGL', 'Physics Simulation']
  },
  {
    title: 'Quantum Encryption Platform',
    description: 'A cutting-edge web application implementing quantum-resistant encryption algorithms for secure communication.',
    imageUrl: '/vid/data.mp4',
    technologies: ['React', 'Node.js', 'Quantum Cryptography']
  },
  {
    title: 'Decentralized Portfolio Tracker',
    description: 'A blockchain-integrated portfolio management platform with real-time crypto asset tracking and predictive analytics.',
    imageUrl: '/vid/space1.mp4',
    technologies: ['Solidity', 'Web3.js', 'React', 'Blockchain']
  }
];

export default function Projects() {
  const [isHoveringProject, setIsHoveringProject] = useState(false);

  return (
    <div className={styles.backgroundVideoContainer}>
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className={`${styles.backgroundVideo} ${isHoveringProject ? styles.colorized : ''}`}
      >
        <source src="/vid/encryption.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <div className={styles.content}>
        <h1>Projects</h1>
        <p>Innovative solutions at the intersection of technology and creativity</p>
        <div className={styles.projectsGrid}>
          {projects.map((project, index) => (
            <div 
              key={index} 
              className={styles.projectCard}
              onMouseEnter={() => setIsHoveringProject(true)}
              onMouseLeave={() => setIsHoveringProject(false)}
            >
              <VideoPlayer src={project.imageUrl} />
              <h2>{project.title}</h2>
              <p>{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ src }) {
  const videoRef = useRef(null);

  return (
    <video
      ref={videoRef}
      loop
      muted
      playsInline
      autoPlay
      className={styles.projectImage}
    >
      <source src={src} type="video/webm" />
      Your browser does not support the video tag.
    </video>
  );
}
