import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { formatPrice } from '@/utils/currency';

export default function PackageCard({ pkg }) {
  const { name, description, price, duration, features = [], popular = false } = pkg;

  return (
    <div className={`relative flex flex-col transition-transform duration-300 hover:-translate-y-1 ${popular ? 'mt-4' : ''}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
          <span className="bg-gold-500 text-dark-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow-md">
            Most Popular
          </span>
        </div>
      )}

      <div className={`card flex flex-col flex-1 ${popular ? 'border-gold-500 ring-1 ring-gold-500' : ''}`}>
        <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-serif text-xl font-bold text-white mb-1">{name}</h3>
          <p className="text-dark-400 text-sm leading-relaxed">{description}</p>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mb-5">
          <span className="text-3xl font-bold text-gold-400">{formatPrice(price)}</span>
          <span className="text-dark-400 text-sm mb-1">/ {duration} min</span>
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-6 flex-1">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-dark-300">
              <Check className="w-4 h-4 text-gold-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          to={`/book?package=${encodeURIComponent(name)}`}
          className={popular ? 'btn-primary justify-center w-full' : 'btn-secondary justify-center w-full'}
        >
          Book Now
        </Link>
        </div>
      </div>
    </div>
  );
}
