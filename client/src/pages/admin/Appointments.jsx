import { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck2, ChevronLeft, ChevronRight, RefreshCw,
  Clock, Package, User, Phone, FileText, CheckCircle,
  XCircle, Loader2, CalendarDays, ListFilter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllAppointments, updateAppointmentStatus } from '@/services/appointmentService';
import AdminNav from '@/components/AdminNav';

/* ─── helpers ─────────────────────────────────────────────────────── */

function toLocalMidnight(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

function formatDay(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function isToday(date) { return sameDay(date, new Date()); }
function isTomorrow(date) {
  const t = new Date(); t.setDate(t.getDate() + 1);
  return sameDay(date, t);
}

function dayLabel(date) {
  if (isToday(date))    return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const STATUS_META = {
  pending:   { label: 'Pending',   color: 'text-gold-400',  bg: 'bg-gold-400/10  border-gold-400/25'  },
  confirmed: { label: 'Confirmed', color: 'text-blue-400',  bg: 'bg-blue-400/10  border-blue-400/25'  },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/25' },
  cancelled: { label: 'Cancelled', color: 'text-red-400',   bg: 'bg-red-400/10   border-red-400/25'   },
};

const TRANSITIONS = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/* ─── AppointmentRow ──────────────────────────────────────────────── */

function AppointmentRow({ appt, onStatusChange }) {
  const meta     = STATUS_META[appt.status] || STATUS_META.pending;
  const nextOpts = TRANSITIONS[appt.status] || [];
  const [busy, setBusy] = useState(false);

  const handleChange = async (newStatus) => {
    setBusy(true);
    try {
      await onStatusChange(appt._id, newStatus);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`card p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-opacity ${busy ? 'opacity-50' : ''}`}>
      {/* Time badge */}
      <div className="flex-shrink-0 w-20 text-center bg-dark-700 border border-dark-600 rounded-lg py-2 px-1">
        <Clock className="w-3.5 h-3.5 text-gold-500 mx-auto mb-0.5" />
        <p className="text-white text-xs font-semibold">{appt.timeSlot}</p>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5 text-white font-medium text-sm">
            <User className="w-3.5 h-3.5 text-gold-500" />
            {appt.guestName || appt.customer?.name || '—'}
          </span>
          {(appt.guestPhone || appt.customer?.phone) && (
            <span className="flex items-center gap-1.5 text-dark-400 text-xs">
              <Phone className="w-3 h-3" />
              {appt.guestPhone || appt.customer?.phone}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5 text-dark-300 text-xs">
            <Package className="w-3 h-3 text-gold-500" />
            {appt.packageName}
          </span>
          {appt.notes && (
            <span className="flex items-center gap-1.5 text-dark-400 text-xs italic truncate max-w-xs">
              <FileText className="w-3 h-3 flex-shrink-0" />
              {appt.notes}
            </span>
          )}
        </div>
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${meta.color} ${meta.bg}`}>
          {meta.label}
        </span>

        {busy && <Loader2 className="w-4 h-4 text-dark-400 animate-spin" />}

        {!busy && nextOpts.map((opt) => {
          const m = STATUS_META[opt];
          const isApprove  = opt === 'confirmed';
          const isComplete = opt === 'completed';
          const isCancel   = opt === 'cancelled';
          return (
            <button
              key={opt}
              onClick={() => handleChange(opt)}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                isApprove  ? 'border-blue-400/30  bg-blue-400/10  text-blue-400  hover:bg-blue-400/20'  :
                isComplete ? 'border-green-400/30 bg-green-400/10 text-green-400 hover:bg-green-400/20' :
                isCancel   ? 'border-red-400/30   bg-red-400/10   text-red-400   hover:bg-red-400/20'   :
                             `border-dark-600 bg-dark-700 ${m.color} hover:bg-dark-600`
              }`}
            >
              {isApprove  && <CheckCircle className="w-3 h-3" />}
              {isCancel   && <XCircle     className="w-3 h-3" />}
              {isComplete && <CheckCircle className="w-3 h-3" />}
              {opt === 'confirmed' ? 'Approve' : opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Mini date strip ─────────────────────────────────────────────── */

function DateStrip({ selected, onChange }) {
  const [weekStart, setWeekStart] = useState(() => {
    const d = toLocalMidnight(new Date());
    d.setDate(d.getDate() - d.getDay()); // Sunday
    return d;
  });

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const prevWeek = () => setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() - 7); return d; });
  const nextWeek = () => setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() + 7); return d; });

  return (
    <div className="card p-3 flex items-center gap-1">
      <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors">
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex flex-1 gap-1 overflow-x-auto scrollbar-none">
        {days.map((d) => {
          const active = sameDay(d, selected);
          const today  = isToday(d);
          return (
            <button
              key={d.toISOString()}
              onClick={() => onChange(d)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-lg text-xs transition-all flex-shrink-0 min-w-[44px] ${
                active
                  ? 'bg-gold-500 text-dark-900 font-semibold'
                  : today
                  ? 'bg-dark-700 border border-gold-500/40 text-white'
                  : 'hover:bg-dark-700 text-dark-400 hover:text-white'
              }`}
            >
              <span className="font-medium">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className={`text-base font-bold ${active ? '' : today ? 'text-gold-400' : ''}`}>
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────── */

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminAppointments() {
  const [appointments,  setAppointments]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [selectedDate,  setSelectedDate]  = useState(toLocalMidnight(new Date()));
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [viewMode,      setViewMode]      = useState('day'); // 'day' | 'all'

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAppointments();
      setAppointments(data);
    } catch {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await updateAppointmentStatus(id, newStatus);
      setAppointments((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
      toast.success(`Marked as ${newStatus}.`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Status update failed.');
    }
  };

  // Filter by day or show all
  const byDay = appointments.filter((a) => sameDay(new Date(a.date), selectedDate));
  const base  = viewMode === 'day' ? byDay : appointments;
  const filtered = statusFilter === 'all' ? base : base.filter((a) => a.status === statusFilter);

  // Sort by timeSlot (string sort is fine for hh:mm AM/PM since they're consistent)
  const sorted = [...filtered].sort((a, b) => {
    if (viewMode === 'all') return new Date(a.date) - new Date(b.date);
    return a.timeSlot.localeCompare(b.timeSlot);
  });

  const pendingCount   = appointments.filter((a) => a.status === 'pending').length;
  const todayCount     = appointments.filter((a) => sameDay(new Date(a.date), new Date())).length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const upcomingCount  = appointments.filter((a) => {
    const d = toLocalMidnight(new Date(a.date));
    const t = toLocalMidnight(new Date());
    return d >= t && a.status !== 'cancelled';
  }).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="section-subtitle block mb-1">Admin</span>
          <h1 className="section-title flex items-center gap-3">
            <CalendarCheck2 className="w-7 h-7 text-gold-500" />
            Appointments
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="p-2 text-dark-400 hover:text-white transition-colors rounded-lg hover:bg-dark-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's",   value: todayCount,     color: 'text-gold-400'  },
          { label: 'Pending',   value: pendingCount,   color: 'text-gold-400'  },
          { label: 'Confirmed', value: confirmedCount, color: 'text-blue-400'  },
          { label: 'Upcoming',  value: upcomingCount,  color: 'text-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-bold font-serif ${color}`}>{value}</p>
            <p className="text-dark-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* View mode toggle */}
      <div className="flex items-center gap-1 bg-dark-800 border border-dark-700 rounded-xl p-1 w-fit mb-5">
        {[
          { key: 'day', icon: <CalendarDays className="w-4 h-4" />, label: 'By Day'  },
          { key: 'all', icon: <ListFilter   className="w-4 h-4" />, label: 'All'     },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === key ? 'bg-gold-500 text-dark-900 font-semibold' : 'text-dark-400 hover:text-white'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Day strip */}
      {viewMode === 'day' && (
        <div className="mb-5">
          <DateStrip selected={selectedDate} onChange={setSelectedDate} />
          <p className="text-dark-400 text-sm mt-3 pl-1">
            {dayLabel(selectedDate)} — {formatDay(selectedDate)}
            <span className="ml-2 text-dark-500">({byDay.length} appointment{byDay.length !== 1 ? 's' : ''})</span>
          </p>
        </div>
      )}

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => {
          const count = (f === 'all' ? base : base.filter((a) => a.status === f)).length;
          return (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                statusFilter === f
                  ? 'bg-gold-500 text-dark-900'
                  : 'bg-dark-800 text-dark-400 hover:text-white border border-dark-700'
              }`}
            >
              <span className="capitalize">{f === 'all' ? 'All' : STATUS_META[f]?.label}</span>
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${statusFilter === f ? 'bg-dark-900/30' : 'bg-dark-700'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-20 space-y-3">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchAll} className="btn-secondary text-sm">Try Again</button>
        </div>
      )}

      {!loading && !error && sorted.length === 0 && (
        <div className="text-center py-24 border border-dashed border-dark-700 rounded-xl">
          <CalendarCheck2 className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">
            {viewMode === 'day'
              ? `No ${statusFilter === 'all' ? '' : statusFilter + ' '}appointments for ${dayLabel(selectedDate)}.`
              : `No ${statusFilter === 'all' ? '' : statusFilter + ' '}appointments found.`}
          </p>
        </div>
      )}

      {!loading && !error && sorted.length > 0 && (
        <div className="space-y-3">
          {viewMode === 'all' && (() => {
            // Group by date in "all" mode
            const groups = {};
            sorted.forEach((a) => {
              const key = toLocalMidnight(new Date(a.date)).toISOString();
              if (!groups[key]) groups[key] = { date: new Date(a.date), items: [] };
              groups[key].items.push(a);
            });
            return Object.values(groups).map(({ date, items }) => (
              <div key={date.toISOString()}>
                <div className="flex items-center gap-3 mb-2 mt-4 first:mt-0">
                  <p className="text-dark-400 text-xs font-semibold uppercase tracking-widest">
                    {dayLabel(date)} · {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  {isToday(date) && (
                    <span className="text-xs bg-gold-500/10 text-gold-400 border border-gold-500/20 px-2 py-0.5 rounded-full">Today</span>
                  )}
                  <div className="flex-1 h-px bg-dark-700" />
                </div>
                <div className="space-y-2">
                  {items.map((a) => (
                    <AppointmentRow key={a._id} appt={a} onStatusChange={handleStatusChange} />
                  ))}
                </div>
              </div>
            ));
          })()}

          {viewMode === 'day' && sorted.map((a) => (
            <AppointmentRow key={a._id} appt={a} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
