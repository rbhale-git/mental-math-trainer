"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type VantaEffect = {
  destroy: () => void;
};

export default function LandingGlobe() {
  const globeRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<VantaEffect | null>(null);

  useEffect(() => {
    let active = true;

    const initGlobe = async () => {
      if (!globeRef.current || effectRef.current) return;

      const { default: GLOBE } = await import("vanta/dist/vanta.globe.min");

      if (!active || !globeRef.current) return;

      effectRef.current = GLOBE({
        el: globeRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        size: 1.1,
        color: 0x6ca651,
        color2: 0xbbcb2e,
        backgroundColor: 0xf9fafb,
      }) as VantaEffect;
    };

    initGlobe();

    return () => {
      active = false;
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, []);

  return <div ref={globeRef} className="absolute inset-0" aria-hidden="true" />;
}
