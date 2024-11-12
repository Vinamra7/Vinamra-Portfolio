import styles from './Projects.module.css';

// Sample project data
const projects = [
  {
    title: 'Project 1',
    description: 'Description of project 1',
    imageUrl: '/images/project1.jpg',
  },
  {
    title: 'Project 2',
    description: 'Description of project 2',
    imageUrl: '/images/project2.jpg',
  },
  // Add more projects as needed
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
        <p>Explore our projects.</p>
        <div className={styles.projectsGrid}>
          {projects.map((project, index) => (
            <div key={index} className={styles.projectCard}>
              <img src={project.imageUrl} alt={project.title} className={styles.projectImage} />
              <h2>{project.title}</h2>
              <p>{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
