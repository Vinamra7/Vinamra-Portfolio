import Head from 'next/head';
import { useState, useEffect } from 'react';

// Text Scramble Hook
function useTextScramble(finalText) {
  const [text, setText] = useState({
    content: '',
    colors: new Array(finalText.length).fill('#ffffff')
  }); // Initialize with proper structure
  
  const characters = 'abcdefghijklmnopqrstuvwxyz#@$%&*';
  // Added yellow to scramble colors
  const scrambleColors = ['#22d3ee', '#ec4899', '#ffd700'];

  useEffect(() => {
    let iteration = 0;
    let interval;

    const scramble = () => {
      if (iteration >= finalText.length * 4) {
        setText({
          content: finalText,
          colors: new Array(finalText.length).fill('#ffffff')
        });
        clearInterval(interval);
        return;
      }

      const newContent = finalText
        .split('')
        .map((char, index) => {
          if (index < iteration / 4) {
            return finalText[index];
          }
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join('');

      const newColors = finalText.split('').map((_, index) => 
        index < iteration / 4 
          ? '#ffffff' 
          : scrambleColors[Math.floor(Math.random() * scrambleColors.length)]
      );

      setText({
        content: newContent,
        colors: newColors
      });

      iteration += 1;
    };

    interval = setInterval(scramble, 60);
    return () => clearInterval(interval);
  }, [finalText]);

  return text;
}

export default function Home() {
  const scrambledName = useTextScramble("Vinamra Mishra");

  return (
    <>
      <Head>
        <title>Vinamra's Portfolio</title>
        <meta name="description" content="Your portfolio description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="h-screen w-screen flex items-center justify-center">
        <div className="border border-white/50 w-[40vw] h-[40vh] flex flex-col items-center justify-center gap-3">
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light flex items-baseline">
            <span className="font-mono">Hi!</span>
            <span className="font-mono">&nbsp;I'm</span>
            <span className="font-mono">&nbsp;</span>
            <span className="font-mono inline-flex">
              {scrambledName.content.split('').map((char, index) => (
                <span key={index} style={{ color: scrambledName.colors[index] }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </p>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-light text-white">
            a Software Developer from Bangalore, India
          </p>
        </div>
      </main>
    </>
  );
}
