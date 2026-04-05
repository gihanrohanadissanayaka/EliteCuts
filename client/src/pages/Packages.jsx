import { useState, useEffect } from 'react';
import PackageCard from '@/components/PackageCard';
import { getPackages } from '@/services/packageService';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPackages()
      .then((data) => setPackages(data))
      .catch(() => setError('Failed to load packages. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <span className="section-subtitle mb-3 block">Pricing</span>
        <h1 className="section-title mb-4">Our Packages</h1>
        <p className="text-dark-400 max-w-xl mx-auto text-sm leading-relaxed">
          Choose from our curated service packages, crafted to give you the best experience at
          unbeatable value.
        </p>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center items-center py-24">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-24">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && packages.length === 0 && (
        <div className="text-center py-24">
          <p className="text-dark-400">No packages available at the moment.</p>
        </div>
      )}

      {!loading && !error && packages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <PackageCard key={pkg._id || pkg.name} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
}
