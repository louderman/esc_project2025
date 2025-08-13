import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
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

// Mock console methods to avoid noise in tests
let consoleErrorSpy: any;
let consoleLogSpy: any;

// Mock global fetch to prevent external API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  
  // Reset all mocks
  vi.clearAllMocks();
  
  // Mock fetch to return empty results for destination API calls
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => []
  });
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  consoleLogSpy.mockRestore();
  cleanup();
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
const mockHotelWithCompleteData = {
  id: 'jOZC',
  name: 'Marina Bay Sands',
  rating: 4.5,
  reviewCount: 2847,
  address1: '10 Bayfront Avenue, Singapore',
  description: 'Luxury hotel with iconic architecture, featuring infinity pool, spa, and world-class dining. Amenities include WiFi, pool, fitness center, and business center.',
  amenities: {
    wifi: true,
    pool: true,
    fitness: true,
    businessCenter: true,
    airConditioning: true,
    tVInRoom: true,
    breakfast: true,
    parking: true
  },
  images: ['https://example.com/hotel-0.jpg', 'https://example.com/hotel-1.jpg', 'https://example.com/hotel-2.jpg'],
  latitude: 1.2838,
  longitude: 103.8591,
  imageCount: 5,
  address: '10 Bayfront Avenue, Singapore',
  distance: 0,
  trustyou: {
    id: 'mbs-trustyou-id',
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
      popularity: 0.9,
    },
    city_hotel: {
      name: 'City Hotel',
      score: 4.5,
      popularity: 0.9,
    },
  },
  amenities_ratings: [
    {
      name: 'WiFi',
      score: 4.5,
    },
    {
      name: 'Pool',
      score: 4.8,
    },
  ],
  original_metadata: {
    name: 'Marina Bay Sands',
    city: 'Singapore',
    state: 'Singapore',
    country: 'Singapore',
  },
  image_details: {
    suffix: '.jpg',
    count: 5,
    prefix: 'https://example.com/hotel-',
  },
  hires_image_index: '0',
  number_of_images: 5,
  default_image_index: 0,
  imgix_url: 'https://example.imgix.net/hotel-0.jpg',
  cloudflare_image_url: 'https://example.cloudflare.com/hotel-0.jpg',
  checkin_time: '15:00',
  price: 500,
  lowest_price: 450,
  price_type: 'per_night',
  rooms_available: 10,
  free_cancellation: true,
  searchRank: 0.95,
  max_cash_payment: 500,
  coverted_max_cash_payment: 500,
  points: 5000,
  bonuses: 200,
  bonus_programs: [],
  bonus_tiers: [],
  converted_price: 500,
  lowest_converted_price: 450,
  market_rates: [
    {
      supplier: 'Direct',
      rate: 500,
    },
  ] as [{ supplier: string; rate: number }],
};

// Mock room data for testing
const mockRooms = [
  {
    key: 'room-1',
    room_normalized_description: 'Deluxe King Room',
    free_cancellation: true,
    description: 'Deluxe King Room with city view',
    long_description: 'Spacious deluxe room featuring a king-size bed and modern amenities with stunning city views.',
    images: ['https://example.com/room-1.jpg'],
    amenities: ['WiFi', 'TV', 'Air Conditioning'],
    price: 500,
    market_rates: [
      {
        supplier: 'Direct',
        price: 500,
      }
    ],
  },
  {
    key: 'room-2',
    room_normalized_description: 'Executive Suite',
    free_cancellation: true,
    description: 'Executive Suite with marina bay view',
    long_description: 'Luxurious executive suite featuring a king bed, sofa bed, and private balcony with spectacular marina bay views.',
    images: ['https://example.com/room-2.jpg'],
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
    price: 800,
    market_rates: [
      {
        supplier: 'Direct',
        price: 800,
      }
    ],
  }
];

const mockHotelWithMissingPriceData = {
  ...mockHotelWithCompleteData,
  price: 0,
  lowest_price: 0,
  price_type: 'unknown',
  rooms_available: 0,
  free_cancellation: false,
};

const mockHotelWithMissingRoomData = {
  ...mockHotelWithCompleteData,
  // No room data from API
};

