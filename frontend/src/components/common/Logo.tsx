import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex justify-center mb-6">
      <div className="relative">
        <img 
          src="/logo.png" 
          alt="Majlis Perbandaran Kulim Logo" 
          className="w-28 h-28 object-contain"
        />
      </div>
    </div>
  );
};
