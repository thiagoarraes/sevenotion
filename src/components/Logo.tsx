import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <svg width="40" height="40" viewBox="0 0 40 40" className="text-purple-600 dark:text-purple-400">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          
          {/* Círculo externo */}
          <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" />
          
          {/* Número 7 estilizado */}
          <path 
            d="M12 8 h12 v4 L16 28 h-4 L20 12 h-8 Z" 
            fill="white" 
            stroke="white" 
            strokeWidth="0.5"
          />
          
          {/* Ponto decorativo */}
          <circle cx="28" cy="12" r="2" fill="white" opacity="0.8" />
        </svg>
        
        {/* Efeito de brilho */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent" />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Sevenotion
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
            Organizador pessoal do Seven
          </p>
        </div>
      )}
    </div>
  );
};
