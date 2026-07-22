import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll to make navbar more solid
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = ['Home', 'About', 'Skills', 'Hackathons', 'Leadership', 'Projects', 'Expos', 'Certs', 'Resume', 'Contact'];

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isOpen 
          ? 'bg-[#FFBA00] py-4'
          : isScrolled 
            ? 'bg-black/80 backdrop-blur-md py-4' 
            : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex justify-between items-center w-full">
        
        {/* Left Side: Logo/Name */}
        <div className="flex items-center shrink-0">
          <a href="#" className={`text-xl lg:text-2xl font-black tracking-tight transition-colors duration-300 ${isOpen ? 'text-black' : 'text-white'}`}>
            Yogeshwaran<span className="text-[#eab308]">.</span>
          </a>
        </div>

        {/* Center: Desktop Menu Links */}
        <div className="hidden md:flex space-x-3 lg:space-x-4 xl:space-x-6 items-center">
          {navLinks.map((link) => (
            <a 
              key={link} 
              href={
                link === 'Hackathons' ? '#services' : 
                link === 'Expos' ? '#expos' : 
                link === 'Certs' ? '#certifications' : 
                link === 'Resume' ? '#resume' : 
                `#${link.toLowerCase()}`
              }
              className="text-white/80 hover:text-white text-xs lg:text-sm font-semibold tracking-tight relative group transition-colors duration-300 py-1"
            >
              {link}
              {/* Smooth hover underline */}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FFBA00] transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* Right Side: CTA Button */}
        <div className="hidden md:block">
          <a 
            href="#contact" 
            className="px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white font-semibold hover:bg-[#FFBA00] hover:text-black hover:border-[#FFBA00] hover:shadow-[0_0_15px_rgba(255,186,0,0.4)] transition-all duration-300 backdrop-blur-md"
          >
            Hire Me
          </a>
        </div>

        {/* Mobile Hamburger Menu Icon */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`focus:outline-none p-2 transition-colors duration-300 ${isOpen ? 'text-black' : 'text-white'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-[500px] py-4 opacity-100 bg-[#FFBA00] shadow-2xl' : 'max-h-0 opacity-0 bg-transparent'
        }`}
      >
        <div className="flex flex-col px-6 space-y-4">
          {navLinks.map((link) => (
            <a 
              key={link} 
              href={
                link === 'Hackathons' ? '#services' : 
                link === 'Expos' ? '#expos' : 
                link === 'Certs' ? '#certifications' : 
                link === 'Resume' ? '#resume' : 
                `#${link.toLowerCase()}`
              }
              onClick={() => setIsOpen(false)}
              className="text-black/80 hover:text-black font-bold text-lg border-b border-black/10 pb-2 transition-colors"
            >
              {link}
            </a>
          ))}
          <div className="pt-4 pb-2">
             <a 
               href="#contact" 
               onClick={() => setIsOpen(false)} 
               className="inline-block px-6 py-3 rounded-full bg-black text-white font-black hover:bg-white hover:text-black transition-colors w-full text-center shadow-lg"
             >
               Hire Me
             </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
