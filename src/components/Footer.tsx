import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-gray-200 text-gray-500 text-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-primary-500 rounded flex items-center justify-center text-white font-bold text-xs shadow-md">
                <CheckCircle2 size={16} />
              </div>
              <span className="text-lg font-bold text-gray-900 uppercase tracking-tight">ShiftCheck</span>
            </Link>
            <p className="mb-6 leading-relaxed">
              Proof, not promises. The operating system for high-performance restaurants.
            </p>
          </div>

          <div className="flex gap-16 flex-wrap">
            <div>
              <h5 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Product</h5>
              <ul className="space-y-3">
                <li><Link to="/features" className="hover:text-primary-600 transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-primary-600 transition-colors">Pricing</Link></li>
                <li><Link to="/demo" className="hover:text-primary-600 transition-colors">Request Demo</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Resources</h5>
              <ul className="space-y-3">
                <li><Link to="/case-studies" className="hover:text-primary-600 transition-colors">Case Studies</Link></li>
                <li><Link to="/blog" className="hover:text-primary-600 transition-colors">Blog</Link></li>
                <li><Link to="/faq" className="hover:text-primary-600 transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Company</h5>
              <ul className="space-y-3">
                <li><Link to="/about" className="hover:text-primary-600 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary-600 transition-colors">Contact</Link></li>
                <li><a href="https://app.shiftcheck.app" className="hover:text-primary-600 transition-colors">Login</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>&copy; {new Date().getFullYear()} ShiftCheck Inc. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-900">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
