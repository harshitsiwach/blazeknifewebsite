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


import { PresaleCard } from '../components/PresaleCard.jsx';
import { TopBar } from '../components/TopBar.jsx';

export default function HomePage() {
  return (
    <>
      <section className="hero-section hero-section--with-presale">
        <TopBar />
        <div className="background-layers">
          <div className="sunset-sky"></div>
          <FloatingEmbers />
        </div>
        <div className="hero-content">
          <Image src="/image.png" alt="BLAZE KNIFE Logo" width={120} height={120} className="game-logo" />
          <h1 className="game-title">BLAZE KNIFE</h1>
          <button className="cta-button cta-button--small">PLAY</button>
          <PresaleCard />
        </div>
      </section>
      <div className="powered-by">
        <p>Powered By</p>
        <Image src="/RH_lockup_neon.png" alt="Powered By" width={200} height={60} className="powered-by-logo" />
      </div>
    </>
  );
}