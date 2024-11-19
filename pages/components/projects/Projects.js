import styles from './Projects.module.css';
import { useRef, useState, useEffect } from 'react';

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

function VideoPlayer({ src, isVisible }) {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isLoaded && !hasError) {
          const video = videoRef.current;
          if (video) {
            video.load();
          }
        }
      });
    }, options);

    if (videoRef.current) {
      observerRef.current.observe(videoRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoaded, hasError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoaded(true); // Still mark as loaded to remove loading state
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded || hasError) return;

    if (isVisible && isHovered) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented, do nothing
        });
      }
    } else {
      video.pause();
    }
  }, [isVisible, isHovered, isLoaded, hasError]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={styles.videoWrapper}
    >
      {!hasError ? (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          className={`${styles.projectImage} ${isLoaded ? styles.loaded : ''}`}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <div className={styles.fallbackImage} />
      )}
      {!isLoaded && <div className={styles.videoPlaceholder} />}
    </div>
  );
}

export default function Projects({ showContent }) {
  const [isHoveringProject, setIsHoveringProject] = useState(false);
  const backgroundVideoRef = useRef(null);
  const [isBackgroundVideoLoaded, setIsBackgroundVideoLoaded] = useState(false);
  const [hasBackgroundError, setHasBackgroundError] = useState(false);

  useEffect(() => {
    const video = backgroundVideoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsBackgroundVideoLoaded(true);
    };

    const handleError = () => {
      setHasBackgroundError(true);
      setIsBackgroundVideoLoaded(true); // Remove loading state
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    if (showContent && !isBackgroundVideoLoaded && !hasBackgroundError) {
      // Defer loading slightly to prioritize main content
      const timer = setTimeout(() => {
        video.load();
      }, 100);
      return () => clearTimeout(timer);
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [showContent, isBackgroundVideoLoaded, hasBackgroundError]);

  useEffect(() => {
    const video = backgroundVideoRef.current;
    if (!video || !isBackgroundVideoLoaded || hasBackgroundError) return;

    if (showContent) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented, do nothing
        });
      }
    } else {
      video.pause();
    }
  }, [showContent, isBackgroundVideoLoaded, hasBackgroundError]);

  return (
    <div className={styles.backgroundVideoContainer}>
      {!hasBackgroundError ? (
        <video
          ref={backgroundVideoRef}
          loop
          muted
          playsInline
          className={`${styles.backgroundVideo} ${isHoveringProject ? styles.colorized : ''} ${isBackgroundVideoLoaded ? styles.loaded : ''}`}
        >
          <source src="/vid/encryption.webm" type="video/webm" />
        </video>
      ) : (
        <div className={styles.fallbackBackground} />
      )}
      {!isBackgroundVideoLoaded && <div className={styles.backgroundPlaceholder} />}
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
