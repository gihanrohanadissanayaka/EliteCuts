export const CURRENCY = 'LKR';

export function formatPrice(amount) {
  return `LKR ${Number(amount).toLocaleString('en-LK')}`;
}
