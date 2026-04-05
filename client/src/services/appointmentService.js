import api from './api';

export async function getMyAppointments() {
  const { data } = await api.get('/appointments/my');
  return data;
}

// Returns array of booked timeSlot strings for the given date (YYYY-MM-DD)
export async function getBookedSlots(date) {
  const { data } = await api.get('/appointments/booked-slots', { params: { date } });
  return data;
}

// Returns { appointment, pin }
export async function createAppointment(payload) {
  const { data } = await api.post('/appointments', payload);
  return data;
}

// Returns appointment (without pinHash)
export async function lookupAppointment(phone, pin) {
  const { data } = await api.post('/appointments/lookup', { phone, pin });
  return data;
}

export async function updateGuestAppointment(id, payload) {
  const { data } = await api.patch(`/appointments/${id}/guest-update`, payload);
  return data;
}

export async function cancelGuestAppointment(id, pin) {
  const { data } = await api.patch(`/appointments/${id}/guest-cancel`, { pin });
  return data;
}

export async function cancelAppointment(id) {
  const { data } = await api.patch(`/appointments/${id}/cancel`);
  return data;
}

export async function getAllAppointments(params = {}) {
  const { data } = await api.get('/appointments', { params });
  return data;
}

export async function updateAppointmentStatus(id, status) {
  const { data } = await api.patch(`/appointments/${id}/status`, { status });
  return data;
}

