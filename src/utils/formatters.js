// ==========================================================================
// FORMATTERS & UTILITIES
// ==========================================================================

export const formatCurrency = (amount, currency = 'MXN') => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

export const formatGrams = (grams) => {
  if (!grams && grams !== 0) return '0 g';
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${Math.round(grams)} g`;
};

export const formatMinutesToHours = (minutes) => {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

export const generateFolio = (prefix = 'IDF') => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${randomNum}`;
};
