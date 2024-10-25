import { useEffect, useState } from 'react';
import styles from './CustomCursor.module.css';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const cursor = document.querySelector(`.${styles.cursor}`);

    const updateCursorPosition = (e) => {
      requestAnimationFrame(() => {
        // Update to center the cursor on the mouse position
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      });
    };

    window.addEventListener('mousemove', updateCursorPosition);

    // Hide the default cursor when component mounts
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', updateCursorPosition);
      // Restore the default cursor when component unmounts
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div
      className={styles.cursor}
      style={{
        // Remove the inline transform style as we're handling it in the event listener
        left: '-7px',  // Offset by half the cursor size
        top: '-7px'    // Offset by half the cursor size
      }}
    >
      <div className={styles.cursorInvert}></div>
      <div className={styles.cursorBorder}></div>
    </div>
  );
};

export default CustomCursor;
