import styles from './Projects.module.css';
import { useState } from 'react';
import ProjectsBackground from './ProjectsBackground';

const projects = [
  {
    title: 'Space - Interview Platform',
    description: 'A collaborative coding platform with integrated development environment, real-time pair programming, and interview capabilities. Features include code compilation, video calling, and interactive problem solving.',
    technologies: ['React', 'Node.js', 'WebRTC', 'Socket.IO']
  },
  {
    title: 'Distributed Caching System',
    description: 'An enterprise-grade distributed caching solution featuring real-time data synchronization, user management, and cloud scalability powered by Node.js and Redis.',
    technologies: ['Node.js', 'Redis', 'MongoDB']
  },
  {
    title: 'Personal Portfolio Website',
    description: 'A modern, dynamic portfolio website built with Next.js featuring smooth scroll animations, interactive project showcases, and a responsive design. Implements dynamic content loading and seamless section transitions for an engaging user experience.',
    technologies: ['Next.JS', 'Three.js', 'React']
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
