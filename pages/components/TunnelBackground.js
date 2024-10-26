import { useEffect, useRef } from 'react';


const TunnelBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    // Updated constants
    const tunnelSegments = 12;
    const speed = 0.003;        // Slightly adjusted for smoother movement
    let offset = 0;

    const drawTunnel = () => {
      // Darker trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < tunnelSegments; i++) {
        const depth = i / tunnelSegments + offset;
        const width = canvas.width * Math.pow(0.8, depth * tunnelSegments);
        const height = canvas.height * Math.pow(0.8, depth * tunnelSegments);
        const x = canvas.width / 2;
        const y = canvas.height / 2;

        // Progressive line thickness - thinner at back, thicker at front
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - depth})`;
        ctx.lineWidth = depth * 0.3; // Will go from almost 0 to 0.3

        // Draw outer box
        ctx.beginPath();
        ctx.rect(x - width / 2, y - height / 2, width, height);
        ctx.stroke();

        // Draw connecting lines even thinner
        if (i < tunnelSegments - 1) {
          const nextDepth = (i + 1) / tunnelSegments + offset;
          const nextWidth = canvas.width * Math.pow(0.8, nextDepth * tunnelSegments);
          const nextHeight = canvas.height * Math.pow(0.8, nextDepth * tunnelSegments);
          
          // Ultra thin for diagonal lines
          ctx.lineWidth = depth * 0.15; // Half as thin as the boxes
          
          ctx.beginPath();
          ctx.moveTo(x - width / 2, y - height / 2);
          ctx.lineTo(x - nextWidth / 2, y - nextHeight / 2);
          ctx.moveTo(x + width / 2, y - height / 2);
          ctx.lineTo(x + nextWidth / 2, y - nextHeight / 2);
          ctx.moveTo(x + width / 2, y + height / 2);
          ctx.lineTo(x + nextWidth / 2, y + nextHeight / 2);
          ctx.moveTo(x - width / 2, y + height / 2);
          ctx.lineTo(x - nextWidth / 2, y + nextHeight / 2);
          ctx.stroke();
        }
      }
    };

    const animate = () => {
      offset += speed;
      if (offset >= 1 / tunnelSegments) {
        offset = 0;
      }
      drawTunnel();
      requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle resize
    window.addEventListener('resize', updateCanvasSize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        filter: 'blur(0.5px)', // Add subtle blur effect
      }}
    />
  );
};

export default TunnelBackground;
