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
          <Image src="/image.png" alt="BLAZE KNIFE Logo" width={120} height={120} className="game-logo" />
          <h1 className="game-title">BLAZE KNIFE</h1>
          <button className="cta-button">PLAY</button>
        </div>
        <div className="social-links">
          <a href="https://x.com/blazeknifehood" target="_blank" rel="noopener noreferrer" className="social-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16">
              <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
            </svg>
          </a>
        </div>
      </section>
      <div className="powered-by">
        <p>Powered By</p>
        <Image src="/RH_lockup_neon.png" alt="Powered By" width={200} height={60} className="powered-by-logo" />
      </div>
    </>
  );
}