import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-slate-800 text-white w-full shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 font-bold text-xl sm:text-2xl tracking-wider">
            <Link to="/">MUEBLES & CO.</Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/admin" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm">
              Panel Admin
            </Link>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white focus:outline-none">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-700 px-4 pt-4 pb-6 absolute w-full left-0 shadow-lg">
          <Link to="/admin" onClick={() => setIsOpen(false)} className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-md text-base font-semibold transition-colors shadow-sm">
            Panel Admin
          </Link>
        </div>
      )}
    </nav>
  );
}