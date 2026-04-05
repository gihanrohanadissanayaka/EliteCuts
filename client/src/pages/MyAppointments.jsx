import { useState, useEffect } from 'react';
import { CalendarCheck, Clock, Package, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyAppointments, cancelAppointment } from '@/services/appointmentService';

const STATUS_STYLES = {
  pending:   { color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  confirmed: { color: 'text-green-400 bg-green-400/10 border-green-400/30',  icon: <CheckCircle className="w-3.5 h-3.5" />  },
  completed: { color: 'text-blue-400 bg-blue-400/10 border-blue-400/30',    icon: <CheckCircle className="w-3.5 h-3.5" />  },
  cancelled: { color: 'text-red-400 bg-red-400/10 border-red-400/30',       icon: <XCircle className="w-3.5 h-3.5" />      },
};

function AppointmentRow({ appointment, onCancel }) {
  const { _id, packageName, date, timeSlot, status, notes } = appointment;
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;

  return (
    <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gold-500" />
          <span className="text-white font-semibold">{packageName}</span>
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${style.color}`}>
            {style.icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-dark-400">
          <span className="flex items-center gap-1">
            <CalendarCheck className="w-3.5 h-3.5 text-gold-500" />
            {new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gold-500" />
            {timeSlot}
          </span>
        </div>
        {notes && <p className="text-dark-500 text-xs italic">"{notes}"</p>}
      </div>

      {status === 'pending' || status === 'confirmed' ? (
        <button
          onClick={() => onCancel(_id)}
          className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-medium transition-colors whitespace-nowrap"
        >
          <XCircle className="w-4 h-4" />
          Cancel
        </button>
      ) : null}
    </div>
  );
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const fetchAppointments = () => {
    setLoading(true);
    getMyAppointments()
      .then((data) => setAppointments(data))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled.');
      fetchAppointments();
    } catch {
      toast.error('Failed to cancel. Please try again.');
    }
  };

  const upcoming = appointments.filter((a) => a.status !== 'completed' && a.status !== 'cancelled');
  const past     = appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <span className="section-subtitle mb-2 block">Your Schedule</span>
        <h1 className="section-title">My Appointments</h1>
      </div>

      {loading && (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-24">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Upcoming */}
          <div className="mb-10">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-gold-500" />
              Upcoming ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-dark-400 text-sm bg-dark-800 border border-dark-700 rounded-xl p-6">
                No upcoming appointments.{' '}
                <a href="/book" className="text-gold-400 hover:underline">Book one now →</a>
              </p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((a) => (
                  <AppointmentRow key={a._id} appointment={a} onCancel={handleCancel} />
                ))}
              </div>
            )}
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="text-dark-400 font-semibold mb-4">History ({past.length})</h2>
              <div className="space-y-4 opacity-70">
                {past.map((a) => (
                  <AppointmentRow key={a._id} appointment={a} onCancel={handleCancel} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
