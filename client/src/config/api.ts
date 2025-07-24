// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  PAYMENT: {
    CREATE_PAYMENT_INTENT: `${API_BASE_URL}/api/payment/create-payment-intent`,
    GET_BOOKING: (bookingId: string) => `${API_BASE_URL}/api/payment/booking/${bookingId}`,
    GET_ALL_BOOKINGS: `${API_BASE_URL}/api/payment/bookings`,
  },
} as const;