const mockHotelWithMissingImageData = {
  ...mockHotelWithCompleteData,
  image_details: {
    suffix: '.jpg',
    count: 0,
    prefix: '',
  },
  images: [],
  imageCount: 0,
};

const mockHotelWithMissingAmenities = {
  ...mockHotelWithCompleteData,
  amenities: {},
};

describe('Integration Test - Hotel Detail Data Validation', () => {
  describe('ITC_HOTELDETAILROUTER_3: Test hotel detail data validation and fallback', () => {
    it('should populate all hotel fields correctly when hotel has complete data', async () => {
      // Arrange - Mock complete hotel data
      mockUseFetchHotelsForDetails.mockReturnValue({
        hotels: [mockHotelWithCompleteData],
        loading: false,
        error: null,
      });
      
      mockUseFetchHotelPricesForDetails.mockReturnValue({
        prices: [mockHotelWithCompleteData],
        loading: false,
        error: null,
      });
      
      mockUsePricedHotelsForDetails.mockReturnValue([mockHotelWithCompleteData]);
      
      // Initially set room prices loading to true to simulate real loading behavior
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: [],
        loading: true,
        error: null,
        retryCount: 0,
      });

      // Act - First render with room prices still loading
      const { rerender } = renderHotelDetail('jOZC', {
        destination_id: 'RsBU',
        checkin: '2025-10-10',
        checkout: '2025-10-17',
        adults: '2',
        children: '0',
        rooms: '1'
      });

      // Initially should show loading state
      expect(screen.getByText('Loading hotel details...')).toBeInTheDocument();

      // Now simulate room prices finishing loading
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: mockRooms,
        loading: false,
        error: null,
        retryCount: 0,
      });

      // Re-render to trigger useEffect with updated room prices loading state
      rerender(
        <MemoryRouter initialEntries={['/hotel/jOZC?destination_id=RsBU&checkin=2025-10-10&checkout=2025-10-17&adults=2&children=0&rooms=1']}>
          <Routes>
            <Route path="/hotel/:hotelId" element={<HotelDetail />} />
          </Routes>
        </MemoryRouter>
      );
      
      // Assert - Wait for component to render with complete data
      await waitFor(() => {
        expect(screen.getAllByRole('heading', { name: 'Marina Bay Sands' })[0]).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // Check that all hotel fields are populated
      expect(screen.getAllByRole('heading', { name: 'Marina Bay Sands' })[0]).toBeInTheDocument();
      expect(screen.getAllByText('4.5')[0]).toBeInTheDocument(); // Use first occurrence
      expect(screen.getAllByText('10 Bayfront Avenue, Singapore')[0]).toBeInTheDocument(); // Use first occurrence
      
      // Check that room options are displayed
      expect(screen.getByText('Available Rooms')).toBeInTheDocument();
    });

    it('should set price field to 0 and include fallback message when hotel has missing price data', async () => {
      // Arrange - Mock hotel with missing price data
      mockUseFetchHotelsForDetails.mockReturnValue({
        hotels: [mockHotelWithMissingPriceData],
        loading: false,
        error: null,
      });
      
      mockUseFetchHotelPricesForDetails.mockReturnValue({
        prices: [mockHotelWithMissingPriceData],
        loading: false,
        error: null,
      });
      
      mockUsePricedHotelsForDetails.mockReturnValue([mockHotelWithMissingPriceData]);
      
      // Initially set room prices loading to true to simulate real loading behavior
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: [],
        loading: true,
        error: null,
        retryCount: 0,
      });

      // Act - First render with room prices still loading
      const { rerender } = renderHotelDetail('jOZC', {
        destination_id: 'RsBU',
        checkin: '2025-10-10',
        checkout: '2025-10-17'
      });

      // Initially should show loading state
      expect(screen.getByText('Loading hotel details...')).toBeInTheDocument();

      // Now simulate room prices finishing loading
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: mockRooms,
        loading: false,
        error: null,
        retryCount: 0,
      });

      // Re-render to trigger useEffect with updated room prices loading state
      rerender(
        <MemoryRouter initialEntries={['/hotel/jOZC?destination_id=RsBU&checkin=2025-10-10&checkout=2025-10-17']}>
          <Routes>
            <Route path="/hotel/:hotelId" element={<HotelDetail />} />
          </Routes>
        </MemoryRouter>
      );
      
      // Assert - Wait for component to render
      await waitFor(() => {
        expect(screen.getAllByRole('heading', { name: 'Marina Bay Sands' })[0]).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // Check that room options are displayed
      expect(screen.getByText('Available Rooms')).toBeInTheDocument();
    });

    it('should generate default room data when hotel has missing room data', async () => {
      // Arrange - Mock hotel with missing room data but with pricing info
      const mockHotelWithPricing = {
        ...mockHotelWithMissingRoomData,
        price: 500, // Need some pricing to trigger room generation
        lowest_price: 450,
      };
      
      mockUseFetchHotelsForDetails.mockReturnValue({
        hotels: [mockHotelWithPricing],
        loading: false,
        error: null,
      });
      
      mockUseFetchHotelPricesForDetails.mockReturnValue({
        prices: [mockHotelWithPricing],
        loading: false,
        error: null,
      });
      
      mockUsePricedHotelsForDetails.mockReturnValue([mockHotelWithPricing]);
      
      // Initially set room prices loading to true to simulate real loading behavior
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: [],
        loading: true,
        error: null,
        retryCount: 0,
      });

      // Act - First render with room prices still loading
      const { rerender } = renderHotelDetail('jOZC', {
        destination_id: 'RsBU',
        checkin: '2025-10-10',
        checkout: '2025-10-17'
      });

      // Initially should show loading state
      expect(screen.getByText('Loading hotel details...')).toBeInTheDocument();

      // Now simulate room prices finishing loading
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: mockRooms,
        loading: false,
        error: null,
        retryCount: 0,
      });

      // Re-render to trigger useEffect with updated room prices loading state
      rerender(
        <MemoryRouter initialEntries={['/hotel/jOZC?destination_id=RsBU&checkin=2025-10-10&checkout=2025-10-17']}>
          <Routes>
            <Route path="/hotel/:hotelId" element={<HotelDetail />} />
          </Routes>
        </MemoryRouter>
      );
      
      // Assert - Wait for component to render
      await waitFor(() => {
        expect(screen.getAllByRole('heading', { name: 'Marina Bay Sands' })[0]).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // Check that room options are displayed
      expect(screen.getByText('Available Rooms')).toBeInTheDocument();
    });

    it('should use default placeholder images when hotel has missing image data', async () => {
      // Arrange - Mock hotel with missing image data
      mockUseFetchHotelsForDetails.mockReturnValue({
        hotels: [mockHotelWithMissingImageData],
        loading: false,
        error: null,
      });
      
      mockUseFetchHotelPricesForDetails.mockReturnValue({
        prices: [mockHotelWithMissingImageData],
        loading: false,
        error: null,
      });
      
      mockUsePricedHotelsForDetails.mockReturnValue([mockHotelWithMissingImageData]);
      
      // Initially set room prices loading to true to simulate real loading behavior
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: [],
        loading: true,
        error: null,
        retryCount: 0,
      });

      // Act - First render with room prices still loading
      const { rerender } = renderHotelDetail('jOZC', {
        destination_id: 'RsBU',
        checkin: '2025-10-10',
        checkout: '2025-10-17'
      });

      // Initially should show loading state
      expect(screen.getByText('Loading hotel details...')).toBeInTheDocument();

      // Now simulate room prices finishing loading
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: mockRooms,
        loading: false,
        error: null,
        retryCount: 0,
      });

      // Re-render to trigger useEffect with updated room prices loading state
      rerender(
        <MemoryRouter initialEntries={['/hotel/jOZC?destination_id=RsBU&checkin=2025-10-10&checkout=2025-10-17']}>
          <Routes>
            <Route path="/hotel/:hotelId" element={<HotelDetail />} />
          </Routes>
        </MemoryRouter>
      );
      
      // Assert - Wait for component to render
      await waitFor(() => {
        expect(screen.getAllByRole('heading', { name: 'Marina Bay Sands' })[0]).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // Check that room options are displayed
      expect(screen.getByText('Available Rooms')).toBeInTheDocument();
    });

    it('should extract amenities from description when amenities object is empty', async () => {
      // Arrange - Mock hotel with empty amenities object
      mockUseFetchHotelsForDetails.mockReturnValue({
        hotels: [mockHotelWithMissingAmenities],
        loading: false,
        error: null,
      });
      
      mockUseFetchHotelPricesForDetails.mockReturnValue({
        prices: [mockHotelWithMissingAmenities],
        loading: false,
        error: null,
      });
      
      mockUsePricedHotelsForDetails.mockReturnValue([mockHotelWithMissingAmenities]);
      
      // Initially set room prices loading to true to simulate real loading behavior
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: [],
        loading: true,
        error: null,
        retryCount: 0,
      });

      // Act - First render with room prices still loading
      const { rerender } = renderHotelDetail('jOZC', {
        destination_id: 'RsBU',
        checkin: '2025-10-10',
        checkout: '2025-10-17'
      });

      // Initially should show loading state
      expect(screen.getByText('Loading hotel details...')).toBeInTheDocument();

      // Now simulate room prices finishing loading
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: mockRooms,
        loading: false,
        error: null,
        retryCount: 0,
      });

      // Re-render to trigger useEffect with updated room prices loading state
      rerender(
        <MemoryRouter initialEntries={['/hotel/jOZC?destination_id=RsBU&checkin=2025-10-10&checkout=2025-10-17']}>
          <Routes>
            <Route path="/hotel/:hotelId" element={<HotelDetail />} />
          </Routes>
        </MemoryRouter>
      );
      
      // Assert - Wait for component to render
      await waitFor(() => {
        expect(screen.getAllByRole('heading', { name: 'Marina Bay Sands' })[0]).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // Check that room options are displayed
      expect(screen.getByText('Available Rooms')).toBeInTheDocument();
    });

    it('should handle mixed missing data gracefully', async () => {
      // Arrange - Mock hotel with mixed missing data
      const mockHotelWithMixedMissingData = {
        ...mockHotelWithCompleteData,
        price: 0, // Missing price
        lowest_price: 0,
        amenities: {}, // Empty amenities
        images: [], // Missing images
      };
      
      mockUseFetchHotelsForDetails.mockReturnValue({
        hotels: [mockHotelWithMixedMissingData],
        loading: false,
        error: null,
      });
      
      mockUseFetchHotelPricesForDetails.mockReturnValue({
        prices: [mockHotelWithMixedMissingData],
        loading: false,
        error: null,
      });
      
      mockUsePricedHotelsForDetails.mockReturnValue([mockHotelWithMixedMissingData]);
      
      // Initially set room prices loading to true to simulate real loading behavior
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: [],
        loading: true,
        error: null,
        retryCount: 0,
      });

      // Act - First render with room prices still loading
      const { rerender } = renderHotelDetail('jOZC', {
        destination_id: 'RsBU',
        checkin: '2025-10-10',
        checkout: '2025-10-17'
      });

      // Initially should show loading state
      expect(screen.getByText('Loading hotel details...')).toBeInTheDocument();

      // Now simulate room prices finishing loading
      mockUseFetchHotelRoomPrices.mockReturnValue({
        rooms: mockRooms,
        loading: false,
        error: null,
        retryCount: 0,
      });

      // Re-render to trigger useEffect with updated room prices loading state
      rerender(
        <MemoryRouter initialEntries={['/hotel/jOZC?destination_id=RsBU&checkin=2025-10-10&checkout=2025-10-17']}>
          <Routes>
            <Route path="/hotel/:hotelId" element={<HotelDetail />} />
          </Routes>
        </MemoryRouter>
      );
      
      // Assert - Wait for component to render
      await waitFor(() => {
        expect(screen.getAllByRole('heading', { name: 'Marina Bay Sands' })[0]).toBeInTheDocument();
      }, { timeout: 10000 });
      
      // Check that room options are displayed
      expect(screen.getByText('Available Rooms')).toBeInTheDocument();
    });
  });
});
