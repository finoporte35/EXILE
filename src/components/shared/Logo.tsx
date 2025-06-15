import type React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className }) => {
  let sizeClasses = '';
  switch (size) {
    case 'small':
      sizeClasses = 'text-2xl';
      break;
    case 'medium':
      sizeClasses = 'text-4xl';
      break;
    case 'large':
      sizeClasses = 'text-6xl';
      break;
  }

  return (
    <h1 className={`font-headline font-bold text-gradient-red ${sizeClasses} ${className}`}>
      EXILE
    </h1>
  );
};

export default Logo;
