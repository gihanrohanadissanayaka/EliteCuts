import { useState, useEffect } from 'react';
import EventCard from '@/components/EventCard';
import { getEvents } from '@/services/eventService';

const FILTERS = ['All', 'Upcoming', 'Past'];

export default function Events() {
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [activeFilter, setFilter]   = useState('All');

  useEffect(() => {
    getEvents()
      .then((data) => setEvents(data))
      .catch(() => setError('Failed to load events. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  const filtered = events.filter((e) => {
    if (activeFilter === 'Upcoming') return new Date(e.date) >= now;
    if (activeFilter === 'Past')     return new Date(e.date) < now;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="section-subtitle mb-3 block">What's On</span>
        <h1 className="section-title mb-4">Events & Promotions</h1>
        <p className="text-dark-400 max-w-xl mx-auto text-sm leading-relaxed">
          Stay updated with our latest events, special offers, and seasonal promotions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === f
                ? 'bg-gold-500 text-dark-900'
                : 'bg-dark-800 text-dark-400 hover:text-white border border-dark-700'
            }`}
          >
            {f}
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
        <div className="text-center py-24">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-24">
          <p className="text-dark-400">No events found.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event) => (
            <EventCard key={event._id || event.title} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
