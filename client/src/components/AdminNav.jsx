import { NavLink } from 'react-router-dom';
import { Package, CalendarDays, CalendarCheck2 } from 'lucide-react';

const adminLinks = [
  { to: '/admin/packages',     label: 'Packages',     icon: <Package       className="w-4 h-4" /> },
  { to: '/admin/events',       label: 'Events',       icon: <CalendarDays  className="w-4 h-4" /> },
  { to: '/admin/appointments', label: 'Appointments', icon: <CalendarCheck2 className="w-4 h-4" /> },
];

export default function AdminNav() {
  return (
    <div className="flex items-center gap-1 bg-dark-800 border border-dark-700 rounded-xl p-1 w-fit mb-8">
      {adminLinks.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            isActive
              ? 'flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 text-dark-900 font-semibold text-sm'
              : 'flex items-center gap-2 px-4 py-2 rounded-lg text-dark-400 hover:text-white text-sm font-medium transition-colors'
          }
        >
          {icon}
          {label}
        </NavLink>
      ))}
    </div>
  );
}
