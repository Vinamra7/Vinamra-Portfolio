import styles from './AboutMe.module.css';
import AboutBack from './AboutBack';

export default function AboutMe({ showContent }) {
  return (
    <section
      className={`${styles.container} ${showContent ? styles.visible : styles.hidden}`}
    >
      <div
        className={styles.background}
        style={{ pointerEvents: 'auto' }}
      >
        <AboutBack />
      </div>
      <div
        className={styles.content}
      >
        <div
          className={styles.titleBox}
        >
          <h2
            className={`${styles.title} ${showContent ? styles.fadeIn : ''}`}
          >
            About Me
          </h2>
        </div>

        <div
          className={`${styles.descriptionBox} ${showContent ? styles.fadeIn : ''}`}
        >
          <div
            className={styles.descriptionContent}
          >
            <p className={`${styles.typingAnimation} ${styles.line1}`}>
              I'm a software developer and a recent Computer Science graduate from Birla Institute of Technology, Mesra.
            </p>
            <p className={`${styles.typingAnimation} ${styles.line2}`}>
              My interest in technology grew from a love for solving problems, which naturally led me to competitive programming. It has honed my analytical skills and deepened my passion for coding.
            </p>
            <p className={`${styles.typingAnimation} ${styles.line3}`}>
              I enjoy exploring new technologies and staying updated with the latest trends in the tech world, always eager to learn something new.
            </p>
            <p className={`${styles.typingAnimation} ${styles.line4}`}>
              I also explore open-source projects, contributing through code improvements and collaborations that help enhance my skills and knowledge.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
