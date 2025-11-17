
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm p-4 shadow-lg sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-center">
        <span className="text-3xl mr-3">📧</span>
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
          Analisador de Email com IA
        </h1>
      </div>
    </header>
  );
};

export default Header;