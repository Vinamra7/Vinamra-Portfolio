import styles from './Projects.module.css';

export default function Projects() {
  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>Projects</h2>
        <div className={styles.projectGrid}>
          {/* Project Card 1 */}
          <div className={styles.projectCard}>
            <h3 className={styles.projectTitle}>Project 1</h3>
            <p className={styles.projectDescription}>
              A detailed description of project 1. Explain the tech stack, your role, and the impact.
            </p>
            <div className={styles.techStack}>
              <span>React</span>
              <span>Node.js</span>
              <span>MongoDB</span>
            </div>
            <div className={styles.projectLinks}>
              <a href="#" target="_blank" rel="noopener noreferrer">Live Demo</a>
              <a href="#" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>

          {/* Project Card 2 */}
          <div className={styles.projectCard}>
            <h3 className={styles.projectTitle}>Project 2</h3>
            <p className={styles.projectDescription}>
              A detailed description of project 2. Explain the tech stack, your role, and the impact.
            </p>
            <div className={styles.techStack}>
              <span>Next.js</span>
              <span>Three.js</span>
              <span>TailwindCSS</span>
            </div>
            <div className={styles.projectLinks}>
              <a href="#" target="_blank" rel="noopener noreferrer">Live Demo</a>
              <a href="#" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 