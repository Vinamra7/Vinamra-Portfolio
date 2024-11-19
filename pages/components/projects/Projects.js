import styles from './Projects.module.css';
import { useRef, useState, useEffect } from 'react';

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

export default function Projects({ showContent }) {
  const [isHoveringProject, setIsHoveringProject] = useState(false);
  const backgroundVideoRef = useRef(null);

  // Only play background video when section is visible
  useEffect(() => {
    const video = backgroundVideoRef.current;
    if (showContent && video) {
      video.play().catch(() => { });
    } else if (!showContent && video) {
      video.pause();
    }
  }, [showContent]);

  return (
    <div className={styles.backgroundVideoContainer}>
      <video
        ref={backgroundVideoRef}
        loop
        muted
        playsInline
        preload="none"
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
              <VideoPlayer src={project.imageUrl} isVisible={showContent} />
              <h2>{project.title}</h2>
              <p>{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({ src, isVisible }) {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Control video playback based on visibility and hover
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible && isHovered) {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  }, [isVisible, isHovered]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        preload="none"
        className={styles.projectImage}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
