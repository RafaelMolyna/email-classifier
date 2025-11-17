
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 text-center text-gray-500">
      <p>&copy; {new Date().getFullYear()} Analisador de Email com IA. Todos os direitos reservados.</p>
    </footer>
  );
};

export default Footer;