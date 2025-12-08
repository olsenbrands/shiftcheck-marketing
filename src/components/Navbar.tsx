import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/90 backdrop-blur-md border-gray-200 py-4 shadow-sm' : 'bg-transparent border-transparent py-6'}`}>
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/camera-logo.svg"
            alt="ShiftCheck"
            className="w-8 h-8 shadow-lg shadow-primary-500/30 rounded"
          />
          <span className={`text-xl font-bold tracking-tight uppercase ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
            <span className="text-accent-500">Shift</span><span className="text-primary-700">Check</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/problem" className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors uppercase tracking-wide">Problem</Link>
          <Link to="/solution" className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors uppercase tracking-wide">Solution</Link>
          <Link to="/features" className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors uppercase tracking-wide">Features</Link>
          <Link to="/pricing" className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors uppercase tracking-wide">Pricing</Link>
          <a
            href="https://app.shiftcheck.app"
            className="bg-white text-gray-700 border border-gray-300 px-5 py-2 rounded font-bold text-sm hover:bg-gray-50 transition-all"
          >
            Login
          </a>
          <Link
            to="/demo"
            className="bg-primary-500 text-white px-5 py-2 rounded font-bold text-sm hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/30"
          >
            Request Demo
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-900" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 md:hidden p-4 flex flex-col gap-4 shadow-xl">
          <Link to="/problem" className="text-gray-700 font-medium p-3 hover:bg-gray-50 rounded uppercase text-sm tracking-wide" onClick={() => setIsOpen(false)}>Problem</Link>
          <Link to="/solution" className="text-gray-700 font-medium p-3 hover:bg-gray-50 rounded uppercase text-sm tracking-wide" onClick={() => setIsOpen(false)}>Solution</Link>
          <Link to="/features" className="text-gray-700 font-medium p-3 hover:bg-gray-50 rounded uppercase text-sm tracking-wide" onClick={() => setIsOpen(false)}>Features</Link>
          <Link to="/pricing" className="text-gray-700 font-medium p-3 hover:bg-gray-50 rounded uppercase text-sm tracking-wide" onClick={() => setIsOpen(false)}>Pricing</Link>
          <a
            href="https://app.shiftcheck.app"
            className="text-gray-700 font-medium p-3 hover:bg-gray-50 rounded uppercase text-sm tracking-wide"
            onClick={() => setIsOpen(false)}
          >
            Login
          </a>
          <Link
            to="/demo"
            className="bg-primary-500 text-white px-6 py-3 rounded font-bold w-full text-center uppercase tracking-wide shadow-lg shadow-primary-500/30"
            onClick={() => setIsOpen(false)}
          >
            Request Demo
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
