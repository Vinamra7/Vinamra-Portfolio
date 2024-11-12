import styles from './Projects.module.css';

// Sample project data
const projects = [
  {
    title: 'Quantum Encryption Platform',
    description: 'A cutting-edge web application implementing quantum-resistant encryption algorithms for secure communication.',
    imageUrl: '/vid/encryption.webm',
    technologies: ['React', 'Node.js', 'Quantum Cryptography']
  },
  {
    title: 'AI-Powered Black Hole Simulator',
    description: 'An interactive 3D simulation exploring gravitational physics and black hole dynamics using advanced WebGL rendering.',
    imageUrl: '/vid/blackhole.webm',
    technologies: ['Three.js', 'WebGL', 'Physics Simulation']
  },
  {
    title: 'Decentralized Portfolio Tracker',
    description: 'A blockchain-integrated portfolio management platform with real-time crypto asset tracking and predictive analytics.',
    imageUrl: '/vid/cards-video.webm',
    technologies: ['Solidity', 'Web3.js', 'React', 'Blockchain']
  }
];

export default function Projects() {
  return (
    <div className={styles.backgroundVideoContainer}>
      <video autoPlay loop muted playsInline className={styles.backgroundVideo}>
        <source src="/vid/cards-video.webm" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <div className={styles.content}>
        <h1>Projects</h1>
        <p>Innovative solutions at the intersection of technology and creativity</p>
        <div className={styles.projectsGrid}>
          {projects.map((project, index) => (
            <div key={index} className={styles.projectCard}>
              <video
                autoPlay
                loop
                muted
                playsInline
                className={styles.projectImage}
              >
                <source src={project.imageUrl} type="video/webm" />
                Your browser does not support the video tag.
              </video>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
