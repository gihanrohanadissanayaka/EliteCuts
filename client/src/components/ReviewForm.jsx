import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Star, CheckCircle, MessageSquarePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { createReview } from '@/services/reviewService';

const SERVICES = [
  'Haircut',
  'Beard Trim',
  'Hot Towel Shave',
  'Full Grooming Package',
  'Hair Coloring',
  'Scalp Treatment',
  'Kids Haircut',
  'Other',
];

const schema = yup.object({
  customerName: yup.string().trim().min(2, 'Min 2 characters').max(80, 'Max 80 characters').required('Name is required'),
  rating:       yup.number().min(1, 'Please select a rating').max(5).required('Rating is required'),
  service:      yup.string().optional().transform((v) => (v === '' ? undefined : v)),
  comment:      yup.string().trim().min(5, 'Min 5 characters').max(500, 'Max 500 characters').required('Comment is required'),
});

function StarPicker({ value, onChange, error }) {
  const [hovered, setHovered] = useState(0);

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`Rate ${n} stars`}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                n <= (hovered || value)
                  ? 'text-gold-400 fill-gold-400'
                  : 'text-dark-600 hover:text-dark-400'
              }`}
            />
          </button>
        ))}
        {(hovered || value) > 0 && (
          <span className="ml-2 text-sm text-gold-400 font-medium">
            {labels[hovered || value]}
          </span>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function ReviewForm({ onSuccess }) {
  const [submitted, setSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { customerName: '', rating: 0, service: '', comment: '' },
  });

  const ratingValue = watch('rating');

  const onSubmit = async (values) => {
    try {
      await createReview(values);
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit review. Please try again.';
      toast.error(msg);
    }
  };

  if (submitted) {
    return (
      <div className="card p-8 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-green-400/10 border border-green-400/20 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-green-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">Thank you for your review!</h3>
          <p className="text-dark-400 text-sm mt-1">
            Your review has been submitted and will appear once approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
          <MessageSquarePlus className="w-5 h-5 text-gold-400" />
        </div>
        <div>
          <h2 className="text-white font-semibold">Write a Review</h2>
          <p className="text-dark-400 text-xs">Share your experience with others</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">
            Your Name <span className="text-gold-500">*</span>
          </label>
          <input
            {...register('customerName')}
            placeholder="Enter your name"
            className={`input w-full ${errors.customerName ? 'border-red-500 focus:ring-red-500/30' : ''}`}
          />
          {errors.customerName && (
            <p className="text-red-400 text-xs mt-1">{errors.customerName.message}</p>
          )}
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">
            Rating <span className="text-gold-500">*</span>
          </label>
          <StarPicker
            value={ratingValue}
            onChange={(v) => setValue('rating', v, { shouldValidate: true })}
            error={errors.rating?.message}
          />
        </div>

        {/* Service */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">
            Service <span className="text-dark-500 font-normal">(optional)</span>
          </label>
          <select {...register('service')} className="input w-full">
            <option value="">-- Select a service --</option>
            {SERVICES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">
            Your Review <span className="text-gold-500">*</span>
          </label>
          <textarea
            {...register('comment', {
              onChange: (e) => setCharCount(e.target.value.length),
            })}
            rows={4}
            placeholder="Tell us about your experience..."
            className={`input w-full resize-none ${errors.comment ? 'border-red-500 focus:ring-red-500/30' : ''}`}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.comment ? (
              <p className="text-red-400 text-xs">{errors.comment.message}</p>
            ) : (
              <span />
            )}
            <span className={`text-xs ${charCount > 480 ? 'text-gold-400' : 'text-dark-500'}`}>
              {charCount}/500
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
              Submitting…
            </span>
          ) : (
            'Submit Review'
          )}
        </button>
      </form>
    </div>
  );
}
