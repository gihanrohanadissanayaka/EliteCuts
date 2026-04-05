import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Plus, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { createPackage, updatePackage } from '@/services/packageService';

const schema = yup.object({
  name:        yup.string().trim().min(2, 'Min 2 characters').max(80).required('Name is required'),
  description: yup.string().trim().min(5, 'Min 5 characters').max(500).required('Description is required'),
  price:       yup.number().typeError('Enter a valid price').min(0, 'Cannot be negative').required('Price is required'),
  duration:    yup.number().typeError('Enter a valid duration').integer('Must be a whole number').min(5, 'Min 5 minutes').required('Duration is required'),
  features:    yup.array().of(yup.object({ value: yup.string() })),
  popular:     yup.boolean().default(false),
  isActive:    yup.boolean().default(true),
  order:       yup.number().integer().min(0).default(0).nullable().transform((v) => (isNaN(v) ? 0 : v)),
  imageUrl:    yup.string().nullable().optional().transform((v) => (v === '' ? null : v)),
});

const DEFAULT_VALUES = {
  name:        '',
  description: '',
  price:       '',
  duration:    '',
  features:    [],
  popular:     false,
  isActive:    true,
  order:       0,
  imageUrl:    '',
};

export default function PackageFormModal({ isOpen, onClose, onSuccess, editPackage = null }) {
  const isEdit = Boolean(editPackage);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const { fields: featureFields, append: addFeature, remove: removeFeature } = useFieldArray({
    control,
    name: 'features',
  });

  // Populate form when editing
  useEffect(() => {
    if (isOpen) {
      if (editPackage) {
        reset({
          name:        editPackage.name        || '',
          description: editPackage.description || '',
          price:       editPackage.price       ?? '',
          duration:    editPackage.duration    ?? '',
          features:    (editPackage.features || []).map((v) => ({ value: v })),
          popular:     editPackage.popular     ?? false,
          isActive:    editPackage.isActive    ?? true,
          order:       editPackage.order       ?? 0,
          imageUrl:    editPackage.imageUrl    || '',
        });
      } else {
        reset(DEFAULT_VALUES);
      }
    }
  }, [isOpen, editPackage, reset]);

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      features: formData.features.map((f) => f.value).filter((v) => v.trim() !== ''),
    };

    try {
      if (isEdit) {
        await updatePackage(editPackage._id, payload);
        toast.success('Package updated successfully!');
      } else {
        await createPackage(payload);
        toast.success('Package created successfully!');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gold-500" />
              <h2 className="font-serif text-xl font-bold text-white">
                {isEdit ? 'Edit Package' : 'Create Package'}
              </h2>
            </div>
            <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="label">Package Name</label>
              <input {...register('name')} type="text" placeholder="e.g. Elite Grooming" className="input-field" />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea {...register('description')} rows={3} placeholder="Describe what's included..." className="input-field resize-none" />
              {errors.description && <p className="error-text">{errors.description.message}</p>}
            </div>

            {/* Price + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price (LKR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm font-medium">LKR</span>
                  <input
                    {...register('price')}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="input-field pl-14"
                  />
                </div>
                {errors.price && <p className="error-text">{errors.price.message}</p>}
              </div>
              <div>
                <label className="label">Duration (minutes)</label>
                <input {...register('duration')} type="number" min="5" placeholder="60" className="input-field" />
                {errors.duration && <p className="error-text">{errors.duration.message}</p>}
              </div>
            </div>

            {/* Features */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Features</label>
                <button
                  type="button"
                  onClick={() => addFeature({ value: '' })}
                  className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Feature
                </button>
              </div>
              <div className="space-y-2">
                {featureFields.length === 0 && (
                  <p className="text-dark-500 text-xs italic py-2">No features added yet. Click "Add Feature" to start.</p>
                )}
                {featureFields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <input
                      {...register(`features.${idx}.value`)}
                      type="text"
                      placeholder={`Feature ${idx + 1}`}
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      className="p-2 text-dark-400 hover:text-red-400 transition-colors flex-shrink-0"
                      aria-label="Remove feature"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Order + Image URL */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Display Order</label>
                <input {...register('order')} type="number" min="0" placeholder="0" className="input-field" />
                {errors.order && <p className="error-text">{errors.order.message}</p>}
              </div>
              <div>
                <label className="label">Image URL (optional)</label>
                <input {...register('imageUrl')} type="url" placeholder="https://..." className="input-field" />
                {errors.imageUrl && <p className="error-text">{errors.imageUrl.message}</p>}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input {...register('popular')} type="checkbox" className="w-4 h-4 accent-yellow-400 cursor-pointer" />
                <span className="text-dark-200 text-sm">Mark as Popular</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input {...register('isActive')} type="checkbox" className="w-4 h-4 accent-green-400 cursor-pointer" />
                <span className="text-dark-200 text-sm">Active (visible to customers)</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-dark-700">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Package')}
              </button>
              <button type="button" onClick={onClose} className="btn-ghost px-5">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
