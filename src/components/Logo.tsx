import React from 'react';

interface LogoProps {
  className?: string;
  subText?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  subText = 'PROPERTY MANAGEMENT', 
  size = 'md',
  onClick
}) => {
  const sizeClasses = {
    sm: { main: 'text-2xl', sub: 'text-[7px] mt-1' },
    md: { main: 'text-4xl', sub: 'text-[8px] mt-2' },
    lg: { main: 'text-6xl', sub: 'text-[10px] mt-3' }
  };

  const handleLogoClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div 
      onClick={handleLogoClick}
      className={`flex flex-col items-start cursor-pointer group transition-all duration-500 select-none ${className}`}
      role="button"
      aria-label="Christiano Vincenti Home"
    >
      <span className={`text-foreground font-script leading-none tracking-tight group-hover:text-primary transition-colors duration-500 ${sizeClasses[size].main}`}>
        Christiano Vincenti
      </span>
      <span className={`uppercase tracking-[0.5em] text-primary font-black font-sans opacity-90 ${sizeClasses[size].sub}`}>
        {subText}
      </span>
    </div>
  );
};
