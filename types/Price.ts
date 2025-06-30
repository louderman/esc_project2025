export type PriceResponse = {
  searchCompleted: null;
  completed: boolean;
  status: null;
  currency: string;
  hotels: Price[];
};

export type Price = {
  id: string;
  searchRank: number;
  price_type: string;
  free_cancellation: boolean;
  rooms_available: number;
  max_cash_payment: number;
  coverted_max_cash_payment: number;
  points: number;
  bonuses: number;
  bonus_programs: unknown[];
  bonus_tiers: unknown[];
  lowest_price: number;
  price: number;
  converted_price: number;
  lowest_converted_price: number;
  market_rates: [
    {
      supplier: string;
      rate: number;
    }
  ];
};
