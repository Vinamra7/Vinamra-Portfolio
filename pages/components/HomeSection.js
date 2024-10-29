import {useEffect, useState} from "react";
import TunnelBackground from "./TunnelBackground";
import ThreeScene from "./background/ThreeScene";

// Text Scramble Hook
function useTextScramble(finalText, startAnimation) {
    const [text, setText] = useState({
        content: '',
        colors: new Array(finalText.length).fill('#ffffff')
    }); // Initialize with proper structure

    const characters = 'abcdefghijklmnopqrstuvwxyz#@$%&*';
    // Added yellow to scramble colors
    const scrambleColors = ['#22d3ee', '#ec4899', '#ffd700'];

    useEffect(() => {
        // Only start animation if startAnimation is true
        if (!startAnimation) {
            setText({
                content: '',
                colors: new Array(finalText.length).fill('#ffffff')
            });
            return;
        }

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
    }, [finalText, startAnimation]); // Add startAnimation to dependencies

    return text;
}

export default function HomeSection({showContent}){
    const [startAnimation, setStartAnimation] = useState(false);
    const scrambledName = useTextScramble("Vinamra Mishra", startAnimation);

    useEffect(() => {
        if (showContent) {
            const timer = setTimeout(() => {
                setStartAnimation(true);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [showContent]);

    // Add scroll handler
    const handleScrollClick = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    };

    return <>
    <ThreeScene />
    <section className="h-screen w-full flex items-center justify-center relative">
        <div
            className="border border-white/50 w-[90vw] md:w-[40vw] h-[40vh] flex flex-col items-center justify-center gap-3 bg-transparent">
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light flex items-baseline">
              <span
                  className={`font-mono transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                Hi! I'm&nbsp;
              </span>
                <span className="font-mono inline-flex">
                {scrambledName.content.split('').map((char, index) => (
                    <span key={index} style={{color: scrambledName.colors[index]}}>
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </span>
            </p>

            {/* Updated text container with whitespace-nowrap */}
            <p className={`text-sm sm:text-base md:text-lg lg:text-xl font-light text-white transition-opacity duration-500 whitespace-nowrap ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                a Software Developer from Bangalore, India
            </p>

            {/* Buttons container with opacity transition */}
            <div
                className={`flex gap-8 mt-8 transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                <a
                    href="https://www.linkedin.com/in/vinamra-mishra-10597420a/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative cursor-none"
                >
                    <div
                        className="absolute inset-0 translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-200">
                        <div
                            className="absolute right-0 h-full w-2 bg-[#A88E9D] origin-right skew-y-[45deg] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        <div
                            className="absolute bottom-0 w-full h-2 bg-[#697D95] origin-bottom skew-x-[45deg] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    <button
                        className="px-6 py-2 border border-white/50 bg-transparent text-white relative transition-all duration-200 group-hover:bg-white group-hover:text-black cursor-none opacity-70">
                        LinkedIn
                    </button>
                </a>

                <a
                    href="https://github.com/Vinamra7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative cursor-none"
                >
                    <div
                        className="absolute inset-0 translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-200">
                        <div
                            className="absolute right-0 h-full w-2 bg-[#A88E9D] origin-right skew-y-[45deg] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        <div
                            className="absolute bottom-0 w-full h-2 bg-[#697D95] origin-bottom skew-x-[45deg] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    <button
                        className="px-6 py-2 border border-white/50 bg-transparent text-white relative transition-all duration-200 group-hover:bg-white group-hover:text-black cursor-none opacity-70">
                        GitHub
                    </button>
                </a>
            </div>

            {/* Scroll Button */}
            <button
                onClick={handleScrollClick}
                className={`
                    absolute bottom-8 left-1/2 -translate-x-1/2
                    flex items-center
                    transition-all duration-300 cursor-none
                    border border-white/50
                    hover:border-white hover:bg-white
                    hover:transform hover:scale-105
                    group text-sm
                    ${showContent ? 'opacity-100' : 'opacity-0'}
                `}
            >
                <div className="border-r border-white/50 p-3 group-hover:border-black">
                    <svg
                        className="w-5 h-5 text-white transition-colors duration-300 group-hover:text-black animate-bounce"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                </div>
                <span className="text-white/80 px-4 transition-colors duration-300 group-hover:text-black">
                    Scroll Down
                </span>
            </button>
        </div>
    </section>
    </>
}
