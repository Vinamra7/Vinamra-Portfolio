import styles from './Projects.module.css';
import { useState } from 'react';
import ProjectsBackground from './ProjectsBackground';

const projects = [
  {
    title: 'AI-Powered Black Hole Simulator',
    description: 'An interactive 3D simulation exploring gravitational physics and black hole dynamics using advanced WebGL rendering.',
    technologies: ['Three.js', 'WebGL', 'Physics Simulation']
  },
  {
    title: 'Quantum Encryption Platform',
    description: 'A cutting-edge web application implementing quantum-resistant encryption algorithms for secure communication.',
    technologies: ['React', 'Node.js', 'Quantum Cryptography']
  },
  {
    title: 'Decentralized Portfolio Tracker',
    description: 'A blockchain-integrated portfolio management platform with real-time crypto asset tracking and predictive analytics.',
    technologies: ['Solidity', 'Web3.js', 'React', 'Blockchain']
  }
];

export default function Projects({ showContent }) {
  const [isHoveringProject, setIsHoveringProject] = useState(false);

  return (
    <div className={styles.backgroundVideoContainer}>
      <ProjectsBackground showContent={showContent} />
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
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <div className={styles.techStack}>
                {project.technologies.map((tech, techIndex) => (
                  <span key={techIndex} className={styles.techBadge}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
