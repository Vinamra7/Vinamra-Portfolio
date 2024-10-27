export default function AboutMe({ showContent }) {
  return (
    <section 
      className={`
        fixed top-1/2 left-1/2 -translate-x-1/2 
        min-h-screen w-full 
        flex items-center justify-center 
        bg-white backdrop-blur-sm 
        transition-all duration-1000 ease-in-out 
        ${showContent 
          ? '-translate-y-1/2 scale-100 opacity-100' 
          : '-translate-y-1/2 scale-0 opacity-0'
        }
      `}
    >
      <div className="w-[90vw] md:w-[60vw] py-20">
        <h2 className={`text-3xl md:text-4xl font-light mb-8 text-black transition-opacity duration-500 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          About Me
        </h2>
        
        <div className={`space-y-6 text-lg md:text-xl font-light text-black/80 transition-opacity duration-500 delay-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <p>
            I'm a passionate Software Developer based in Bangalore, with expertise in building modern web applications 
            and solving complex problems.
          </p>
          
          <p>
            My journey in software development started with a curiosity for creating things that live on the internet. 
            Today, I specialize in building high-performance applications with clean, elegant, and efficient code.
          </p>
          
          <p>
            When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, 
            or sharing my knowledge with the developer community.
          </p>
        </div>
      </div>
    </section>
  );
}
