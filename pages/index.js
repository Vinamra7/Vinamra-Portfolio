import Head from 'next/head';
import { useState, useEffect } from 'react';

// Text Scramble Hook
function useTextScramble(finalText) {
  const [text, setText] = useState('');
  const characters = 'abcdefghijklmnopqrstuvwxyz#@$%&*';

  useEffect(() => {
    let iteration = 0;
    let interval;

    const scramble = () => {
      if (iteration >= finalText.length * 4) {
        setText(finalText);
        clearInterval(interval);
        return;
      }

      setText(
        finalText
          .split('')
          .map((char, index) => {
            if (index < iteration / 4) {
              return finalText[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      iteration += 1;
    };

    // Changed from 30 to 60 milliseconds
    interval = setInterval(scramble, 45);
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
        <h1 className="text-4xl font-bold">{scrambledText}</h1>
        <h1 className="text-4xl font-bold">{scrambledText2}</h1>
      </main>
    </>
  );
}
