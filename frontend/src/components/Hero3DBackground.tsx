'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Use site's theme colors for rim lights
const THEME_COLORS = ['#6366f1', '#ec4899', '#3b82f6', '#a78bfa'];

/**
 * 1. Single Page Component (The Document)
 * Renders a subtle, semi-transparent rounded rectangle plane with slow ambient rotation and drift.
 */
function FloatingPage({ position, rotation, speed, isReducedMotion }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialPosition = useRef(new THREE.Vector3(...position));

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Ambient rotation
    if (!isReducedMotion) {
      meshRef.current.rotation.x += speed.rx;
      meshRef.current.rotation.y += speed.ry;
      meshRef.current.rotation.z += speed.rz;
    }
    
    // Parallax drift based on time
    if (!isReducedMotion) {
      const time = state.clock.getElapsedTime();
      const floatY = Math.sin(time * speed.floatSpeed) * 0.4;
      meshRef.current.position.y = initialPosition.current.y + floatY;
    }
  });

  return (
    <RoundedBox 
      ref={meshRef} 
      args={[2.1, 2.97, 0.04]} // A4 proportion
      radius={0.05} 
      smoothness={4} 
      position={position} 
      rotation={rotation}
    >
      <meshStandardMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.15} 
        roughness={0.1} 
        metalness={0.9}
        side={THREE.DoubleSide}
      />
      {/* Rim light / edge highlight */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.1, 2.97, 0.04)]} />
        <lineBasicMaterial color={speed.edgeColor} transparent opacity={0.25} linewidth={1} />
      </lineSegments>
    </RoundedBox>
  );
}

/**
 * 2. Particles Background
 * Renders a sparse field of dots for additional depth behind the pages.
 */
function ParticleField({ count = 300, isReducedMotion }: { count?: number, isReducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;     // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10; // z (pushed back)
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current || isReducedMotion) return;
    // Slow ambient spin for the particle field
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
    pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.005) * 0.05;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial transparent color="#a78bfa" size={0.06} sizeAttenuation={true} depthWrite={false} opacity={0.3} />
    </Points>
  );
}

/**
 * 3. Main Scene Manager
 * Handles the camera scroll-dolly effect, lighting, and instantiating the objects.
 */
function SceneManager({ isReducedMotion, isLowPerf }: any) {
  const { camera } = useThree();
  
  // Create fixed field of pages
  const pages = useMemo(() => {
    const numPages = isLowPerf ? 7 : 14;
    const docs = [];
    for (let i = 0; i < numPages; i++) {
      docs.push({
        position: [
          (Math.random() - 0.5) * 25, // Spread X
          (Math.random() - 0.5) * 25, // Spread Y
          -(Math.random() * 35)       // Spread Z (0 to -35 deep into screen)
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ],
        speed: {
          rx: (Math.random() - 0.5) * 0.004,
          ry: (Math.random() - 0.5) * 0.004,
          rz: (Math.random() - 0.5) * 0.004,
          floatSpeed: Math.random() * 0.6 + 0.2,
          edgeColor: THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)]
        }
      });
    }
    return docs;
  }, [isLowPerf]);

  useFrame(() => {
    if (isReducedMotion) return;

    // Read scroll imperatively to avoid React re-renders and camera prop resets
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));

    // Smooth camera dolly based on scroll percentage
    // Start at z=8, push forward to z=-25 at the bottom of the page
    const startZ = 8;
    const endZ = -25;
    const targetZ = startZ + (endZ - startZ) * scrollProgress;
    
    // Lerp camera Z position for smooth fluid motion
    camera.position.z += (targetZ - camera.position.z) * 0.04;
    
    // Slight tilt up as we move forward to emphasize parallax
    const targetRotX = scrollProgress * 0.15;
    camera.rotation.x += (targetRotX - camera.rotation.x) * 0.04;
  });

  return (
    <>
      {/* Fog for depth fade to match site background */}
      <fog attach="fog" args={['#030712', 10, 45]} />
      
      {/* Low ambient lighting so the glowing rims pop out */}
      <ambientLight intensity={0.5} />
      
      {/* Directional light to hit the faces slightly */}
      <directionalLight position={[10, 20, 15]} intensity={1} color="#ffffff" />
      
      {/* Colored point lights to add tint to the glass/paper materials */}
      <pointLight position={[-15, -5, -10]} intensity={3} color="#ec4899" distance={50} />
      <pointLight position={[15, 5, -20]} intensity={3} color="#6366f1" distance={50} />

      {pages.map((page, i) => (
        <FloatingPage key={i} {...page} isReducedMotion={isReducedMotion} />
      ))}

      <ParticleField count={isLowPerf ? 150 : 400} isReducedMotion={isReducedMotion} />
    </>
  );
}

/**
 * 4. Wrapper Component
 * Handles all browser events (scroll, visibility, hardware perf checks)
 */
export default function Hero3DBackground() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isLowPerf, setIsLowPerf] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 1. Prefers reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(motionQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    // 3. Tab visibility to pause render loop and save resources
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);

    // 4. Mobile/Low-end device check
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const logicalProcessors = navigator.hardwareConcurrency || 4;
    if (isMobile || logicalProcessors <= 4) {
      setIsLowPerf(true);
    }

    return () => {
      motionQuery.removeEventListener('change', motionHandler);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[-1] pointer-events-none" 
      style={{ backgroundColor: '#030712' }} // Matches --background
    >
      {/* 
        Only render Canvas if tab is visible to save battery/CPU.
        If user explicitly prefers reduced motion, we disable animations inside the scene via props, 
        but still render a beautiful static scene rather than falling back purely to CSS.
      */}
      {isVisible && (
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 45 }}
          dpr={isLowPerf ? [1, 1] : [1, 2]} // Cap pixel ratio on low-end
          gl={{ 
            powerPreference: 'high-performance', 
            antialias: !isLowPerf,
            alpha: false // Opaque background is slightly more performant
          }}
        >
          {/* Apply background color directly to WebGL clear color */}
          <color attach="background" args={['#030712']} />
          <SceneManager 
            isReducedMotion={isReducedMotion} 
            isLowPerf={isLowPerf}
          />
        </Canvas>
      )}
    </div>
  );
}
