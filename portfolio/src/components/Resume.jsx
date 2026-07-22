import React from 'react';

const Resume = () => {
  return (
    <section 
      id="resume"
      className="bg-white py-24 px-6 md:px-12 w-full relative overflow-hidden font-sans bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div data-aos="fade-up" className="text-center mb-16">
          <div className="inline-block border border-gray-300 rounded-full px-5 py-1.5 text-sm text-gray-600 font-bold mb-6 shadow-sm bg-white uppercase tracking-wider">
            Curriculum Vitae
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
            Professional <span className="text-[#FFBA00]">Resume</span>
          </h2>
          <div className="w-16 h-1 bg-[#FFBA00] mx-auto rounded-full mt-4 mb-6" />
          <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto font-semibold leading-relaxed">
            Access my complete credentials, industrial project records, and tool competence lists.
          </p>
        </div>

        {/* High-Fidelity CV Mockup Card & Actions Panel */}
        <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
          
          {/* Left Column: Interactive CV Page Mockup */}
          <div 
            data-aos="fade-right"
            className="w-full lg:max-w-xl bg-zinc-950 text-zinc-100 rounded-[2.5rem] p-8 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-2 border-zinc-800 hover:border-[#FFBA00] hover:shadow-[0_30px_60px_rgba(255,186,0,0.15)] transition-all duration-500 relative group"
          >
            {/* Corner Decorative Tech Marks */}
            <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-zinc-800 group-hover:border-[#FFBA00] transition-colors" />
            <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-zinc-800 group-hover:border-[#FFBA00] transition-colors" />
            <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-zinc-800 group-hover:border-[#FFBA00] transition-colors" />
            <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-zinc-800 group-hover:border-[#FFBA00] transition-colors" />

            {/* Resume Header */}
            <div className="border-b border-zinc-800 pb-6 mb-6">
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2 uppercase">
                Yogeshwaran M
              </h3>
              <p className="text-[#FFBA00] font-mono text-xs uppercase tracking-widest font-black">
                Cloud & DevOps Intern
              </p>
            </div>

            {/* Profile Info */}
            <div className="mb-6">
              <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500 mb-2">
                Executive Profile
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed font-semibold">
                DevOps engineer and Cloud enthusiast specializing in automated infrastructure, multi-agent systems, and hardware prototyping. Experienced in deploying services via AWS, managing containerization with Docker, and orchestrating serverless architectures.
              </p>
            </div>

            {/* Tool Stack Blocks */}
            <div className="mb-6">
              <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-500 mb-3">
                Core Domains
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl">
                  <span className="text-[#FFBA00] font-mono text-[9px] uppercase tracking-wider block font-bold">Cloud</span>
                  <span className="text-white text-xs font-bold block mt-1">Amazon Web Services</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl">
                  <span className="text-[#FFBA00] font-mono text-[9px] uppercase tracking-wider block font-bold">Automation</span>
                  <span className="text-white text-xs font-bold block mt-1">Terraform & CI/CD</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl">
                  <span className="text-[#FFBA00] font-mono text-[9px] uppercase tracking-wider block font-bold">Environments</span>
                  <span className="text-white text-xs font-bold block mt-1">Linux / Shell Scripts</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800/80 rounded-xl">
                  <span className="text-[#FFBA00] font-mono text-[9px] uppercase tracking-wider block font-bold">Agents</span>
                  <span className="text-white text-xs font-bold block mt-1">Multi-Agent Systems</span>
                </div>
              </div>
            </div>

            {/* Telemetry metadata block */}
            <div className="bg-zinc-900/60 border border-dashed border-zinc-800 p-4 rounded-2xl flex justify-between items-center text-[10px] font-mono text-zinc-500">
              <span>DOCUMENT SIZE: 220 KB</span>
              <span>STATE: VERIFIED CERT</span>
              <span>VER: 2026.1</span>
            </div>
          </div>

          {/* Right Column: Explanatory Text and Actions */}
          <div data-aos="fade-left" className="flex-grow w-full lg:max-w-md text-left">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-4">
              Looking for a Cloud Engineering & DevOps specialist?
            </h3>
            <p className="text-gray-500 text-base font-semibold leading-relaxed mb-8">
              Download my complete professional CV, detailing academic achievements, hands-on internships, technology simulation experiences, and technical certifications.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Download Resume Button */}
              <a 
                href="/yogeshwaran-intern-resume.pdf"
                download="Yogeshwaran_M_Resume.pdf"
                className="px-8 py-4 text-sm font-black uppercase tracking-wider text-black bg-[#FFBA00] border-2 border-[#FFBA00] hover:bg-[#FF9F00] hover:border-[#FF9F00] transition-colors rounded-full flex items-center justify-center gap-2 shadow-lg shadow-[#FFBA00]/25 text-center active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download PDF
              </a>

              {/* View PDF Button */}
              <a 
                href="/yogeshwaran-intern-resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 text-sm font-black uppercase tracking-wider text-gray-900 bg-white border-2 border-gray-200 hover:border-gray-900 transition-colors rounded-full flex items-center justify-center gap-2 text-center active:scale-95 shadow-md"
              >
                View Fullscreen
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Resume;
