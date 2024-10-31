import styles from './AboutMe.module.css';

export default function AboutMe({ showContent }) {
  return (
    <section className={`${styles.container} ${showContent ? styles.visible : styles.hidden}`}>
      <div className={styles.content}>
        <div className={styles.titleBox}>
          <h2 className={`${styles.title} ${showContent ? styles.fadeIn : ''}`}>
            About Me
          </h2>
        </div>
        
        <div className={`${styles.descriptionBox} ${showContent ? styles.fadeIn : ''}`}>
          <div className={styles.descriptionContent}>
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
