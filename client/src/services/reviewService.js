import api from './api';

export async function getReviews() {
  const { data } = await api.get('/reviews');
  return data;
}

export async function createReview(payload) {
  const { data } = await api.post('/reviews', payload);
  return data;
}
