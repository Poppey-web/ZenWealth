
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <div className={`${className} bg-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 relative overflow-hidden group`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white relative z-10">
      <path d="M12 3L4 12H9V21H15V12H20L12 3Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 2L2 12H7V22H17V12H22L12 2ZM12 5.8L18.2 12H15V20H9V12H5.8L12 5.8Z" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" className="animate-pulse" />
    </svg>
  </div>
);

export default Logo;
