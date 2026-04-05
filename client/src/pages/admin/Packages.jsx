import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Package, Star, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllPackagesAdmin, deletePackage } from '@/services/packageService';
import PackageFormModal from '@/components/PackageFormModal';
import { formatPrice } from '@/utils/currency';
import AdminNav from '@/components/AdminNav';

function AdminPackageCard({ pkg, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={`card p-5 flex flex-col gap-4 transition-all ${!pkg.isActive ? 'opacity-60' : ''}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-white font-semibold truncate">{pkg.name}</h3>
            {pkg.popular && (
              <span className="inline-flex items-center gap-0.5 bg-gold-500/15 text-gold-400 text-xs font-medium px-2 py-0.5 rounded-full border border-gold-500/30">
                <Star className="w-3 h-3 fill-gold-400" /> Popular
              </span>
            )}
            {pkg.isActive ? (
              <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-dark-400 bg-dark-700 border border-dark-600 px-2 py-0.5 rounded-full">
                <XCircle className="w-3 h-3" /> Inactive
              </span>
            )}
          </div>
          <p className="text-dark-400 text-xs line-clamp-2 leading-relaxed">{pkg.description}</p>
        </div>
      </div>

      {/* Price + Duration */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gold-400 font-bold text-lg">{formatPrice(pkg.price)}</span>
        <span className="text-dark-500">•</span>
        <span className="text-dark-400">{pkg.duration} min</span>
        {pkg.order > 0 && <span className="text-dark-500 text-xs">Order: {pkg.order}</span>}
      </div>

      {/* Features */}
      {pkg.features?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {pkg.features.slice(0, 4).map((f, i) => (
            <span key={i} className="text-xs bg-dark-700 text-dark-300 px-2 py-0.5 rounded-md">{f}</span>
          ))}
          {pkg.features.length > 4 && (
            <span className="text-xs text-dark-500 px-2 py-0.5">+{pkg.features.length - 4} more</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-dark-700">
        <button
          onClick={() => onEdit(pkg)}
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
              onClick={() => { onDelete(pkg._id); setConfirmDelete(false); }}
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

export default function AdminPackages() {
  const [packages,      setPackages]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingPkg,    setEditingPkg]    = useState(null);

  const fetchPackages = useCallback(() => {
    setLoading(true);
    setError(null);
    getAllPackagesAdmin()
      .then(setPackages)
      .catch(() => setError('Failed to load packages.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const handleEdit = (pkg) => {
    setEditingPkg(pkg);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPkg(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingPkg(null);
  };

  const handleDelete = async (id) => {
    try {
      await deletePackage(id);
      toast.success('Package deleted.');
      fetchPackages();
    } catch {
      toast.error('Failed to delete package.');
    }
  };

  const totalActive   = packages.filter((p) => p.isActive).length;
  const totalInactive = packages.filter((p) => !p.isActive).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Admin tab nav */}
      <AdminNav />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="section-subtitle block mb-1">Admin</span>
          <h1 className="section-title flex items-center gap-3">
            <Package className="w-7 h-7 text-gold-500" />
            Manage Packages
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPackages}
            className="p-2 text-dark-400 hover:text-white transition-colors rounded-lg hover:bg-dark-700"
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Package
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total',    value: packages.length, color: 'text-white' },
          { label: 'Active',   value: totalActive,     color: 'text-green-400' },
          { label: 'Inactive', value: totalInactive,   color: 'text-dark-400' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold font-serif ${s.color}`}>{s.value}</p>
            <p className="text-dark-400 text-xs mt-0.5">{s.label}</p>
          </div>
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
          <button onClick={fetchPackages} className="btn-secondary text-sm">Try Again</button>
        </div>
      )}

      {!loading && !error && packages.length === 0 && (
        <div className="text-center py-24 border border-dashed border-dark-700 rounded-xl">
          <Package className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400 mb-4">No packages yet.</p>
          <button onClick={handleCreate} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Create First Package
          </button>
        </div>
      )}

      {!loading && !error && packages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <AdminPackageCard
              key={pkg._id}
              pkg={pkg}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <PackageFormModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSuccess={fetchPackages}
        editPackage={editingPkg}
      />
    </div>
  );
}
