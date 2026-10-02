import React, { useRef, useState } from 'react';

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  maxTilt?: number;
  glareColor?: string;
  onClick?: () => void;
}

export const Interactive3DCard: React.FC<Interactive3DCardProps> = ({
  children,
  className = '',
  contentClassName = '',
  maxTilt = 8,
  glareColor = 'rgba(255, 87, 34, 0.18)',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)');
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({ x: 0, y: 0, opacity: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(12px) scale3d(1.015, 1.015, 1.015)`);
    setGlarePos({ x, y, opacity: 1 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d',
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Specular Radial Glare Reflection */}
      <div
        className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-[inherit]"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(circle 300px at ${glarePos.x}px ${glarePos.y}px, ${glareColor}, transparent 75%)`,
        }}
      />

      {/* Card Content with 3D Depth */}
      <div
        className={`w-full h-full relative z-10 ${contentClassName}`}
        style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }}
      >
        {children}
      </div>
    </div>
  );
};
