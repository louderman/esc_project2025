// Hotel API service for backend integration
const API_BASE_URL = 'http://localhost:5001/api';

// Type definitions for API responses
export interface HotelDetails {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  rating: number;
  categories: string[];
  description: string;
  amenities: Record<string, boolean>;
  image_details: {
    suffix: string;
    count: number;
    prefix: string;
  };
}

export interface RoomPrice {
  key: string;
  room_normalized_description: string;
  free_cancellation: boolean;
  description: string;
  long_description: string;
  images: string[];
  amenities: string[];
  price: number;
  market_rates: Array<{
    supplier: string;
    price: number;
  }>;
}

export interface HotelPriceResponse {
  searchCompleted: null;
  completed: boolean;
  status: null;
  currency: string;
  hotels: Array<{
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
    market_rates: Array<{
      supplier: string;
      rate: number;
    }>;
  }>;
}

export interface SearchParams {
  destinationId: string;
  checkin: string;
  checkout: string;
  guests: string; // e.g., "2" or "2|2" for multiple rooms
  lang?: string;
  currency?: string;
  countryCode?: string;
  partnerId?: string;
}

class HotelApiService {
  private buildQueryString(params: Record<string, string | undefined>): string {
    const filteredParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`)
      .join('&');
    return filteredParams ? `?${filteredParams}` : '';
  }

  async getHotelDetails(hotelId: string): Promise<HotelDetails> {
    // First get all hotels for the destination to find this specific hotel
    const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels/${hotelId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch hotel details: ${response.statusText}`);
    }
    return response.json();
  }

  async getHotelPrices(hotelId: string, searchParams: SearchParams): Promise<{ rooms: RoomPrice[] }> {
    const queryParams = {
      destination_id: searchParams.destinationId,
      checkin: searchParams.checkin,
      checkout: searchParams.checkout,
      guests: searchParams.guests,
      lang: searchParams.lang || 'en_US',
      currency: searchParams.currency || 'SGD',
      country_code: searchParams.countryCode || 'SG',
      partner_id: searchParams.partnerId || '1'
    };

    const queryString = this.buildQueryString(queryParams);
    const response = await fetch(`https://hotelapi.loyalty.dev/api/hotels/${hotelId}/prices${queryString}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch hotel prices: ${response.statusText}`);
    }
    return response.json();
  }

  async getDestinationPrices(searchParams: SearchParams): Promise<HotelPriceResponse> {
    const queryParams = {
      dest_id: searchParams.destinationId,
      checkin: searchParams.checkin,
      checkout: searchParams.checkout,
      guests: searchParams.guests
    };

    const queryString = this.buildQueryString(queryParams);
    const response = await fetch(`${API_BASE_URL}/hotel-price/query${queryString}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch destination prices: ${response.statusText}`);
    }
    return response.json();
  }

  async getHotelsForDestination(destinationId: string): Promise<HotelDetails[]> {
    const response = await fetch(`${API_BASE_URL}/hotel/query?dest_id=${destinationId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch hotels for destination: ${response.statusText}`);
    }
    return response.json();
  }

  generateImageUrl(imageDetails: HotelDetails['image_details'], index: number = 0): string {
    if (!imageDetails || !imageDetails.prefix || !imageDetails.suffix) {
      return 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop';
    }
    
    const imageIndex = Math.min(index, imageDetails.count - 1);
    return `${imageDetails.prefix}${imageIndex}${imageDetails.suffix}`;
  }

  generateMultipleImageUrls(imageDetails: HotelDetails['image_details'], count: number = 3): string[] {
    const urls: string[] = [];
    const maxImages = Math.min(count, imageDetails?.count || 3);
    
    for (let i = 0; i < maxImages; i++) {
      urls.push(this.generateImageUrl(imageDetails, i));
    }
    
    // If we don't have enough images, fill with fallback URLs
    while (urls.length < count) {
      const fallbackUrls = [
        'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop'
      ];
      urls.push(fallbackUrls[urls.length % fallbackUrls.length]);
    }
    
    return urls;
  }
}

export const hotelApiService = new HotelApiService();