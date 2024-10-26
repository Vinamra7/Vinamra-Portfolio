import Head from 'next/head';
import { useState, useEffect } from 'react';

// Text Scramble Hook
function useTextScramble(finalText) {
  const [text, setText] = useState('');
  const characters = 'abcdefghijklmnopqrstuvwxyz#@$%&*';
  const colors = ['text-white', 'text-cyan-400', 'text-pink-500'];

  useEffect(() => {
    let iteration = 0;
    let interval;

    const scramble = () => {
      if (iteration >= finalText.length * 4) {
        setText({ content: finalText, color: 'text-white' });
        clearInterval(interval);
        return;
      }

      setText({
        content: finalText
          .split('')
          .map((char, index) => {
            if (index < iteration / 4) {
              return finalText[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join(''),
        color: colors[Math.floor(Math.random() * colors.length)]
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
        <p className={`${scrambledText.color}`}>{scrambledText.content}</p>
        <p className={`text-4xl font-bold ${scrambledText2.color}`}>
          {scrambledText2.content}
        </p>
      </main>
    </>
  );
}
