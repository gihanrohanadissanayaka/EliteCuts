import api from './api';

export async function getPackages() {
  const { data } = await api.get('/packages');
  return data;
}

export async function getPackageById(id) {
  const { data } = await api.get(`/packages/${id}`);
  return data;
}

// Admin functions
export async function getAllPackagesAdmin() {
  const { data } = await api.get('/packages/admin/all');
  return data;
}

export async function createPackage(payload) {
  const { data } = await api.post('/packages', payload);
  return data;
}

export async function updatePackage(id, payload) {
  const { data } = await api.put(`/packages/${id}`, payload);
  return data;
}

export async function deletePackage(id) {
  const { data } = await api.delete(`/packages/${id}`);
  return data;
}
