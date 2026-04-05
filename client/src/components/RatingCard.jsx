import { Star } from 'lucide-react';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'text-gold-400 fill-gold-400' : 'text-dark-600'
          }`}
        />
      ))}
    </div>
  );
}

function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function RatingCard({ review }) {
  const { customerName, rating, comment, date, service, avatarUrl } = review;

  return (
    <div className="card p-5 flex flex-col gap-4 hover:border-dark-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={customerName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center font-bold text-dark-900 text-sm flex-shrink-0">
              {getInitials(customerName)}
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-sm">{customerName}</p>
            {service && (
              <p className="text-dark-400 text-xs">{service}</p>
            )}
          </div>
        </div>
        <StarRating rating={rating} />
      </div>

      {/* Comment */}
      <p className="text-dark-300 text-sm leading-relaxed italic">"{comment}"</p>

      {/* Date */}
      {date && (
        <p className="text-dark-500 text-xs">
          {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}
    </div>
  );
}
