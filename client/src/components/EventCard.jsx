import { Calendar, Clock, Tag } from 'lucide-react';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

export default function EventCard({ event }) {
  const { title, description, date, time, imageUrl, tag } = event;

  const isPast = new Date(date) < new Date();

  return (
    <div className="card group flex flex-col transition-transform duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-dark-700 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-dark-500" />
          </div>
        )}
        {tag && (
          <span className="absolute top-3 left-3 bg-gold-500 text-dark-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {tag}
          </span>
        )}
        {isPast && (
          <div className="absolute inset-0 bg-dark-900/60 flex items-center justify-center">
            <span className="text-dark-300 font-semibold text-sm border border-dark-500 px-3 py-1 rounded-full">
              Event Ended
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-lg font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">
          {title}
        </h3>
        <p className="text-dark-400 text-sm leading-relaxed mb-4 flex-1">{description}</p>

        <div className="flex items-center gap-4 text-xs text-dark-400 border-t border-dark-700 pt-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gold-500" />
            {formatDate(date)}
          </span>
          {time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gold-500" />
              {time}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
