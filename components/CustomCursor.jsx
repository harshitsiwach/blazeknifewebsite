'use client';

import React, { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const cursorRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const hasTouch = 'ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
    
    // Completely disable on mobile and touch devices
    if (!isFinePointer || hasTouch) {
      setIsTouch(true);
      return;
    }

    setIsTouch(false);

    let isVisible = false;

    const handleMouseMove = (e) => {
      if (!isVisible) {
        isVisible = true;
        if (cursorRef.current) cursorRef.current.style.opacity = '1';
      }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      if (cursorRef.current) cursorRef.current.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      isVisible = true;
      if (cursorRef.current) cursorRef.current.style.opacity = '1';
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('label') ||
        target.closest('[role="button"]') ||
        target.closest('[tabindex]') ||
        target.closest('[data-rk]') ||
        target.closest('.interactive-hover') ||
        target.closest('.preset-btn') ||
        target.closest('.quick-amount-btn') ||
        target.closest('.vault-action-btn') ||
        target.closest('.top-control-btn')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    // Use capture: true so modal overlays never swallow cursor tracking events
    window.addEventListener('mousemove', handleMouseMove, { capture: true, passive: true });
    window.addEventListener('mouseover', handleMouseOver, { capture: true, passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove, { capture: true });
      window.removeEventListener('mouseover', handleMouseOver, { capture: true });
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (isTouch) return null;

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor-wrapper ${isHovered ? 'custom-cursor--hovered' : ''}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className={`custom-cursor-svg ${isHovered ? 'custom-cursor-svg--hover' : ''}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 2 2 L 2 18.5 L 6.8 14.5 L 10.8 22.5 L 13.8 21 L 9.8 13.5 L 15.5 13.5 Z"
          fill={isHovered ? '#39FF14' : '#FFFFFF'}
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
