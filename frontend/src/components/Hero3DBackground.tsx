'use client';

import React from 'react';

/**
 * High-performance, fully compatible background layout.
 * Replaces WebGL Canvas with premium, hardware-accelerated CSS glows
 * to ensure 100% compatibility across all devices and prevent WebGL-related load freezes.
 */
export default function Hero3DBackground() {
  return (
    <div 
      className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#030712]"
    >
      {/* Radial glows with slow micro-animations */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[70%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-pink-500/8 blur-[120px] animate-pulse"
        style={{ animationDuration: '12s' }}
      />
      <div 
        className="absolute top-[35%] right-[15%] w-[50%] h-[45%] rounded-full bg-blue-500/6 blur-[130px] animate-pulse"
        style={{ animationDuration: '10s' }}
      />
    </div>
  );
}
