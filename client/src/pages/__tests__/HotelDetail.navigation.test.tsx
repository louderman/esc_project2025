import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import HotelDetail from '../HotelDetail';

// Mock the hooks used by HotelDetail
vi.mock('../../hooks/hotel_details/useFetchHotelsForDetails', () => ({
  useFetchHotelsForDetails: vi.fn(),
}));

vi.mock('../../hooks/hotel_details/useFetchHotelPricesForDetails', () => ({
  useFetchHotelPricesForDetails: vi.fn(),
}));

vi.mock('../../hooks/hotel_details/usePricedHotelsForDetails', () => ({
  usePricedHotelsForDetails: vi.fn(),
}));

vi.mock('../../hooks/hotel_details/useFetchHotelRoomPrices', () => ({
  useFetchHotelRoomPrices: vi.fn(),
}));

// Import the mocked hooks
import { useFetchHotelsForDetails } from '../../hooks/hotel_details/useFetchHotelsForDetails';
import { useFetchHotelPricesForDetails } from '../../hooks/hotel_details/useFetchHotelPricesForDetails';
import { usePricedHotelsForDetails } from '../../hooks/hotel_details/usePricedHotelsForDetails';
import { useFetchHotelRoomPrices } from '../../hooks/hotel_details/useFetchHotelRoomPrices';

// Cast the mocked hooks to vi.MockedFunction
const mockUseFetchHotelsForDetails = vi.mocked(useFetchHotelsForDetails);
const mockUseFetchHotelPricesForDetails = vi.mocked(useFetchHotelPricesForDetails);
const mockUsePricedHotelsForDetails = vi.mocked(usePricedHotelsForDetails);
const mockUseFetchHotelRoomPrices = vi.mocked(useFetchHotelRoomPrices);

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console methods to avoid noise in tests
let consoleErrorSpy: MockInstance;
let consoleLogSpy: MockInstance;

// Mock setTimeout to speed up tests (remove the 3-second delay)
vi.useFakeTimers();

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  
  // Reset all mocks
  vi.clearAllMocks();
  
  // Set up default mock implementations
  mockUseFetchHotelsForDetails.mockReturnValue({
    hotels: [],
    loading: false,
    error: null,
  });
  
  mockUseFetchHotelPricesForDetails.mockReturnValue({
    prices: [],
    loading: false,
    error: null,
  });
  
  mockUsePricedHotelsForDetails.mockReturnValue([]);
  
  mockUseFetchHotelRoomPrices.mockReturnValue({
    rooms: [],
    loading: false,
    error: null,
  });
  
  // Reset fetch mock for each test
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ([]),
    status: 200,
  } as Response);
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  consoleLogSpy.mockRestore();
  cleanup();
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

// Helper function to render HotelDetail with specific route and search params
const renderHotelDetail = (
  hotelId: string,
  searchParams: Record<string, string> = {}
) => {
  const searchParamsString = new URLSearchParams(searchParams).toString();
  const initialEntries = [
    `/hotel/${hotelId}${searchParamsString ? `?${searchParamsString}` : ''}`
  ];

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/hotel/:hotelId" element={<HotelDetail />} />
      </Routes>
    </MemoryRouter>
  );
};

