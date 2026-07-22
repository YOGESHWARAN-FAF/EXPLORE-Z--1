import React, { useRef, useState } from 'react';
import { motion, useScroll, useSpring, useMotionValueEvent } from 'framer-motion';

const LeadershipCard = ({ number, title, role, text, className, aosDelay, aosType, pathLength, containerRef, images, onImageClick }) => {
  const ref = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useMotionValueEvent(pathLength, "change", (latest) => {
    if (!ref.current || !containerRef.current) return;
    
    const cardRect = ref.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const cardTopRelativeToContainer = cardRect.top - containerRect.top;
    const containerHeight = containerRect.height;
    
    // Trigger when the line tip is 50px into the card
    const triggerY = cardTopRelativeToContainer + 50;
    const lineTipY = latest * containerHeight;
    
    if (lineTipY >= triggerY && !isActive) {
      setIsActive(true);
    } else if (lineTipY < triggerY && isActive) {
      setIsActive(false);
    }
  });

  return (
    <div 
      ref={ref}
      data-aos={aosType || "fade-up"} 
      data-aos-delay={aosDelay}
      data-aos-once="true"
      className={`z-10 ${className}`}
    >
      <div className={`w-80 sm:w-[350px] rounded-[2rem] p-2 relative flex flex-col items-center hover:scale-[1.02] transition-all duration-700 ${
        isActive ? 'bg-[#FFBA00] border-yellow-400 shadow-[0_20px_50px_rgba(255,186,0,0.4)]' : 'bg-white border border-gray-200 shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]'
      }`}>
        {/* Lanyard Ring punch */}
        <div className="w-5 h-5 bg-gradient-to-br from-gray-300 to-gray-100 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] absolute top-4 border border-gray-300 z-10 flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-800 rounded-full opacity-20"></div>
        </div>
        
        {/* Card interior */}
        <div className={`w-full h-full rounded-[1.5rem] mt-8 p-6 flex flex-col min-h-[300px] transition-colors duration-700 ${
          isActive ? 'bg-yellow-100/60' : 'bg-[#f4f4f4]'
        }`}>
          
          {/* Badge ID & Role */}
          <div className="flex justify-between items-center mb-3">
            <span className={`text-xl font-bold font-serif italic transition-colors duration-700 ${
              isActive ? 'text-yellow-800' : 'text-gray-400'
            }`}>{number}</span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isActive 
                ? 'bg-black/10 text-yellow-950 border-yellow-900/10' 
                : 'bg-zinc-200 text-zinc-600 border-zinc-300/40'
            }`}>{role}</span>
          </div>
          
          {/* Project Title */}
          <h3 className={`text-2xl font-black mb-3 tracking-tight transition-colors duration-700 ${
            isActive ? 'text-black' : 'text-gray-900'
          }`}>{title}</h3>
          
          {/* Core Text */}
          <p className={`text-sm leading-relaxed font-semibold mb-5 transition-colors duration-700 ${
            isActive ? 'text-gray-800' : 'text-gray-500'
          }`}>
            {text}
          </p>

          {/* Photo gallery thumbnails */}
          <div className="mt-auto grid grid-cols-3 gap-2.5 pt-4 border-t border-dashed border-gray-300/60">
            {images.map((img, idx) => (
              <div 
                key={idx}
                className="aspect-square rounded-xl overflow-hidden cursor-pointer relative group/thumb bg-zinc-950 border border-gray-200/50 hover:border-[#eab308] hover:shadow-md transition-all duration-300"
                onClick={() => onImageClick(img, title)}
                title="Click to zoom"
              >
                <img 
                  src={img} 
                  alt="Leadership thumbnail" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Leadership = () => {
  const containerRef = useRef(null);
  const [lightbox, setLightbox] = useState({ isOpen: false, imgUrl: '', title: '' });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const pathLength = useSpring(scrollYProgress, { stiffness: 60, damping: 20, restDelta: 0.001 });

  const openLightbox = (imgUrl, title) => {
    setLightbox({ isOpen: true, imgUrl, title });
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, imgUrl: '', title: '' });
  };

  const journeys = [
    {
      number: "01",
      title: "IDEATHON 2K26",
      role: "Main Coordinator",
      text: "Appointed Main Coordinator for the Electric Intelligenz 2K26 Ideathon. Orchestrated event planning, coordinated team delegations, and managed schedules to deliver an impactful presentation platform.",
      className: "md:absolute md:top-[400px] md:right-[5%] lg:right-[10%] rotate-2 md:rotate-6",
      delay: "100",
      images: ["/leadership/idethon 1.jpg", "/leadership/ideathon 2.jpg", "/leadership/ideathon 3.jpg"]
    },
    {
      number: "02",
      title: "Junior MCQ Contest",
      role: "Organizer & Coord",
      text: "Organized and hosted competitive MCQ events for junior students. Designed questions, coordinated venue bookings, and handled team interactions to foster basic technical interests.",
      className: "md:absolute md:top-[800px] md:left-[5%] lg:left-[10%] -rotate-2 md:-rotate-6",
      delay: "200",
      images: ["/leadership/mcq juniors new.jpeg", "/leadership/mcq for juniers 2.jpeg", "/leadership/mcq for juniers 3.jpeg"]
    },
    {
      number: "03",
      title: "Technical Seminar",
      role: "Presenter",
      text: "Presented seminar talks on Java Networking basics and CCNA routing fundamentals. Handled tech demos, slide designs, and led active QA sessions to explain network stack internals.",
      className: "md:absolute md:top-[1200px] md:right-[5%] lg:right-[15%] rotate-1 md:rotate-3",
      delay: "300",
      images: ["/leadership/ccna basic teaching 1.jpg", "/leadership/ccna basic teaching 2.jpg", "/leadership/ccna basic teaching 3.jpg"]
    },
    {
      number: "04",
      title: "Senior MCQ Contest",
      role: "Main Coordinator",
      text: "Led operations as Main Coordinator for advanced MCQ competitions. Directed volunteers, solved technical issues, and drove administrative organization to ensure success.",
      className: "md:absolute md:top-[1600px] md:left-[5%] lg:left-[15%] -rotate-1 md:-rotate-3",
      delay: "400",
      images: ["/leadership/mcq 1.jpg", "/leadership/mcq 2.jpg", "/leadership/mcq 3.jpg"]
    }
  ];

  return (
    <section 
      id="leadership"
      ref={containerRef}
      className="bg-white pt-24 pb-56 px-6 md:px-12 w-full relative overflow-hidden font-sans bg-[linear-gradient(to_right,#80808022_1.5px,transparent_1.5px),linear-gradient(to_bottom,#80808022_1.5px,transparent_1.5px)] bg-[size:80px_80px]"
    >
      <div className="max-w-6xl mx-auto relative md:h-[1950px]">
        
        {/* Header Content */}
        <div data-aos="fade-up" className="md:absolute top-10 left-0 md:w-[450px] z-20 mb-16 md:mb-0">
          <div className="inline-block border border-gray-300 rounded-full px-5 py-1.5 text-sm text-gray-600 font-bold mb-8 shadow-sm bg-white">
            Activities
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight relative">
            Leadership & Organizing
            {/* Hand-drawn arrow */}
            <svg className="absolute -bottom-10 right-10 w-12 h-12 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" className="hidden" />
              <path d="M4 4 Q 10 10 15 15 M 15 15 L 10 15 M 15 15 L 15 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-sm font-medium leading-relaxed">
            Highlights of my leadership roles, technical presentations, and academic competition coordination.
          </p>
        </div>

        {/* Desktop SVG Animated Dashed Line */}
        <svg 
          className="hidden md:block absolute top-0 left-0 w-full h-[1850px] pointer-events-none z-0" 
          viewBox="0 0 1000 1850" 
          preserveAspectRatio="none"
        >
          {/* Faint background path (optional guide) */}
          <path 
            d="M 650,450 C 400,550 200,650 300,900 C 400,1150 750,1300 700,1500 C 650,1700 400,1800 300,1750" 
            fill="none" 
            stroke="#cbd5e1" 
            strokeWidth="3" 
            strokeDasharray="8 10" 
          />

          {/* Mask to reveal the dashed path based on scroll */}
          <mask id="path-mask">
            <motion.path 
              d="M 650,450 C 400,550 200,650 300,900 C 400,1150 750,1300 700,1500 C 650,1700 400,1800 300,1750" 
              fill="none" 
              stroke="white" 
              strokeWidth="20" 
              style={{ pathLength }}
            />
          </mask>

          {/* The actual dashed line that gets revealed */}
          <path 
            d="M 650,450 C 400,550 200,650 300,900 C 400,1150 750,1300 700,1500 C 650,1700 400,1800 300,1750" 
            fill="none" 
            stroke="black" 
            strokeWidth="3" 
            strokeDasharray="8 10" 
            mask="url(#path-mask)"
            className="drop-shadow-sm"
          />
        </svg>

        {/* Mobile Animated Vertical Dashed Line */}
        <svg 
          className="md:hidden absolute top-0 left-[50%] -translate-x-1/2 w-4 h-[100%] pointer-events-none z-0" 
          viewBox="0 0 4 100" 
          preserveAspectRatio="none"
        >
          <path 
            d="M 2,0 L 2,100" 
            fill="none" 
            stroke="#cbd5e1" 
            strokeWidth="4" 
            strokeDasharray="4 6" 
            vectorEffect="non-scaling-stroke"
          />
          <mask id="path-mask-mobile">
            <motion.path 
              d="M 2,0 L 2,100" 
              fill="none" 
              stroke="white" 
              strokeWidth="4" 
              style={{ pathLength }}
              vectorEffect="non-scaling-stroke"
            />
          </mask>
          <path 
            d="M 2,0 L 2,100" 
            fill="none" 
            stroke="black" 
            strokeWidth="4" 
            strokeDasharray="4 6" 
            mask="url(#path-mask-mobile)"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Cards Container */}
        <div className="flex flex-col gap-8 md:gap-12 items-center md:block relative z-10 w-full pt-4 md:pt-0 pb-12 md:pb-0">
          {journeys.map((h, idx) => (
            <LeadershipCard 
              key={idx}
              number={h.number}
              title={h.title}
              role={h.role}
              text={h.text}
              className={h.className}
              aosType={idx % 2 === 0 ? "fade-left" : "fade-right"}
              aosDelay={h.delay}
              pathLength={pathLength}
              containerRef={containerRef}
              images={h.images}
              onImageClick={openLightbox}
            />
          ))}

          {/* Hand-drawn end text */}
          <div 
            data-aos="fade-in" 
            data-aos-delay="600"
            className="hidden md:block absolute top-[1820px] left-[45%] font-['Caveat',cursive] text-3xl text-gray-600 rotate-6"
          >
            Organized achievements!
          </div>

        </div>

      </div>

      {/* Lightbox Modal Overlay */}
      {lightbox.isOpen && (
        <div 
          className="fixed inset-0 w-full h-full z-[999999] bg-black/90 backdrop-blur-md flex flex-col justify-center items-center p-4 cursor-zoom-out"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button 
            type="button"
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-[#FFBA00] hover:text-black transition-colors border border-zinc-700/60 z-50"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Image Container */}
          <div className="relative max-w-4xl max-h-[80vh] w-full h-full flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={lightbox.imgUrl} 
              alt={lightbox.title} 
              className="max-w-full max-h-full object-contain rounded-2xl border border-zinc-800/80 shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* Title overlay */}
          <div className="mt-6 text-center z-10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[#FFBA00] text-lg font-black tracking-tight">{lightbox.title}</h3>
            <p className="text-zinc-400 text-xs mt-1 font-mono uppercase tracking-widest">Click anywhere to close</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Leadership;
