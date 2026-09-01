'use client';

import React, { useEffect, useRef } from 'react';

export function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId;
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    const isMobile = width < 768;
    const particleCount = isMobile ? 18 : 42;

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + Math.random() * 20;
        this.size = Math.random() * 2.2 + 0.6; // Small, elegant sparks
        this.speedY = Math.random() * 0.45 + 0.15;
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.baseOpacity = Math.random() * 0.55 + 0.15;
        this.opacity = this.baseOpacity;
        this.pulseSpeed = Math.random() * 0.02 + 0.008;
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.hue = Math.random() > 0.3 ? '#39FF14' : '#18D62B';
      }

      update(time) {
        this.y -= this.speedY;
        this.x += this.speedX;

        // Subtle mouse repulsion / attraction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (140 - dist) / 140;
          this.x -= (dx / dist) * force * 0.6;
          this.y -= (dy / dist) * force * 0.6;
        }

        // Pulse opacity
        this.opacity = this.baseOpacity * (0.6 + 0.4 * Math.sin(time * this.pulseSpeed + this.pulseOffset));

        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset();
        }
      }

      draw(context) {
        context.save();
        context.globalAlpha = Math.max(0, Math.min(1, this.opacity));
        context.fillStyle = this.hue;
        context.shadowColor = '#39FF14';
        context.shadowBlur = this.size * 4;

        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    }

    const particles = Array.from({ length: particleCount }, () => new Particle());

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    let time = 0;
    const render = () => {
      time += 1;

      // Mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Deep green atmospheric radial gradient centered behind main hero elements
      const centerX = width * 0.5;
      const centerY = height * 0.46;
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        40,
        centerX,
        centerY,
        Math.max(width, height) * 0.65
      );
      glowGrad.addColorStop(0, 'rgba(3, 43, 12, 0.4)');
      glowGrad.addColorStop(0.3, 'rgba(2, 25, 7, 0.22)');
      glowGrad.addColorStop(0.65, 'rgba(3, 5, 4, 0.08)');
      glowGrad.addColorStop(1, 'rgba(3, 5, 4, 0)');

      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Render floating particles
      particles.forEach((p) => {
        p.update(time);
        p.draw(ctx);
      });

      animId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-canvas" aria-hidden="true" />;
}