// Mock hotel data for testing
const mockHotel = {
  id: 'jOZC',
  name: 'Test Hotel',
  rating: 4.5,
  reviewCount: 100,
  address1: '123 Test Street',
  description: 'A test hotel for testing purposes',
  amenities: {
    wifi: true,
    pool: true,
    airConditioning: true,
    tVInRoom: true,
  },
  images: ['test-image-1.jpg', 'test-image-2.jpg'],
  latitude: 1.3521,
  longitude: 103.8198,
  imageCount: 2,
  address: '123 Test Street',
  distance: 0,
  trustyou: {
    id: 'test-trustyou-id',
    score: {
      overall: 4.5,
      kaligo_overall: 4.5,
      solo: 4.5,
      couple: 4.5,
      family: 4.5,
      business: 4.5,
    },
  },
  categories: {
    overall: {
      name: 'Hotel',
      score: 4.5,
      popularity: 0.8,
    },
    city_hotel: {
      name: 'City Hotel',
      score: 4.5,
      popularity: 0.8,
    },
  },
  amenities_ratings: [
    {
      name: 'WiFi',
      score: 4.5,
    },
    {
      name: 'Pool',
      score: 4,
    },
  ],
  original_metadata: {
    name: 'Test Hotel',
    city: 'Test City',
    state: 'Test State',
    country: 'Test Country',
  },
  image_details: {
    suffix: '.jpg',
    count: 2,
    prefix: 'test-image-',
  },
  hires_image_index: '0',
  number_of_images: 2,
  default_image_index: 0,
  imgix_url: 'https://test.imgix.net/test-image-0.jpg',
  cloudflare_image_url: 'https://test.cloudflare.com/test-image-0.jpg',
  checkin_time: '15:00',
  price: 200,
  lowest_price: 180,
  price_type: 'multi',
  rooms_available: 5,
  free_cancellation: true,
  searchRank: 0.95,
  max_cash_payment: 200,
  coverted_max_cash_payment: 200,
  points: 2000,
  bonuses: 100,
  bonus_programs: [],
  bonus_tiers: [],
  converted_price: 200,
  lowest_converted_price: 180,
  market_rates: [
    {
      supplier: 'test-supplier',
      rate: 200,
    },
  ] as [{ supplier: string; rate: number }],
};

const mockPricedHotel = {
  ...mockHotel,
  id: 'jOZC',
  searchRank: 0.95,
  price_type: 'multi',
  free_cancellation: true,
  rooms_available: 5,
  max_cash_payment: 200,
  coverted_max_cash_payment: 200,
  points: 2000,
  bonuses: 100,
  bonus_programs: [],
  bonus_tiers: [],
  converted_price: 200,
  lowest_converted_price: 180,
  market_rates: [
    {
      supplier: 'test-supplier',
      rate: 200,
    },
  ] as [{ supplier: string; rate: number }],
};

