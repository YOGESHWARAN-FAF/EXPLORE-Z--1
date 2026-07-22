import React from 'react';

const Certifications = () => {
  const certificationsData = [
    {
      title: "AWS Certified Solutions Architect - Associate",
      issuer: "Amazon Web Services (AWS)",
      status: "Pursuing",
      code: "AWS-SAA",
      year: "2026"
    },
    {
      title: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services (AWS)",
      status: "Pursuing",
      code: "AWS-CLF",
      year: "2026"
    },
    {
      title: "AWS Solutions Architect Associate Course",
      issuer: "GeeksforGeeks",
      status: "Completed",
      code: "GFG-SAA",
      year: "2025"
    },
    {
      title: "AWS Cloud Practitioner Course",
      issuer: "GeeksforGeeks",
      status: "Completed",
      code: "GFG-CLF",
      year: "2025"
    },
    {
      title: "Python Fundamentals",
      issuer: "Infosys Springboard",
      status: "Completed",
      code: "INF-PY",
      year: "2024"
    },
    {
      title: "Technology Job Simulation",
      issuer: "Deloitte Australia (Forage)",
      status: "Completed",
      code: "FOR-DEL",
      year: "2024"
    },
    {
      title: "Web Developer Intern Certification",
      issuer: "EMglitz",
      status: "Completed",
      code: "EMG-WD",
      year: "2024"
    }
  ];

  // Double the list for seamless loop scrolling
  const scrollItems = [...certificationsData, ...certificationsData, ...certificationsData];

  return (
    <section 
      id="certifications"
      className="bg-[#0a0a0a] py-24 w-full relative overflow-hidden font-sans border-t border-zinc-900"
    >
      {/* Inline styles for the marquee keyframes and custom scroll settings */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll-left-to-right {
          0% {
            transform: translateX(-33.3333%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        .marquee-container:hover .marquee-inner {
          animation-play-state: paused;
        }
      `}} />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10 mb-16">
        {/* Header */}
        <div data-aos="fade-up">
          <div className="inline-block border border-zinc-700 rounded-full px-5 py-1.5 text-sm text-zinc-400 font-bold mb-6 shadow-sm bg-zinc-900/85">
            Credentials
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Certifications & Training
          </h2>
          <p className="text-zinc-500 text-base md:text-lg max-w-xl font-medium mt-3 leading-relaxed">
            My verified learning, coursework, and job simulations showing domain knowledge in cloud architecture, programming, and devops.
          </p>
        </div>
      </div>

      {/* Marquee Wrapper - moving left to right */}
      <div className="marquee-container w-full overflow-hidden relative flex py-4 bg-zinc-950/40 border-y border-zinc-900/60">
        
        {/* Gradient shadow edges to look extremely premium */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

        {/* Scrolling Inner Container */}
        <div 
          className="marquee-inner flex gap-6 shrink-0"
          style={{
            animation: 'scroll-left-to-right 35s linear infinite',
            width: 'max-content'
          }}
        >
          {scrollItems.map((cert, index) => (
            <div 
              key={index}
              className="w-[280px] sm:w-[320px] bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.03] hover:bg-[#FFBA00] hover:border-[#FFBA00] hover:shadow-[0_0_30px_rgba(255,186,0,0.4)] group transition-all duration-500 cursor-pointer"
            >
              <div>
                {/* Header status badge & year */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-zinc-800 text-zinc-400 group-hover:bg-black/20 group-hover:text-yellow-900 border border-zinc-700/50 group-hover:border-yellow-800/20">
                    {cert.status}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-500 group-hover:text-yellow-950">
                    {cert.year}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-extrabold text-white group-hover:text-black leading-snug tracking-tight mb-2">
                  {cert.title}
                </h3>
              </div>

              {/* Footer info & View button */}
              <div className="mt-6 pt-3 border-t border-zinc-800/60 group-hover:border-black/10 flex justify-between items-end gap-3">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className="text-[10px] font-bold text-zinc-400 group-hover:text-yellow-950 truncate">
                    {cert.issuer}
                  </span>
                  <span className="text-[8px] font-mono font-black text-[#FFBA00] group-hover:text-black bg-zinc-950/40 group-hover:bg-black/10 px-2 py-0.5 rounded border border-zinc-800/80 group-hover:border-black/5 self-start">
                    {cert.code}
                  </span>
                </div>

                {/* View Certificate Button (Right Bottom) */}
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => {
                    if (e.currentTarget.getAttribute('href') === '#') {
                      e.preventDefault();
                      alert(`You can insert your Google Drive link for "${cert.title}" in src/components/Certifications.jsx!`);
                    }
                  }}
                  className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/50 group-hover:bg-black group-hover:text-[#FFBA00] group-hover:border-black/10 transition-all duration-300 whitespace-nowrap flex items-center gap-1"
                >
                  <span>View Cert</span>
                  <svg className="w-2.5 h-2.5 text-zinc-300 group-hover:text-[#FFBA00]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
