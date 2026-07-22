import React, { useState } from 'react'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Services from './components/Services'
import Leadership from './components/Leadership'
import Projects from './components/Projects'
import ProjectExpo from './components/ProjectExpo'
import Certifications from './components/Certifications'
import Resume from './components/Resume'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  const [isPreloaderActive, setIsPreloaderActive] = useState(true);

  return (
    <>
      <Preloader onComplete={() => setIsPreloaderActive(false)} />
      <Navbar />
      <Hero isPreloaderActive={isPreloaderActive} />
      <About />
      <Skills />
      <Services />
      <Leadership />
      <Projects />
      <ProjectExpo />
      <Certifications />
      <Resume />
      <Contact />
      <Footer />
    </>
  )
}

export default App;
