'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ReactNode } from 'react';

interface ScrollAnimateWrapperProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade' | 'slide-left' | 'slide-right' | 'scale';
  delay?: number;
}

export default function ScrollAnimateWrapper({
  children,
  className = '',
  animation = 'fade',
  delay = 0
}: ScrollAnimateWrapperProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const animationClass = {
    'fade': 'scroll-animate',
    'slide-left': 'scroll-animate-left',
    'slide-right': 'scroll-animate-right',
    'scale': 'scroll-animate-scale'
  }[animation];

  return (
    <div
      ref={ref}
      className={`${animationClass} ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

