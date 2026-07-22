import React from 'react';

const ProjectCard = ({ title, description, image, skills, githubLink, liveLink, deployment, delay }) => {
  return (
    <div 
      data-aos="fade-up"
      data-aos-delay={delay}
      className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden flex flex-col hover:scale-[1.01] hover:border-[#FFBA00] hover:shadow-[0_25px_60px_rgba(255,186,0,0.2)] transition-all duration-700 w-full"
    >
      {/* Banner Image */}
      <div className="w-full aspect-[1.8/1] overflow-hidden relative group/image bg-zinc-950">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        {/* Deployment badge */}
        <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider bg-black/75 text-white backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          Deployed on: {deployment}
        </span>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 flex flex-col">
        <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
          {title}
        </h3>
        
        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6 flex-1">
          {description}
        </p>

        {/* Learned Skills in Bottom */}
        <div className="mb-6 pt-4 border-t border-gray-100">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">
            Learned Skills & Stack
          </span>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, index) => (
              <span 
                key={index} 
                className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-zinc-50 border border-gray-100 text-gray-600 hover:border-[#FFBA00] transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Github & Project Link Buttons */}
        <div className="flex items-center gap-3 w-full">
          <a 
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-3 text-xs font-bold rounded-full bg-zinc-900 text-white text-center hover:bg-black transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
            </svg>
            GitHub
          </a>
          <a 
            href={liveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-3 text-xs font-bold rounded-full bg-[#FFBA00] text-black text-center hover:bg-[#FF9F00] transition-colors flex items-center justify-center gap-2 border border-[#FFBA00]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Live Demo
          </a>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const projectsData = [
    {
      title: "Seed to Circuit",
      description: "An AI-based smart farming and agricultural recommendation platform. Detects plant diseases through image analysis, measures soil health, and provides precise crop and fertilizer recommendations to boost farm yields.",
      image: "/seed_to_circuit_banner.png",
      skills: ["Python", "Flask", "Firebase Realtime DB", "Teachable Machine AI", "Responsive Frontend"],
      githubLink: "https://github.com/YOGESHWARAN-FAF",
      liveLink: "https://render.com",
      deployment: "Vercel & Render",
      delay: 100
    },
    {
      title: "AI Certificate Verification",
      description: "An intelligent security system that validates educational and professional credentials. Uses OCR to extract document text, feeds content into Gemini 2.0 Flash to verify details, and scans QR codes to authenticate issuer signatures.",
      image: "/cert_verify_banner.png",
      skills: ["Gemini 2.0 Flash API", "Python", "Flask Backend", "OCR Engine", "QR Verification", "API Integrations"],
      githubLink: "https://github.com/YOGESHWARAN-FAF",
      liveLink: "https://render.com",
      deployment: "Render Cloud",
      delay: 200
    },
    {
      title: "Gen-Z SaaS Task Tracker",
      description: "A cloud-based dashboard designed to make productivity interactive. Engages users via gamification elements, point reward systems, leveling structures, and allows team collaborations to complete complex tasks efficiently.",
      image: "/task_tracker_banner.png",
      skills: ["Node.js", "Firebase Firestore", "HTML5", "Vanilla CSS3", "Modern JavaScript", "AWS EC2 Hosting"],
      githubLink: "https://github.com/YOGESHWARAN-FAF",
      liveLink: "https://aws.amazon.com",
      deployment: "AWS Infrastructure",
      delay: 300
    }
  ];

  return (
    <section 
      id="projects"
      className="bg-white py-24 px-6 md:px-12 w-full relative overflow-hidden font-sans bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:80px_80px]"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div data-aos="fade-up" className="mb-16">
          <div className="inline-block border border-gray-300 rounded-full px-5 py-1.5 text-sm text-gray-600 font-bold mb-6 shadow-sm bg-white">
            Projects
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
            Featured Projects
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-xl font-medium mt-3 leading-relaxed">
            Here are the core software projects I've built, integrating artificial intelligence, real-time databases, and cloud deployments.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsData.map((project, index) => (
            <ProjectCard 
              key={index}
              title={project.title}
              description={project.description}
              image={project.image}
              skills={project.skills}
              githubLink={project.githubLink}
              liveLink={project.liveLink}
              deployment={project.deployment}
              delay={project.delay}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Projects;
