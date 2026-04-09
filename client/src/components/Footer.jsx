import { Link } from 'react-router-dom';
import { Scissors, MapPin, Phone, Mail, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="w-5 h-5 text-gold-500" />
              <span className="font-serif text-lg font-bold text-white">
                Salon <span className="text-gold-500">DECO</span>
              </span>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed">
              Premium salon experience tailored for you. Style, class, and perfection in every visit. Est. 2022.
            </p>
            <div className="flex items-center gap-4 mt-5">
              <a href="https://www.facebook.com/salonthedeco" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-dark-400 hover:text-gold-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/',               label: 'Home' },
                { to: '/packages',       label: 'Packages' },
                { to: '/events',         label: 'Events' },
                { to: '/reviews',        label: 'Reviews' },
                { to: '/book',           label: 'Book Appointment' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-dark-400 hover:text-gold-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-dark-400">
                <MapPin className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                Puwakdandawa, Beliatta, Sri Lanka
              </li>
              <li className="flex items-center gap-2 text-dark-400">
                <Phone className="w-4 h-4 text-gold-500 flex-shrink-0" />
                076 715 7718
              </li>
              <li className="flex items-center gap-2 text-dark-400">
                <Mail className="w-4 h-4 text-gold-500 flex-shrink-0" />
                contact.salondeco@gmail.com
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-semibold mb-4">Working Hours</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li className="flex justify-between"><span>Mon – Fri</span><span className="text-white">9 AM – 8 PM</span></li>
              <li className="flex justify-between"><span>Saturday</span><span className="text-white">9 AM – 6 PM</span></li>
              <li className="flex justify-between"><span>Sunday</span><span className="text-white">10 AM – 4 PM</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-700 mt-10 pt-6 text-center text-dark-500 text-sm">
          © {new Date().getFullYear()} Salon DECO. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
