import React, { useRef, useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
// Corrected import path for the video
import heroVideo from '../assets/hero video/hero_video.mp4';

const Hero = ({ isPreloaderActive }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out'
    });
  }, []);

  useEffect(() => {
    // Attempt muted autoplay after preloader completes
    if (!isPreloaderActive && videoRef.current) {
      videoRef.current.muted = true;
      setIsMuted(true);
      
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.log("Autoplay blocked by browser. Displaying play button.", err);
          setIsPlaying(false);
        });
    }
  }, [isPreloaderActive]);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log(err));
    }
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuteState = !isMuted;
      videoRef.current.muted = nextMuteState;
      setIsMuted(nextMuteState);
    }
  };

  return (
    <section id="home" className="relative w-full h-screen overflow-hidden bg-[#FFBA00]">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted={isMuted}
        loop
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="absolute top-0 left-0 w-full h-full object-cover z-0 brightness-[1.12] contrast-[1.03] saturate-[1.05]"
      >
        <source src={heroVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content Container */}
      <div className="absolute inset-0 z-20 px-6 pb-6 md:pb-[8%] md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-end md:justify-between items-start md:items-end text-left w-full">
        
        {/* Left Side: Text and Buttons */}
        <div className="flex flex-col items-start text-left max-w-2xl w-full">
          {/* Main Heading */}
          <h1 
            data-aos="fade-up"
            className="text-white text-3xl md:text-5xl font-bold mb-2 md:mb-4 tracking-tight"
          >
            Hi, I’m <br /> 
            <span className="text-transparent [-webkit-text-stroke:1.5px_white] font-black uppercase text-4xl md:text-6xl block mt-2">
              Yogeshwaran M
            </span>
          </h1>

          {/* Subheading */}
          <p 
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-white text-sm md:text-lg font-semibold mb-4 md:mb-8 max-w-md drop-shadow-md"
          >
            Cloud and DevOps Intern passionate about building scalable, automated, and intelligent cloud infrastructure.
          </p>

          {/* Buttons */}
          <div 
            data-aos="fade-up"
            data-aos-delay="200"
            className="flex flex-row flex-wrap items-center gap-2 md:gap-4 w-full"
          >
            {/* Primary Button */}
            <a 
              href="#projects" 
              className="px-5 py-2.5 text-xs md:text-base rounded-full bg-black/40 border border-white/25 text-white font-semibold hover:bg-[#FFBA00] hover:text-black hover:border-[#FFBA00] transition-all duration-300 backdrop-blur-md inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-lg"
            >
              View My Work
            </a>
            
            {/* Secondary Button */}
            <a 
              href="#contact" 
              className="px-5 py-2.5 text-xs md:text-base rounded-full bg-black/40 border border-white/25 text-white font-semibold hover:bg-[#FFBA00] hover:text-black hover:border-[#FFBA00] transition-all duration-300 backdrop-blur-md inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-lg"
            >
              Contact Me
            </a>

            {/* Download Resume Button */}
            <a 
              href="/yogeshwaran-intern-resume.pdf" 
              download="Yogeshwaran_M_Resume.pdf"
              className="px-5 py-2.5 text-xs md:text-base rounded-full bg-black/40 border border-white/25 text-white font-semibold hover:bg-[#FFBA00] hover:text-black hover:border-[#FFBA00] transition-all duration-300 backdrop-blur-md inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-lg"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download Resume
            </a>
          </div>
        </div>

        {/* Right Side: Play / Mute Toggle Button */}
        <div 
          data-aos="zoom-in"
          data-aos-delay="100"
          className="mt-4 md:mt-0 flex flex-row md:flex-col items-center gap-2 md:gap-3 cursor-pointer group self-start md:self-auto"
          onClick={isPlaying ? handleMuteToggle : handlePlayClick}
        >
          <div className="w-12 h-12 md:w-20 md:h-20 rounded-full border border-white/30 bg-black/20 backdrop-blur-md flex justify-center items-center group-hover:scale-110 group-hover:bg-[#FFBA00] transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_40px_rgba(255,186,0,0.6)]">
            {!isPlaying ? (
              // Play Icon
              <svg className="w-5 h-5 md:w-8 md:h-8 text-white group-hover:text-black ml-0.5 md:ml-1 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : isMuted ? (
              // Speaker Off / Mute Icon (indicating user can click to unmute)
              <svg className="w-5 h-5 md:w-8 md:h-8 text-white group-hover:text-black transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
            ) : (
              // Sound On Icon (Volume Up)
              <svg className="w-5 h-5 md:w-8 md:h-8 text-white group-hover:text-black transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
            )}
          </div>
          <span className="text-white text-[10px] md:text-xs font-bold tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
            {!isPlaying ? "Play" : isMuted ? "Unmute" : "Mute"}
          </span>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        data-aos="fade-up"
        data-aos-delay="800"
        className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
      >
        <div className="animate-bounce">
          <svg 
            className="w-6 h-6 text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="3" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;
