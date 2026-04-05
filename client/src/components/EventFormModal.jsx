import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { createEvent, updateEvent } from '@/services/eventService';

const schema = yup.object({
  title:       yup.string().trim().min(2, 'Min 2 characters').max(150).required('Title is required'),
  description: yup.string().trim().min(5, 'Min 5 characters').max(1000).required('Description is required'),
  date:        yup.date().typeError('Valid date is required').required('Date is required'),
  time:        yup.string().trim().nullable().optional().transform((v) => (v === '' ? null : v)),
  tag:         yup.string().trim().nullable().optional().transform((v) => (v === '' ? null : v)),
  imageUrl:    yup.string().nullable().optional().transform((v) => (v === '' ? null : v))
    .test('is-url-or-empty', 'Must be a valid URL', (v) => !v || /^https?:\/\/.+/.test(v)),
  isPublished: yup.boolean().default(true),
});

const DEFAULT_VALUES = {
  title:       '',
  description: '',
  date:        null,
  time:        '',
  tag:         '',
  imageUrl:    '',
  isPublished: true,
};

const PRESET_TAGS = ['Promotion', 'Special Offer', 'Event', 'Holiday', 'New Service', 'Seasonal'];

export default function EventFormModal({ isOpen, onClose, onSuccess, editEvent = null }) {
  const isEdit = Boolean(editEvent);
  const [customTag, setCustomTag] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema), defaultValues: DEFAULT_VALUES });

  const tagValue = watch('tag');

  useEffect(() => {
    if (isOpen) {
      if (editEvent) {
        const isPreset = PRESET_TAGS.includes(editEvent.tag);
        setCustomTag(!!editEvent.tag && !isPreset);
        reset({
          title:       editEvent.title       || '',
          description: editEvent.description || '',
          date:        editEvent.date ? new Date(editEvent.date) : null,
          time:        editEvent.time        || '',
          tag:         editEvent.tag         || '',
          imageUrl:    editEvent.imageUrl    || '',
          isPublished: editEvent.isPublished ?? true,
        });
      } else {
        setCustomTag(false);
        reset(DEFAULT_VALUES);
      }
    }
  }, [isOpen, editEvent, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEdit) {
        await updateEvent(editEvent._id, formData);
        toast.success('Event updated successfully!');
      } else {
        await createEvent(formData);
        toast.success('Event created successfully!');
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
              <CalendarDays className="w-5 h-5 text-gold-500" />
              <h2 className="font-serif text-xl font-bold text-white">
                {isEdit ? 'Edit Event' : 'Create Event'}
              </h2>
            </div>
            <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Title */}
            <div>
              <label className="label">Event Title</label>
              <input {...register('title')} type="text" placeholder="e.g. Spring Style Week" className="input-field" />
              {errors.title && <p className="error-text">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe the event, offer, or promotion..."
                className="input-field resize-none"
              />
              {errors.description && <p className="error-text">{errors.description.message}</p>}
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Date</label>
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onChange={(d) => field.onChange(d)}
                      className="input-field w-full"
                      placeholderText="Select date"
                      dateFormat="MMMM d, yyyy"
                      wrapperClassName="w-full"
                    />
                  )}
                />
                {errors.date && <p className="error-text">{errors.date.message}</p>}
              </div>
              <div>
                <label className="label">Time (optional)</label>
                <input
                  {...register('time')}
                  type="text"
                  placeholder="e.g. 9:00 AM – 6:00 PM"
                  className="input-field"
                />
                {errors.time && <p className="error-text">{errors.time.message}</p>}
              </div>
            </div>

            {/* Tag */}
            <div>
              <label className="label">Tag (optional)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setValue('tag', tagValue === t ? '' : t, { shouldValidate: true }); setCustomTag(false); }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      tagValue === t
                        ? 'bg-gold-500 border-gold-500 text-dark-900 font-semibold'
                        : 'border-dark-600 text-dark-400 hover:border-dark-500 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setCustomTag(true); setValue('tag', '', { shouldValidate: false }); }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    customTag
                      ? 'bg-dark-600 border-dark-500 text-white'
                      : 'border-dark-600 text-dark-500 hover:border-dark-500 hover:text-white'
                  }`}
                >
                  + Custom
                </button>
              </div>
              {customTag && (
                <input
                  {...register('tag')}
                  type="text"
                  placeholder="Enter custom tag..."
                  className="input-field"
                  autoFocus
                />
              )}
              {errors.tag && <p className="error-text">{errors.tag.message}</p>}
            </div>

            {/* Image URL */}
            <div>
              <label className="label">Image URL (optional)</label>
              <input
                {...register('imageUrl')}
                type="url"
                placeholder="https://example.com/image.jpg"
                className="input-field"
              />
              {errors.imageUrl && <p className="error-text">{errors.imageUrl.message}</p>}
            </div>

            {/* Published toggle */}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input {...register('isPublished')} type="checkbox" className="w-4 h-4 accent-green-400 cursor-pointer" />
                <span className="text-dark-200 text-sm">Published (visible to customers)</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-dark-700">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? (isEdit ? 'Saving...' : 'Creating...')
                  : (isEdit ? 'Save Changes' : 'Create Event')}
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
