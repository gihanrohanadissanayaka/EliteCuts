import api from './api';

export async function getEvents() {
  const { data } = await api.get('/events');
  return data;
}

export async function getEventById(id) {
  const { data } = await api.get(`/events/${id}`);
  return data;
}

export async function getAllEventsAdmin() {
  const { data } = await api.get('/events/admin/all');
  return data;
}

export async function createEvent(payload) {
  const { data } = await api.post('/events', payload);
  return data;
}

export async function updateEvent(id, payload) {
  const { data } = await api.put(`/events/${id}`, payload);
  return data;
}

export async function deleteEvent(id) {
  const { data } = await api.delete(`/events/${id}`);
  return data;
}
