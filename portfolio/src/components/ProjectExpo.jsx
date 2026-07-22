import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectExpoCard = ({ expo, index, onImageClick }) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const images = expo.images;
  const activeImage = images[activeImageIdx];

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      data-aos="fade-up"
      data-aos-delay={100 * index}
      className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden flex flex-col hover:scale-[1.01] hover:border-[#FFBA00] hover:shadow-[0_20px_45px_rgba(255,186,0,0.15)] transition-all duration-500 w-full"
    >
      {/* Card Image Gallery Header */}
      <div 
        className="w-full aspect-[1.8/1] overflow-hidden relative group/image bg-zinc-950 cursor-pointer"
        onClick={() => onImageClick(activeImage, expo.title)}
        title="Click to zoom image"
      >
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeImageIdx}
            src={activeImage} 
            alt={`${expo.title} frame`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Award placement badge */}
        <span className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider bg-[#FFBA00] text-black px-3 py-1.5 rounded-full border border-yellow-400/20 shadow-md">
          {expo.award}
        </span>

        {/* Carousel indicators overlaid on bottom center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 px-2.5 py-1.5 rounded-full backdrop-blur-sm z-10" onClick={(e) => e.stopPropagation()}>
          {images.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setActiveImageIdx(dotIdx)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                activeImageIdx === dotIdx ? 'bg-[#FFBA00] w-3' : 'bg-white/50 hover:bg-white'
              }`}
              title={`Frame ${dotIdx + 1}`}
            />
          ))}
        </div>

        {/* Navigation arrows overlaid on side edges */}
        <button 
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#FFBA00] hover:text-black text-white flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity z-10 shadow-md border border-white/5"
          title="Previous Image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-[#FFBA00] hover:text-black text-white flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity z-10 shadow-md border border-white/5"
          title="Next Image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Hover zoom overlay */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/image:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white scale-75 group-hover/image:scale-100 transition-transform duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 flex flex-col justify-between">
        <div>
          {/* Subtitle / Venue */}
          {expo.subtitle && (
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFBA00] block mb-2">
              {expo.subtitle}
            </span>
          )}
          {expo.project && (
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">
              PROJECT: {expo.project}
            </span>
          )}

          {/* Title */}
          <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight leading-snug">
            {expo.title}
          </h3>
          
          {/* Achievement Details */}
          <p className="text-gray-500 text-sm font-semibold leading-relaxed mb-6">
            {expo.achievement}
          </p>
        </div>

        {/* Skills List */}
        <div className="pt-4 border-t border-gray-100">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">
            Acquired Expertise & Presentation
          </span>
          <div className="flex flex-wrap gap-1.5">
            {expo.skills.map((skill, idx) => (
              <span 
                key={idx} 
                className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-zinc-50 border border-gray-100 text-gray-600 hover:border-[#FFBA00] transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectExpo = () => {
  const [lightbox, setLightbox] = useState({ isOpen: false, imgUrl: '', title: '' });

  const openLightbox = (imgUrl, title) => {
    setLightbox({ isOpen: true, imgUrl, title });
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, imgUrl: '', title: '' });
  };

  const exposData = [
    {
      title: "Synergy '25 – Project Expo",
      subtitle: "Government College of Engineering, Salem",
      award: "1st Place Winner",
      achievement: "Showcased custom engineering model. Managed technical diagrams presentation, discussed architectural specs with judges panel, and won 1st Place.",
      skills: ["Innovation", "Project Development", "Team Collaboration", "Technical Presentation", "Problem Solving"],
      images: [
        "/expos/GCE 1.jpg",
        "/expos/GCE 2.jpg",
        "/expos/GCE 3.jpg"
      ]
    },
    {
      title: "CATCH'25 Technical Competition",
      award: "1st Place Winner (₹5,000)",
      achievement: "Won 1st place in the technical development track. Created frontend interfaces, designed and tested custom backend REST APIs, and managed AWS hosting.",
      skills: ["Frontend Development", "Backend Development", "Database Management", "REST API Development", "API Testing", "AWS EC2 Hosting", "AWS S3 Hosting", "Deployment"],
      images: [
        "/expos/CATCH TECHNICAL 1.jpg",
        "/expos/CATCH TECHNICAL 2.jpg",
        "/expos/CATCH TECHNICAL 3.jpg"
      ]
    },
    {
      title: "IDEATHON 2025",
      subtitle: "National Energy Conservation Day",
      project: "Smart Space for Energy Conservation",
      award: "1st Place Winner",
      achievement: "Designed and engineered an IoT-based smart space model to monitor energy use, optimize active lighting, and automate power tracking systems.",
      skills: ["IoT", "Smart Automation", "Energy Monitoring Systems", "Innovation", "Sustainable Technology", "Team Collaboration"],
      images: [
        "/expos/ideathon winner 1.jpg",
        "/expos/ideathon winner 2.jpg",
        "/expos/ideathon winner 3.jpg"
      ]
    },
    {
      title: "IEI (NIRT) – Energy Conservation Project Demonstration",
      award: "3rd Place Winner",
      achievement: "Demonstrated custom energy conservation prototype to industrial evaluators. Presented renewable energy algorithms, system schematics, and wiring structures.",
      skills: ["Energy Conservation", "Project Demonstration", "Technical Presentation", "Renewable Energy", "Problem Solving"],
      images: [
        "/expos/nirt 1.jpg",
        "/expos/nirt 2.jpg"
      ]
    }
  ];

  return (
    <section 
      id="expos"
      className="bg-[#fafafa] py-24 px-6 md:px-12 w-full relative overflow-hidden font-sans bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px] border-t border-gray-100"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div data-aos="fade-up" className="mb-16">
          <div className="inline-block border border-gray-300 rounded-full px-5 py-1.5 text-sm text-gray-600 font-bold mb-6 shadow-sm bg-white uppercase tracking-wider">
            Exhibitions
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
            Project Expos & Competitions
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl font-medium mt-3 leading-relaxed">
            My experience demonstrating hardware and software models at regional, national, and university-level technical expos and ideathons.
          </p>
        </div>

        {/* Expos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {exposData.map((expo, index) => (
            <ProjectExpoCard 
              key={index}
              expo={expo}
              index={index}
              onImageClick={openLightbox}
            />
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
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
          <div className="mt-6 text-center z-10 px-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[#FFBA00] text-lg font-black tracking-tight">{lightbox.title}</h3>
            <p className="text-zinc-400 text-xs mt-1 font-mono uppercase tracking-widest">Click anywhere to close</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectExpo;
