import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, CalendarDays, CheckCircle, XCircle, RefreshCw, Calendar, Clock, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllEventsAdmin, deleteEvent } from '@/services/eventService';
import EventFormModal from '@/components/EventFormModal';
import AdminNav from '@/components/AdminNav';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year:    'numeric',
    month:   'short',
    day:     'numeric',
  });
}

function AdminEventCard({ event, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isPast = new Date(event.date) < new Date();

  return (
    <div className={`card p-5 flex flex-col gap-4 transition-all ${!event.isPublished ? 'opacity-60' : ''}`}>
      {/* Image preview */}
      {event.imageUrl && (
        <div className="h-32 rounded-lg overflow-hidden -mx-5 -mt-5 mb-0">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-semibold leading-snug flex-1">{event.title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {event.tag && (
            <span className="inline-flex items-center gap-1 text-xs bg-gold-500/10 text-gold-400 border border-gold-500/20 px-2 py-0.5 rounded-full">
              <Tag className="w-2.5 h-2.5" /> {event.tag}
            </span>
          )}
          {event.isPublished ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3" /> Published
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-dark-400 bg-dark-700 border border-dark-600 px-2 py-0.5 rounded-full">
              <XCircle className="w-3 h-3" /> Draft
            </span>
          )}
          {isPast && (
            <span className="text-xs text-dark-500 bg-dark-700 border border-dark-600 px-2 py-0.5 rounded-full">
              Ended
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-dark-400 text-xs leading-relaxed line-clamp-2">{event.description}</p>

      {/* Date & Time */}
      <div className="flex flex-wrap gap-3 text-xs text-dark-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gold-500" />
          {formatDate(event.date)}
        </span>
        {event.time && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gold-500" />
            {event.time}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-dark-700">
        <button
          onClick={() => onEdit(event)}
          className="flex items-center gap-1.5 text-sm text-dark-300 hover:text-gold-400 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-dark-700"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 text-sm text-dark-300 hover:text-red-400 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-dark-700 ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-dark-400">Confirm?</span>
            <button
              onClick={() => { onDelete(event._id); setConfirmDelete(false); }}
              className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded bg-red-400/10 border border-red-400/20"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-dark-400 hover:text-white font-medium px-2 py-1 rounded bg-dark-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminEvents() {
  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingEvt,  setEditingEvt]  = useState(null);
  const [filter,      setFilter]      = useState('all');

  const fetchEvents = useCallback(() => {
    setLoading(true);
    setError(null);
    getAllEventsAdmin()
      .then(setEvents)
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleEdit   = (evt) => { setEditingEvt(evt); setModalOpen(true); };
  const handleCreate = ()    => { setEditingEvt(null); setModalOpen(true); };
  const handleClose  = ()    => { setModalOpen(false); setEditingEvt(null); };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      toast.success('Event deleted.');
      fetchEvents();
    } catch {
      toast.error('Failed to delete event.');
    }
  };

  const now = new Date();
  const filtered = events.filter((e) => {
    if (filter === 'upcoming')   return new Date(e.date) >= now;
    if (filter === 'past')       return new Date(e.date) < now;
    if (filter === 'published')  return e.isPublished;
    if (filter === 'draft')      return !e.isPublished;
    return true;
  });

  const upcoming  = events.filter((e) => new Date(e.date) >= now).length;
  const published = events.filter((e) => e.isPublished).length;
  const drafts    = events.filter((e) => !e.isPublished).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Admin tab nav */}
      <AdminNav />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="section-subtitle block mb-1">Admin</span>
          <h1 className="section-title flex items-center gap-3">
            <CalendarDays className="w-7 h-7 text-gold-500" />
            Manage Events
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEvents}
            className="p-2 text-dark-400 hover:text-white transition-colors rounded-lg hover:bg-dark-700"
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',     value: events.length, color: 'text-white'      },
          { label: 'Upcoming',  value: upcoming,      color: 'text-gold-400'   },
          { label: 'Published', value: published,     color: 'text-green-400'  },
          { label: 'Drafts',    value: drafts,        color: 'text-dark-400'   },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold font-serif ${s.color}`}>{s.value}</p>
            <p className="text-dark-400 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-7">
        {[
          { key: 'all',       label: 'All' },
          { key: 'upcoming',  label: 'Upcoming' },
          { key: 'past',      label: 'Past' },
          { key: 'published', label: 'Published' },
          { key: 'draft',     label: 'Drafts' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-gold-500 text-dark-900'
                : 'bg-dark-800 text-dark-400 hover:text-white border border-dark-700'
            }`}
          >
            {f.label}
          </button>
        ))}
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
          <button onClick={fetchEvents} className="btn-secondary text-sm">Try Again</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-24 border border-dashed border-dark-700 rounded-xl">
          <CalendarDays className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400 mb-4">
            {events.length === 0 ? 'No events yet.' : 'No events match this filter.'}
          </p>
          {events.length === 0 && (
            <button onClick={handleCreate} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Create First Event
            </button>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((evt) => (
            <AdminEventCard
              key={evt._id}
              event={evt}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <EventFormModal
        isOpen={modalOpen}
        onClose={handleClose}
        onSuccess={fetchEvents}
        editEvent={editingEvt}
      />
    </div>
  );
}
