import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { CalendarCheck, ClipboardList, Copy, CheckCircle2, User, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createAppointment, getBookedSlots } from '@/services/appointmentService';
import { getPackages } from '@/services/packageService';
import ManageAppointment from '@/components/ManageAppointment';

const schema = yup.object({
  guestName:   yup.string().trim().min(2, 'Min 2 characters').max(80).required('Name is required'),
  guestPhone:  yup.string().trim().matches(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid mobile number').required('Mobile number is required'),
  packageName: yup.string().required('Please select a package'),
  date:        yup.date().typeError('Please select a date').required('Please select a date').min(new Date(), 'Date must be in the future'),
  timeSlot:    yup.string().required('Please select a time slot'),
  notes:       yup.string().max(300, 'Notes cannot exceed 300 characters').optional(),
});

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM',  '1:30 PM',  '2:00 PM',  '2:30 PM',
  '3:00 PM',  '3:30 PM',  '4:00 PM',  '4:30 PM',
  '5:00 PM',  '5:30 PM',  '6:00 PM',  '6:30 PM',
];

function SuccessScreen({ result, onManage, onBookAnother }) {
  const [copied, setCopied] = useState(false);
  const { appointment, pin } = result;

  const copyPin = () => {
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-green-400/10 border border-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-white text-xl font-serif font-semibold mb-1">Appointment Confirmed!</h2>
        <p className="text-dark-400 text-sm">We'll see you soon. Save your booking details below.</p>
      </div>

      {/* Booking summary */}
      <div className="card p-5 text-sm space-y-2">
        <p className="text-gold-400 font-semibold text-xs uppercase tracking-widest mb-3">Booking Details</p>
        <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          <span className="text-dark-400">Name</span>      <span className="text-white font-medium">{appointment.guestName}</span>
          <span className="text-dark-400">Mobile</span>    <span className="text-white font-medium">{appointment.guestPhone}</span>
          <span className="text-dark-400">Package</span>   <span className="text-white font-medium">{appointment.packageName}</span>
          <span className="text-dark-400">Date</span>      <span className="text-white font-medium">{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="text-dark-400">Time</span>      <span className="text-white font-medium">{appointment.timeSlot}</span>
          <span className="text-dark-400">Status</span>    <span className="text-gold-400 font-medium capitalize">{appointment.status}</span>
        </div>
      </div>

      {/* PIN display */}
      <div className="rounded-xl border border-gold-500/30 bg-gold-500/5 p-5">
        <p className="text-gold-400 font-semibold text-xs uppercase tracking-widest mb-3">Your Booking PIN</p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-3">
            {pin.split('').map((digit, i) => (
              <div key={i} className="w-12 h-14 flex items-center justify-center bg-dark-800 border border-dark-600 rounded-lg text-2xl font-bold text-white font-mono">
                {digit}
              </div>
            ))}
          </div>
          <button
            onClick={copyPin}
            className="flex items-center gap-1.5 text-sm text-dark-300 hover:text-gold-400 transition-colors px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-dark-400 text-xs mt-3 flex items-start gap-1.5">
          <span className="text-gold-500 font-bold mt-px">!</span>
          <span>Save this PIN — you'll need it with your mobile number to edit or cancel this appointment.</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onManage} className="btn-secondary flex-1 justify-center">
          <ClipboardList className="w-4 h-4" /> Manage this Booking
        </button>
        <button onClick={onBookAnother} className="btn-primary flex-1 justify-center">
          <CalendarCheck className="w-4 h-4" /> Book Another
        </button>
      </div>
    </div>
  );
}

export default function BookAppointment() {
  const [tab, setTab]             = useState('book');
  const [packages, setPackages]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [booked, setBooked]       = useState(null);
  const [takenSlots, setTakenSlots]   = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [searchParams]            = useSearchParams();
  const { user }                  = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { guestName: '', guestPhone: '', packageName: '', notes: '' },
  });

  const selectedDate    = watch('date');
  const selectedTime    = watch('timeSlot');
  const selectedPackage = watch('packageName');

  useEffect(() => { getPackages().then(setPackages).catch(() => {}); }, []);

  // Fetch booked slots whenever selected date changes
  useEffect(() => {
    if (!selectedDate) { setTakenSlots([]); return; }
    const dateStr = selectedDate.toISOString().split('T')[0];
    setSlotsLoading(true);
    // Clear the currently selected time if it becomes taken
    getBookedSlots(dateStr)
      .then((slots) => {
        setTakenSlots(slots);
        if (slots.includes(selectedTime)) {
          setValue('timeSlot', '', { shouldValidate: false });
        }
      })
      .catch(() => {})
      .finally(() => setSlotsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Pre-fill fields if logged in
  useEffect(() => {
    if (user) {
      setValue('guestName', user.name || '');
      if (user.phone) setValue('guestPhone', user.phone);
    }
  }, [user, setValue]);

  useEffect(() => {
    const pkg = searchParams.get('package');
    if (pkg) setValue('packageName', pkg);
  }, [searchParams, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const result = await createAppointment(data);
      setBooked(result); // { appointment, pin }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAnother = () => { setBooked(null); reset(); };
  const handleManage      = () => { setBooked(null); setTab('manage'); };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="section-subtitle mb-3 block">Schedule</span>
        <h1 className="section-title mb-4">Book an Appointment</h1>
        <p className="text-dark-400 text-sm max-w-md mx-auto">
          No account needed. You'll receive a 4-digit PIN to manage your booking.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-dark-800 border border-dark-700 rounded-xl p-1 w-fit mx-auto mb-8">
        {[
          { key: 'book',   icon: <CalendarCheck className="w-4 h-4" />, label: 'Book Appointment' },
          { key: 'manage', icon: <ClipboardList className="w-4 h-4" />, label: 'Manage Booking'   },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setBooked(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-gold-500 text-dark-900 font-semibold' : 'text-dark-400 hover:text-white'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Book tab */}
      {tab === 'book' && (
        <div className="card p-6 sm:p-8">
          {booked ? (
            <SuccessScreen result={booked} onManage={handleManage} onBookAnother={handleBookAnother} />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">
                    <User className="w-3.5 h-3.5 inline mr-1.5 text-gold-500" />
                    Your Name <span className="text-gold-500">*</span>
                  </label>
                  <input
                    {...register('guestName')}
                    placeholder="Full name"
                    className={`input-field ${errors.guestName ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {errors.guestName && <p className="error-text">{errors.guestName.message}</p>}
                </div>
                <div>
                  <label className="label">
                    <Phone className="w-3.5 h-3.5 inline mr-1.5 text-gold-500" />
                    Mobile Number <span className="text-gold-500">*</span>
                  </label>
                  <input
                    {...register('guestPhone')}
                    type="tel"
                    placeholder="+94 7X XXX XXXX"
                    className={`input-field ${errors.guestPhone ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {errors.guestPhone && <p className="error-text">{errors.guestPhone.message}</p>}
                </div>
              </div>

              {/* Package */}
              <div>
                <label className="label">Select Package <span className="text-gold-500">*</span></label>
                <select
                  {...register('packageName')}
                  className={`input-field ${errors.packageName ? 'border-red-500' : ''}`}
                >
                  <option value="">-- Choose a package --</option>
                  {packages.map((pkg) => (
                    <option key={pkg._id || pkg.name} value={pkg.name}>
                      {pkg.name} — LKR {pkg.price?.toLocaleString()} ({pkg.duration} min)
                    </option>
                  ))}
                </select>
                {errors.packageName && <p className="error-text">{errors.packageName.message}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="label">Select Date <span className="text-gold-500">*</span></label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(d) => setValue('date', d, { shouldValidate: true })}
                  minDate={new Date()}
                  filterDate={(d) => d.getDay() !== 0}
                  className={`input-field w-full ${errors.date ? 'border-red-500' : ''}`}
                  placeholderText="Click to select a date"
                  dateFormat="MMMM d, yyyy"
                  wrapperClassName="w-full"
                />
                {errors.date && <p className="error-text">{errors.date.message}</p>}
              </div>

              {/* Time Slot */}
              <div>
                <label className="label">
                  Select Time Slot <span className="text-gold-500">*</span>
                  {slotsLoading && (
                    <Loader2 className="w-3.5 h-3.5 inline ml-2 animate-spin text-dark-400" />
                  )}
                </label>
                {!selectedDate && (
                  <p className="text-dark-500 text-xs mb-2">Select a date first to see available slots.</p>
                )}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isTaken    = takenSlots.includes(slot);
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isTaken || !selectedDate || slotsLoading}
                        onClick={() => setValue('timeSlot', slot, { shouldValidate: true })}
                        title={isTaken ? 'Already booked' : undefined}
                        className={`text-xs py-2.5 rounded-lg border transition-all relative ${
                          isTaken
                            ? 'border-dark-700 bg-dark-800 text-dark-600 cursor-not-allowed line-through'
                            : isSelected
                            ? 'border-gold-500 bg-gold-500/10 text-gold-400 font-medium'
                            : !selectedDate || slotsLoading
                            ? 'border-dark-700 text-dark-600 cursor-not-allowed'
                            : 'border-dark-600 text-dark-400 hover:border-dark-500 hover:text-white'
                        }`}
                      >
                        {slot}
                        {isTaken && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.timeSlot && <p className="error-text">{errors.timeSlot.message}</p>}
                {selectedDate && !slotsLoading && takenSlots.length > 0 && (
                  <p className="text-dark-500 text-xs mt-2 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
                    {takenSlots.length} slot{takenSlots.length !== 1 ? 's' : ''} already booked for this day
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="label">
                  Special Requests <span className="text-dark-500 font-normal">(optional)</span>
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Any special requests or preferences..."
                  className="input-field resize-none"
                />
                {errors.notes && <p className="error-text">{errors.notes.message}</p>}
              </div>

              {/* Summary */}
              {(selectedPackage || selectedDate || selectedTime) && (
                <div className="bg-dark-700 rounded-lg p-4 border border-dark-600 space-y-2 text-sm">
                  <p className="text-gold-400 font-semibold mb-2">Booking Summary</p>
                  {selectedPackage && <p className="text-dark-200"><span className="text-dark-400">Package: </span>{selectedPackage}</p>}
                  {selectedDate    && <p className="text-dark-200"><span className="text-dark-400">Date: </span>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                  {selectedTime    && <p className="text-dark-200"><span className="text-dark-400">Time: </span>{selectedTime}</p>}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                    Booking…
                  </span>
                ) : (
                  <><CalendarCheck className="w-4 h-4" /> Confirm Appointment</>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Manage tab */}
      {tab === 'manage' && <ManageAppointment />}
    </div>
  );
}

