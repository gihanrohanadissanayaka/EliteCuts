import { useState, useEffect, useCallback } from 'react';
import RatingCard from '@/components/RatingCard';
import ReviewForm from '@/components/ReviewForm';
import { Star } from 'lucide-react';
import { getReviews } from '@/services/reviewService';

function AverageRating({ reviews }) {
  if (!reviews.length) return null;
  const avg = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const counts = [5, 4, 3, 2, 1].map((n) => ({
    star: n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  return (
    <div className="card p-6 flex flex-col sm:flex-row items-center gap-8 mb-10">
      <div className="text-center">
        <p className="text-6xl font-bold text-gold-400 font-serif">{avg}</p>
        <div className="flex items-center gap-1 justify-center mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < Math.round(avg) ? 'text-gold-400 fill-gold-400' : 'text-dark-600'}`} />
          ))}
        </div>
        <p className="text-dark-400 text-xs mt-1">{reviews.length} reviews</p>
      </div>
      <div className="flex-1 w-full space-y-2">
        {counts.map(({ star, count }) => {
          const pct = reviews.length ? (count / reviews.length) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="text-dark-400 w-4">{star}</span>
              <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
              <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-gold-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-dark-400 w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchReviews = useCallback(() => {
    setLoading(true);
    getReviews()
      .then((data) => setReviews(data))
      .catch(() => setError('Failed to load reviews.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="section-subtitle mb-3 block">Testimonials</span>
        <h1 className="section-title mb-4">What Our Clients Say</h1>
        <p className="text-dark-400 max-w-xl mx-auto text-sm leading-relaxed">
          Real experiences from our valued customers.
        </p>
      </div>

      {/* Review submission form */}
      <div className="mb-12 max-w-xl mx-auto">
        <ReviewForm onSuccess={fetchReviews} />
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
          <AverageRating reviews={reviews} />
          {reviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-dark-400">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {reviews.map((review, idx) => (
                <RatingCard key={review._id || idx} review={review} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
