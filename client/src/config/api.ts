// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  PAYMENT: {
    CREATE_PAYMENT_INTENT: `${API_BASE_URL}/api/payment/create-payment-intent`,
  },
} as const;
