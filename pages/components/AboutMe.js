export default function AboutMe({ showContent }) {
  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-[90vw] md:w-[60vw] py-20">
        <h2 className={`text-3xl md:text-4xl font-light mb-8 transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          About Me
        </h2>
        
        <div className={`space-y-6 text-lg md:text-xl font-light text-white/80 transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
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
