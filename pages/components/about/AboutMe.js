import styles from './AboutMe.module.css';
import AboutBack from './AboutBack';

export default function AboutMe({ showContent }) {
  return (
    <section 
      className={`${styles.container} ${showContent ? styles.visible : styles.hidden}`}
      style={{ pointerEvents: 'none' }}
    >
      <div 
        className={styles.background}
        style={{ pointerEvents: 'auto' }}
      >
        <AboutBack />
      </div>
      <div 
        className={styles.content} 
        style={{ pointerEvents: 'none' }}
      >
        <div 
          className={styles.titleBox}
          style={{ pointerEvents: 'none' }}
        >
          <h2 
            className={`${styles.title} ${showContent ? styles.fadeIn : ''}`}
            style={{ pointerEvents: 'none' }}
          >
            About Me
          </h2>
        </div>
        
        <div 
          className={`${styles.descriptionBox} ${showContent ? styles.fadeIn : ''}`}
          style={{ pointerEvents: 'none' }}
        >
          <div 
            className={styles.descriptionContent}
            style={{ pointerEvents: 'none' }}
          >
            <p>
              I'm a passionate Software Developer based in Bangalore, with expertise in building modern web applications 
              and solving complex problems.
            </p>
            
            <p>
              My journey in software development started with a curiosity for creating things that live on the internet. 
              Today, I specialize in building high-performance applications with clean, elegant, and efficient code.
            </p>
            
            <p>
              When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, 
              or sharing my knowledge with the developer community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
