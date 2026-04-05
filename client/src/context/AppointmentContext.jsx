import { createContext, useState, useCallback } from 'react';
import { getMyAppointments, createAppointment, cancelAppointment } from '@/services/appointmentService';

export const AppointmentContext = createContext(null);

export function AppointmentProvider({ children }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyAppointments();
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const book = useCallback(async (formData) => {
    const newAppointment = await createAppointment(formData);
    setAppointments((prev) => [newAppointment, ...prev]);
    return newAppointment;
  }, []);

  const cancel = useCallback(async (id) => {
    await cancelAppointment(id);
    setAppointments((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status: 'cancelled' } : a))
    );
  }, []);

  return (
    <AppointmentContext.Provider value={{ appointments, loading, fetchAppointments, book, cancel }}>
      {children}
    </AppointmentContext.Provider>
  );
}
