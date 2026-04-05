import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Calendar, Clock, User } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { createAppointment } from '@/services/appointmentService';

const schema = yup.object({
  packageName: yup.string().required('Please select a package'),
  date:        yup.date().required('Please select a date').min(new Date(), 'Date must be in the future'),
  timeSlot:    yup.string().required('Please select a time slot'),
  notes:       yup.string().max(300, 'Notes cannot exceed 300 characters'),
});

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM',  '1:30 PM',  '2:00 PM',  '2:30 PM',
  '3:00 PM',  '3:30 PM',  '4:00 PM',  '4:30 PM',
  '5:00 PM',  '5:30 PM',  '6:00 PM',  '6:30 PM',
];

export default function AppointmentModal({ isOpen, onClose, preselectedPackage = '', packages = [], onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const selectedDate = watch('date');

  useEffect(() => {
    if (preselectedPackage) setValue('packageName', preselectedPackage);
  }, [preselectedPackage, setValue]);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    if (!user) {
      toast.error('Please login to book an appointment');
      return;
    }
    try {
      setLoading(true);
      await createAppointment(data);
      toast.success('Appointment booked successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-lg shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold-500" />
              <h2 className="font-serif text-xl font-bold text-white">Book Appointment</h2>
            </div>
            <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Package */}
            <div>
              <label className="label">Package</label>
              <select {...register('packageName')} className="input-field">
                <option value="">Select a package</option>
                {packages.map((pkg) => (
                  <option key={pkg._id || pkg.name} value={pkg.name}>
                    {pkg.name} — LKR {pkg.price}
                  </option>
                ))}
              </select>
              {errors.packageName && <p className="error-text">{errors.packageName.message}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="label">Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setValue('date', date, { shouldValidate: true })}
                minDate={new Date()}
                filterDate={(d) => d.getDay() !== 0}
                className="input-field w-full"
                placeholderText="Select a date"
                dateFormat="MMMM d, yyyy"
                wrapperClassName="w-full"
              />
              {errors.date && <p className="error-text">{errors.date.message}</p>}
            </div>

            {/* Time Slot */}
            <div>
              <label className="label">Time Slot</label>
              <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                {TIME_SLOTS.map((slot) => {
                  const selected = watch('timeSlot') === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setValue('timeSlot', slot, { shouldValidate: true })}
                      className={`text-xs py-2 px-1 rounded-lg border transition-all ${
                        selected
                          ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                          : 'border-dark-600 text-dark-400 hover:border-dark-500 hover:text-white'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              {errors.timeSlot && <p className="error-text">{errors.timeSlot.message}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="Any special requests or preferences..."
                className="input-field resize-none"
              />
              {errors.notes && <p className="error-text">{errors.notes.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
