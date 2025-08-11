"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 40, height = 40, className = "" }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div 
        className={`bg-muted rounded animate-pulse ${className}`}
        style={{ width, height }}
      />
    );
  }

  const logoSrc = resolvedTheme === 'dark' ? '/logozorraga.png' : '/logoLightMode.png';

  return (
    <Image
      src={logoSrc}
      alt="ZORRAGA Logo"
      width={width}
      height={height}
      className={`transition-all duration-200 ${className}`}
      style={{ width: 'auto', height: 'auto', maxWidth: width, maxHeight: height }}
      priority
    />
  );
}