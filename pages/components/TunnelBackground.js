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

    // Your tunnel effect constants
    const tunnelSegments = 8;
    const speed = 0.0006;
    let offset = 0;

    // Copy all your existing functions here
    const drawTunnel = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < tunnelSegments; i++) {
        const depth = i / tunnelSegments + offset;
        // Increased the base size to 120% of the canvas dimensions
        const width = canvas.width * 1.2 * Math.pow(0.8, depth * tunnelSegments);
        const height = canvas.height * 1.2 * Math.pow(0.8, depth * tunnelSegments);
        const x = canvas.width / 2;
        const y = canvas.height / 2;

        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - depth})`;
        ctx.lineWidth = 0.15; // Reduced line thickness

        // Draw outer box
        ctx.beginPath();
        ctx.rect(x - width / 2, y - height / 2, width, height);
        ctx.stroke();

        // Draw connecting lines to next segment if not the last segment
        if (i < tunnelSegments - 1) {
          const nextDepth = (i + 1) / tunnelSegments + offset;
          // Increased the base size for the next segment as well
          const nextWidth = canvas.width * 1.2 * Math.pow(0.8, nextDepth * tunnelSegments);
          const nextHeight = canvas.height * 1.2 * Math.pow(0.8, nextDepth * tunnelSegments);
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

          // Draw the tilted lines to create a wall effect
          drawWallLines(x, y, width, height, nextWidth, nextHeight);
        }
      }

    };

    const drawWallLines = (x, y, width, height, nextWidth, nextHeight) => {

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 0.21;

      // Left side lines
      for (let i = 1; i <= 3; i++) {
        const factor = i / 4;
        ctx.beginPath();
        ctx.moveTo(x - width / 2, y - height / 2 + height * factor);
        ctx.lineTo(x - nextWidth / 2, y - nextHeight / 2 + nextHeight * factor);
        ctx.stroke();
      }

      // Right side lines
      for (let i = 1; i <= 3; i++) {
        const factor = i / 4;
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y - height / 2 + height * factor);
        ctx.lineTo(x + nextWidth / 2, y - nextHeight / 2 + nextHeight * factor);
        ctx.stroke();
      }

      // Top side lines
      for (let i = 1; i <= 4; i++) {
        const factor = i / 5;
        ctx.beginPath();
        ctx.moveTo(x - width / 2 + width * factor, y - height / 2);
        ctx.lineTo(x - nextWidth / 2 + nextWidth * factor, y - nextHeight / 2);
        ctx.stroke();
      }

      // Bottom side lines
      for (let i = 1; i <= 4; i++) {
        const factor = i / 5;
        ctx.beginPath();
        ctx.moveTo(x - width / 2 + width * factor, y + height / 2);
        ctx.lineTo(x - nextWidth / 2 + nextWidth * factor, y + nextHeight / 2);
        ctx.stroke();
      }
    };

    const drawBlurredCloud = () => {

      const x = canvas.width / 2;
      const y = canvas.height / 2;
      const maxDimension = Math.max(canvas.width, canvas.height);
      const radiusX = canvas.width * 100; // Increased size
      const radiusY = canvas.height * 100; // Increased size

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, maxDimension / 2);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
      gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      offset += speed;
      if (offset >= 1 / tunnelSegments) {
        offset = 0;
      }
      drawTunnel();
      drawBlurredCloud();
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
            }}
        />
  );
};

export default TunnelBackground;