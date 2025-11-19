import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Secret admin shortcut: Ctrl + Alt + A
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        navigate('/admin/login');
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <img src={logo} alt="Whitestones Markets" className="h-10 mb-4 brightness-0 invert" />
            <p className="text-primary-foreground/80 mb-4">
              Your trusted partner in building wealth through smart investments
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/company/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">About Us</Link>
              </li>
              <li>
                {/* Navigate to home with hash so landing page scrolls to investments */}
                <Link to={{ pathname: '/', hash: '#investments' } as any} className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Investment Options</Link>
              </li>
              <li><Link to="/signup" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Open Account</Link></li>
              <li><Link to="/login" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Explore</h4>
            <ul className="space-y-2">
              <li><Link to="/company/whitestones-markets" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Whitestones Markets</Link></li>
              <li><Link to="/company/investments" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Investments</Link></li>
              <li><Link to="/company/cryptocurrencies" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Cryptocurrencies</Link></li>
              <li><Link to="/company/real-estate" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Real Estate</Link></li>
              <li><Link to="/company/oil-and-gas" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Oil &amp; Gas</Link></li>
              <li><Link to="/company/nft" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">NFT</Link></li>
              <li><Link to="/company/retirement" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Retirement</Link></li>
              <li><Link to="/company/loan" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Loan</Link></li>
              <li><Link to="/company/about" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Company</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">whitestonesmarkets@gmail.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">Clontarf, Dublin 3, D03 E5R6, Ireland</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="font-bold text-lg mb-3">Language</h4>
              <select
                className="bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/30 rounded px-3 py-2 w-full"
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
              >
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <p className="text-primary-foreground/80 text-sm mb-4 md:mb-0">
                &copy; {currentYear} Whitestones Markets. All rights reserved.
              </p>
              <button
                onClick={() => navigate('/admin/login')}
                className="opacity-0 hover:opacity-20 transition-opacity cursor-pointer ml-1 text-xs"
                title="Admin Access (Ctrl+Alt+A)"
                aria-label="Admin Access"
              >
                ◆
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-primary-foreground/60 text-xs">Designed with care.</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};