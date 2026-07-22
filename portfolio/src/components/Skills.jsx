import React from 'react';

const SkillCard = ({ title, icon, skills, delay }) => {
  return (
    <div 
      data-aos="fade-up" 
      data-aos-delay={delay}
      className="bg-zinc-50 border border-gray-200 p-6 rounded-3xl relative group hover:border-[#FFBA00] hover:shadow-[0_0_30px_rgba(255,186,0,0.2)] transition-all duration-500 overflow-hidden"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFBA00]/0 via-transparent to-[#FFBA00]/0 group-hover:from-[#FFBA00]/10 transition-all duration-500 pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-yellow-600 group-hover:bg-[#FFBA00] group-hover:text-black group-hover:border-[#FFBA00] transition-all duration-500">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#eab308] transition-colors duration-300">
          {title}
        </h3>
      </div>

      {/* Skills list tags */}
      <div className="flex flex-wrap gap-2.5">
        {skills.map((skill, index) => (
          <span 
            key={index} 
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white text-gray-700 border border-gray-200/80 hover:border-[#eab308] hover:text-[#eab308] transition-colors duration-300 shadow-sm"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

const Skills = () => {
  const categories = [
    {
      title: "Cloud Computing",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      skills: [
        "AWS EC2", "AWS S3", "AWS IAM", "AWS VPC", "Route 53", "CloudWatch", 
        "Auto Scaling", "Load Balancer", "AWS CLI", "Amazon RDS", "AWS Lambda", 
        "AWS SNS", "AWS SQS", "EventBridge"
      ],
      delay: 100
    },
    {
      title: "IaC & DevOps",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      skills: [
        "Terraform", "Docker", "Jenkins", "GitHub Actions", "CI/CD Pipelines", 
        "N8N Automation", "Automated Deployment", "Webhook Integration"
      ],
      delay: 200
    },
    {
      title: "Linux Administration",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      skills: [
        "Ubuntu", "Amazon Linux", "Cron Jobs", "User & Group Management", 
        "File Permissions", "Package Management", "Process Monitoring", "Shell Commands"
      ],
      delay: 300
    },
    {
      title: "Networking",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      skills: [
        "IPv4 Networking", "CIDR Blocks", "TCP/IP Protocol", "DNS Configuration", 
        "HTTP / HTTPS", "SSH Keys", "Public & Private Networks", "VPC Peering"
      ],
      delay: 400
    },
    {
      title: "Development & APIs",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      skills: [
        "Python Programming", "Bash Scripting", "API Integration", "JSON Processing", 
        "Flask", "REST APIs", "JWT Authentication", "Session Management"
      ],
      delay: 500
    },
    {
      title: "Databases & Tools",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      skills: [
        "Firebase DB", "SQL Queries", "Amazon RDS Config", "Git & GitHub", 
        "Postman Testing", "Nginx Server", "Render Hosting", "Netlify", "Vercel"
      ],
      delay: 600
    }
  ];

  return (
    <section 
      id="skills" 
      className="bg-white py-24 px-6 md:px-12 w-full relative overflow-hidden font-sans bg-[linear-gradient(to_right,#80808022_1.5px,transparent_1.5px),linear-gradient(to_bottom,#80808022_1.5px,transparent_1.5px)] bg-[size:80px_80px]"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div data-aos="fade-up" className="mb-16">
          <div className="inline-block border border-gray-300 rounded-full px-5 py-1.5 text-sm text-gray-600 font-bold mb-6 shadow-sm bg-white">
            Expertise
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
            Technical Skillset
          </h2>
          <p className="text-gray-500 text-base md:text-lg max-w-xl font-medium mt-3 leading-relaxed">
            A comprehensive set of tools, languages, cloud resources, and pipelines that I use to design, automate, and orchestrate environments.
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <SkillCard 
              key={idx}
              title={cat.title}
              icon={cat.icon}
              skills={cat.skills}
              delay={cat.delay}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Skills;
