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
  const scrambledText = useTextScramble('Vinamra Mishra');
  const scrambledText2 = useTextScramble('Software Engineer');

  return (
    <>
      <Head>
        <title>Vinamra's Portfolio</title>
        <meta name="description" content="Your portfolio description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>
          {scrambledText.content.split('').map((char, index) => (
            <span key={index} style={{ color: scrambledText.colors[index] }}>
              {char}
            </span>
          ))}
        </p>
        <p className="text-4xl font-bold">
          {scrambledText2.content.split('').map((char, index) => (
            <span key={index} style={{ color: scrambledText2.colors[index] }}>
              {char}
            </span>
          ))}
        </p>
      </main>
    </>
  );
}
