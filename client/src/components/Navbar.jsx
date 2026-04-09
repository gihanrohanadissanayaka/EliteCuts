import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Scissors, LogOut, CalendarCheck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { to: '/',               label: 'Home' },
  { to: '/packages',       label: 'Packages' },
  { to: '/events',         label: 'Events' },
  { to: '/reviews',        label: 'Reviews' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-sm border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Scissors className="w-6 h-6 text-gold-500 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-serif text-xl font-bold text-white">
              Salon <span className="text-gold-500">DECO</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  isActive
                    ? 'px-4 py-2 text-gold-400 font-medium text-sm rounded-lg bg-dark-800'
                    : 'px-4 py-2 text-dark-300 hover:text-white font-medium text-sm rounded-lg hover:bg-dark-800 transition-all'
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin/packages" className="btn-ghost flex items-center gap-1 text-sm text-gold-400 hover:text-gold-300">
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link to="/my-appointments" className="btn-ghost flex items-center gap-1 text-sm">
                  <CalendarCheck className="w-4 h-4" />
                  My Bookings
                </Link>
                <button onClick={handleLogout} className="btn-ghost flex items-center gap-1 text-sm">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-dark-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-700 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? 'block px-4 py-2 text-gold-400 font-medium rounded-lg bg-dark-700'
                  : 'block px-4 py-2 text-dark-300 hover:text-white font-medium rounded-lg hover:bg-dark-700 transition-all'
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-dark-700 space-y-2">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin/packages"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gold-400 hover:text-gold-300 font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Admin
                  </Link>
                )}
                <Link
                  to="/my-appointments"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-dark-200 hover:text-white"
                >
                  <CalendarCheck className="w-4 h-4" /> My Bookings
                </Link>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2 text-dark-200 hover:text-white w-full text-left"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-dark-200 hover:text-white">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary w-full justify-center text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
