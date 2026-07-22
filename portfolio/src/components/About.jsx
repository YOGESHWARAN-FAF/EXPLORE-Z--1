import React from 'react';
import stackImage from '../assets/about/yogeshwaran.jpeg';

const About = () => {
  const expertSkills = [
    { name: "Linux", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg" },
    { name: "AWS", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
    { name: "Docker", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" },
    { name: "Jenkins", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jenkins/jenkins-original.svg" },
    { name: "Nginx", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nginx/nginx-original.svg" },
    { name: "n8n", img: "https://images.opencollective.com/n8n/0cf2c4b/logo/256.png" },
    { name: "Terraform", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/terraform/terraform-original.svg" },
    { name: "Git & GitHub", img: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" }
  ];

  return (
    <section id="about" className="bg-[#FFBA00] pt-20 pb-40 px-6 md:px-12 w-full relative overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">
        
        {/* Left Side: ID Badge and Skills */}
        <div className="flex flex-col items-center w-full md:w-[350px] shrink-0 mt-12 md:mt-0">
          
          <div data-aos="drop-bounce" className="relative flex justify-center w-full">
            {/* Lanyard string with floating pins */}
            <div className="absolute -top-32 left-1/2 w-3 h-40 bg-black/80 transform -translate-x-1/2 shadow-inner z-0">
              {/* Google Pin Charm */}
              <div 
                className="absolute top-[25px] left-1/2 -translate-x-1/2 -ml-3 w-7 h-7 rounded-full bg-white shadow-[0_4px_8px_rgba(0,0,0,0.3)] border border-gray-200 flex items-center justify-center rotate-[15deg] hover:scale-125 hover:rotate-[30deg] transition-all duration-300 z-10 cursor-pointer"
                title="Google Student Ambassador"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              </div>
              {/* Gemini Spark Pin Charm */}
              <div 
                className="absolute top-[75px] left-1/2 -translate-x-1/2 ml-3 w-7 h-7 rounded-full bg-zinc-950 shadow-[0_4px_8px_rgba(0,0,0,0.3)] border border-zinc-800 flex items-center justify-center -rotate-[10deg] hover:scale-125 hover:rotate-[-25deg] transition-all duration-300 z-10 cursor-pointer"
                title="Gemini Ambassador"
              >
                <svg className="w-4.5 h-4.5 text-[#FFBA00]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a1 1 0 011 1v3.1a1 1 0 01-2 0V3a1 1 0 011-1zm6.364 2.636a1 1 0 010 1.414l-2.192 2.192a1 1 0 01-1.414-1.414l2.192-2.192a1 1 0 011.414 0zM21 12a1 1 0 01-1 1h-3.1a1 1 0 010-2H20a1 1 0 011 1zm-2.636 6.364a1 1 0 01-1.414 0l-2.192-2.192a1 1 0 011.414-1.414l2.192 2.192a1 1 0 010 1.414zM12 21a1 1 0 01-1-1v-3.1a1 1 0 012 0V20a1 1 0 01-1 1zm-6.364-2.636a1 1 0 010-1.414l2.192-2.192a1 1 0 011.414 1.414l-2.192 2.192a1 1 0 01-1.414 0zM3 12a1 1 0 011-1h3.1a1 1 0 010 2H4a1 1 0 01-1-1zm2.636-6.364a1 1 0 011.414 0l2.192 2.192a1 1 0 01-1.414 1.414L5.636 5.636a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {/* Lanyard clip */}
            <div className="absolute -top-6 left-1/2 w-6 h-12 bg-gray-800 rounded border border-gray-700 transform -translate-x-1/2 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"></div>
            
            {/* Badge Card */}
            <div className="bg-gray-900 w-full max-w-[280px] rounded-2xl p-3 shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative z-20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              {/* Cutout Hole */}
              <div className="absolute -top-3 left-1/2 w-16 h-6 bg-gray-900 rounded-t-xl transform -translate-x-1/2 flex justify-center items-center">
                <div className="w-8 h-2 bg-black/30 rounded-full shadow-inner"></div>
              </div>
              {/* Image Container */}
              <div className="w-full aspect-[3/4] overflow-hidden rounded-xl bg-gray-800 border-2 border-transparent">
                <img 
                  src={stackImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Info Content */}
        <div data-aos="fade-left" data-aos-delay="200" className="flex-1 text-black mt-8 md:mt-0 relative z-20 w-full">
          
          <h2 className="text-4xl md:text-5xl font-black text-black mb-6 uppercase tracking-tight">GSA Learnings</h2>
          <div className="border-l-4 border-black pl-6 my-8">
            <p className="text-lg md:text-xl font-medium leading-relaxed max-w-3xl text-black/85 tracking-tight">
              "Through my journey as a <span className="font-extrabold text-black tracking-wide drop-shadow-[0_2px_10px_rgba(255,255,255,0.95)] animate-[pulse_3s_infinite] inline-block hover:scale-105 transition-transform duration-300">Google Gemini Student Ambassador (GSA)</span>, I have developed strong public speaking, technical leadership, and community building capabilities. I learned how to effectively explain advanced generative AI models to student developers and organize tech bootcamps, while sharpening my hands-on skills in automating and orchestrating workflows."
            </p>
            <div className="mt-6">
              <a 
                href="/GSA_cert.jpeg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-2.5 bg-black hover:bg-zinc-900 text-white font-bold rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 gap-2"
              >
                <span>View GSA Certificate</span>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </div>
          </div>

          {/* Expert In Section */}
          <div>
            <h3 className="text-xl font-black text-black mb-6 uppercase tracking-wider">Expert in:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {expertSkills.map((skill, index) => (
                <div 
                  key={index}
                  data-aos="zoom-in" 
                  data-aos-delay={300 + index * 50}
                  className="flex flex-col items-center justify-center p-3 bg-zinc-800/10 hover:bg-zinc-800/25 rounded-2xl transition-all duration-300 cursor-pointer border border-zinc-800/5 hover:scale-110 hover:shadow-md"
                  title={skill.name}
                >
                  <img src={skill.img} alt={skill.name} className="w-10 h-10 object-contain hover:rotate-6 transition-transform duration-300" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-700 mt-2 text-center whitespace-nowrap">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Torn paper divider at bottom */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none z-30 transform translate-y-1">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-20 fill-white">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.62,189.5,99.8,242.79,81.82,282.88,63.6,321.39,56.44Z"></path>
        </svg>
      </div>

      {/* Decorative stars */}
      <div className="absolute top-10 right-10 md:right-20 text-black opacity-30 animate-pulse">
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0l2.5 8.5L23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-2.5z"/></svg>
      </div>
      <div className="absolute bottom-32 left-4 md:left-20 text-black opacity-30 animate-pulse" style={{ animationDelay: '1s' }}>
        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0l2.5 8.5L23 12l-8.5 2.5L12 23l-2.5-8.5L1 12l8.5-2.5z"/></svg>
      </div>
    </section>
  );
};

export default About;
