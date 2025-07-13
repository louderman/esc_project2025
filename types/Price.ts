// types/Price.ts

export type MarketRate = {
  supplier: string;
  rate: number;
};

export type Price = {
  id: string;
  searchRank: number;
  price_type: string;
  free_cancellation: boolean;
  rooms_available: number;
  max_cash_payment: number;
  converted_max_cash_payment: number;
  points: number;
  bonuses: number;
  bonus_programs: Array<{
    name: string;
    id: string;
    // Add more specific fields if available
  }>;
  bonus_tiers: Array<{
    level: number;
    requirements: string;
    // Add more specific fields if available
  }>;
  lowest_price: number;
  price: number;
  converted_price: number;
  lowest_converted_price: number;
  market_rates: MarketRate[];
  // Add any additional fields from your API response
};

export type PriceResponse = {
  searchCompleted: boolean | null;
  completed: boolean;
  status: string | null;
  currency: string;
  hotels: Price[];
};

// Optional: Type guard for runtime validation
export function isPriceResponse(data: unknown): data is PriceResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'hotels' in data &&
    Array.isArray((data as PriceResponse).hotels)
  );
}

// Helper type for API responses
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  error?: string;
};