describe('Unit Test - Hotel Detail Page Navigation', () => {
  describe('TC_HOTELDETAIL_1: User navigates to the hotel detail page', () => {
    it('should process URL parameters correctly when hotel ID is provided', async () => {
      // Arrange
      const validSearchParams = {
        destination_id: 'RsBU',
        checkin: '2025-10-10',
        checkout: '2025-10-17',
        adults: '2',
        children: '0',
        rooms: '1',
        currency: 'SGD',
        country_code: 'SG'
      };
      
      // Act
      renderHotelDetail('jOZC', validSearchParams);
      
      // Assert - Check that URL parameters are processed correctly
      // We'll wait for the component to process the parameters and log them
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('destination_id: RsBU')
        );
      });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('checkin: 2025-10-10')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('checkout: 2025-10-17')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('adults: 2')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('children: 0')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('rooms: 1')
      );
    });

    it('should use default values when URL parameters are missing', async () => {
      // Arrange - Only hotel ID, no search parameters
      // Act
      renderHotelDetail('jOZC');
      
      // Assert - Check that default values are used
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('destination_id: WD0M') // Default fallback
        );
      });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('checkin: 2025-08-12') // Default fallback
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('checkout: 2025-08-30') // Default fallback
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('adults: 2') // Default fallback
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('children: 0') // Default fallback
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('rooms: 1') // Default fallback
      );
    });

    it('should handle invalid URL parameters with fallback to default values', async () => {
      // Arrange - Invalid parameters
      const invalidSearchParams = {
        destination_id: '',
        checkin: 'invalid-date',
        checkout: 'another-invalid-date',
        adults: 'invalid-number',
        children: 'invalid-number',
        rooms: 'invalid-number'
      };
      
      // Act
      renderHotelDetail('jOZC', invalidSearchParams);
      
      // Assert - Check that fallback values are used for invalid parameters
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('destination_id: WD0M') // Fallback for empty
        );
      });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('checkin: 2025-08-12') // Fallback for invalid date
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('checkout: 2025-08-30') // Fallback for invalid date
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('adults: 2') // Fallback for invalid number
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('children: 0') // Fallback for invalid number
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('rooms: 1') // Fallback for invalid number
      );
    });

    it('should handle invalid hotel ID in URL with error message', async () => {
      // Arrange - Invalid hotel ID
      const invalidHotelId = 'INVALID_HOTEL_ID';
      
      mockUseFetchHotelsForDetails.mockReturnValue({
        hotels: [],
        loading: false,
        error: null,
      });
      
      mockUseFetchHotelPricesForDetails.mockReturnValue({
        prices: [],
        loading: false,
        error: null,
      });
      
      mockUsePricedHotelsForDetails.mockReturnValue([]);
      
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: [],
        loading: false,
        error: null,
      });
      
      // Act
      renderHotelDetail(invalidHotelId);
      
      // Assert - Check that error is handled gracefully
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('Hotel with ID INVALID_HOTEL_ID not found')
        );
      });
    });

    it('should handle hotel ID from both path parameter and query parameter', async () => {
      // Arrange - Test hotel ID in query parameter
      const searchParamsWithQueryHotelId = {
        hotelId: 'jOZC', // Query parameter hotel ID
        destination_id: 'RsBU',
        checkin: '2025-10-10',
        checkout: '2025-10-17',
        adults: '2',
        children: '0',
        rooms: '1'
      };
      
      // Act - Use different path parameter but same query parameter
      renderHotelDetail('different-id', searchParamsWithQueryHotelId);
      
      // Assert - Check that the query parameter hotelId is used
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('Query hotelId: jOZC')
        );
      });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Final hotelId: jOZC')
      );
    });

    it('should handle quoted URL parameters correctly', async () => {
      // Arrange - Parameters with quotes (common issue)
      const quotedSearchParams = {
        destination_id: '"RsBU"',
        checkin: '"2025-10-10"',
        checkout: '"2025-10-17"',
        adults: '"2"',
        children: '"0"',
        rooms: '"1"'
      };
      
      // Act
      renderHotelDetail('jOZC', quotedSearchParams);
      
      // Assert - Check that quotes are stripped from parameters
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('destination_id: RsBU') // Quotes removed
        );
      });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('checkin: 2025-10-10') // Quotes removed
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('checkout: 2025-10-17') // Quotes removed
      );
    });

    it('should handle missing hotel ID gracefully', async () => {
      // Arrange - No hotel ID provided
      mockUseFetchHotelsForDetails.mockReturnValue({
        hotels: [],
        loading: false,
        error: null,
      });
      
      mockUseFetchHotelPricesForDetails.mockReturnValue({
        prices: [],
        loading: false,
        error: null,
      });
      
      mockUsePricedHotelsForDetails.mockReturnValue([]);
      
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: [],
        loading: false,
        error: null,
      });
      
      // Act
      renderHotelDetail('', { destination_id: 'RsBU' });
      
      // Assert - Check that missing hotel ID is handled gracefully
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('No hotel ID provided')
        );
      });
    });

    it('should handle loading states correctly', async () => {
      // Arrange - Set loading state
      mockUseFetchHotelsForDetails.mockReturnValue({
        hotels: [],
        loading: true,
        error: null,
      });
      
      // Act
      renderHotelDetail('jOZC');
      
      // Assert - Check that loading state is handled
      expect(screen.getByText('Loading hotel details...')).toBeInTheDocument();
    });

    it('should handle empty hotel results gracefully', async () => {
      // Arrange - No hotels found
      mockUseFetchHotelsForDetails.mockReturnValue({
        hotels: [],
        loading: false,
        error: null,
      });
      
      mockUseFetchHotelPricesForDetails.mockReturnValue({
        prices: [],
        loading: false,
        error: null,
      });
      
      mockUsePricedHotelsForDetails.mockReturnValue([]);
      
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: [],
        loading: false,
        error: null,
      });
      
      // Act
      renderHotelDetail('jOZC');
      
      // Assert - Check that empty results are handled gracefully
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('Hotel with ID jOZC not found')
        );
      });
    });
  });
});
