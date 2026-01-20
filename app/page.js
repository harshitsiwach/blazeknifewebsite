'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const Ember = ({ left, animationDuration, animationDelay }) => {
  const style = {
    left: left,
    animationDuration: animationDuration,
    animationDelay: animationDelay,
  };
  return <div className="ember" style={style}></div>;
};

const FloatingEmbers = () => {
  const [embers, setEmbers] = useState([]);

  useEffect(() => {
    const createEmber = () => {
      const newEmber = {
        id: Math.random(),
        left: Math.random() * 100 + '%',
        animationDuration: (Math.random() * 4 + 6) + 's',
        animationDelay: Math.random() * 2 + 's',
      };
      setEmbers(prevEmbers => [...prevEmbers, newEmber]);
      setTimeout(() => {
        setEmbers(prevEmbers => prevEmbers.filter(e => e.id !== newEmber.id));
      }, 10000);
    };

    const interval = setInterval(createEmber, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="floating-embers">
      {embers.map(ember => (
        <Ember key={ember.id} {...ember} />
      ))}
    </div>
  );
};


export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="background-layers">
          <div className="sunset-sky"></div>
          {/* pagoda-silhouettes.svg is missing. Omitting for now. */}
          {/* <div className="pagoda-silhouettes"></div> */}
          <FloatingEmbers />
        </div>
        <div className="hero-content">
          <Image src="/logo.png" alt="BLAZE KNIFE Logo" width={120} height={120} className="game-logo" />
          <h1 className="game-title">BLAZE KNIFE</h1>
          <p className="sub-text">By Rupture Labs</p>
          <button className="cta-button">PLAY</button>
        </div>
        <div className="social-links">
          <a href="#" className="social-link">
            <svg width="24px" height="24px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg">
              <title>Telegram icon</title>
              <path d="M23.91 3.79L20.3 20.84c-.25 1.21-.98 1.5-2 .94l-5.5-4.07-2.66 2.57c-.3.3-.55.56-1.1.56-.72 0-.6-.27-.84-.95L6.3 13.7l-5.45-1.7c-1.18-.35-1.19-1.16.26-1.75l21.26-8.2c.97-.43 1.9.24 1.53 1.73z" />
            </svg>
          </a>
          <a href="#" className="social-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-discord" viewBox="0 0 16 16"> <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" /> </svg>
          </a>
          <a href="#" className="social-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16">
              <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
            </svg>
          </a>
          <a href="https://pump.fun" className="social-link pump-fun">
            <Image src="/pumpfunlogo.png" alt="Pump.fun" width={24} height={24} />
          </a>
        </div>
      </section>
      <div className="powered-by">
        <p>Powered By</p>
        <Image src="/solanaLogo.svg" alt="Solana" width={100} height={24} />
      </div>
    </>
  );
}