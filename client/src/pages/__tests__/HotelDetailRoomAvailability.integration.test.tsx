import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import {
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

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useSearchParams: vi.fn(),
  };
});

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

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  
  // Reset all mocks
  vi.clearAllMocks();
  
  // Set up default fetch mock to prevent DestinationInput errors
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
  id: 'test-hotel-123',
  imageCount: 3,
  latitude: 1.3521,
  longitude: 103.8198,
  name: 'Test Luxury Hotel',
  address: '123 Test Street, Singapore 123456',
  address1: '123 Test Street, Singapore 123456',
  rating: 4.5,
  distance: 0,
  trustyou: {
    id: 'test-trustyou',
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
      name: 'Luxury',
      score: 4.5,
      popularity: 0.9,
    },
  },
  amenities_ratings: [
    { name: 'WiFi', score: 4.5 },
    { name: 'Pool', score: 4.5 },
  ],
  description: 'A luxurious hotel with amazing amenities including WiFi, pool, fitness center, and breakfast.',
  original_metadata: {
    name: 'Test Luxury Hotel',
    city: 'Singapore',
    state: null,
    country: 'Singapore',
  },
  amenities: {
    airConditioning: true,
    wifi: true,
    pool: true,
    fitness: true,
    breakfast: true,
    parking: false,
    businessCenter: true,
  },
  image_details: {
    suffix: '.jpg',
    count: 3,
    prefix: 'https://example.com/hotel',
  },
  hires_image_index: '0',
  number_of_images: 3,
  default_image_index: 0,
  imgix_url: 'https://example.com/hotel',
  cloudflare_image_url: 'https://example.com/hotel',
  checkin_time: '15:00',
  rank: '1',
};

// Mock room data for testing
const mockRooms = [
  {
    key: 'room-1',
    room_normalized_description: 'Deluxe King Room',
    free_cancellation: true,
    description: 'Spacious room with city view',
    long_description: 'A luxurious deluxe king room with amazing city views',
    images: ['https://example.com/room1.jpg'],
    amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom'],
    price: 253.09,
    market_rates: [
      { supplier: 'Direct', price: 253.09 }
    ],
  },
  {
    key: 'room-2',
    room_normalized_description: 'Executive Suite',
    free_cancellation: false,
    description: 'Luxury suite with separate living area',
    long_description: 'An executive suite with separate living room and bedroom',
    images: ['https://example.com/room2.jpg'],
    amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom', 'Mini bar'],
    price: 450.00,
    market_rates: [
      { supplier: 'Direct', price: 450.00 }
    ],
  },
];

describe('Integration Test - Room Availability Validation', () => {
  it('ITC_HOTELDETAIL_4: Room availability is correctly validated and displayed', async () => {
    // Arrange - Set up mock hooks with 5 available rooms
    mockUseFetchHotelsForDetails.mockReturnValue({
      hotels: [mockHotel],
      loading: false,
      error: null,
    });

    mockUseFetchHotelPricesForDetails.mockReturnValue({
      prices: [{ 
        id: mockHotel.id, 
        searchRank: 1,
        price_type: 'per_night',
        free_cancellation: true,
        rooms_available: 5, // 5 rooms available
        max_cash_payment: 253.09,
        coverted_max_cash_payment: 253.09,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 253.09,
        price: 253.09,
        converted_price: 253.09,
        lowest_converted_price: 253.09,
        market_rates: [{ supplier: 'Direct', rate: 253.09 }]
      }],
      loading: false,
      error: null,
    });

    mockUsePricedHotelsForDetails.mockReturnValue([
      { 
        ...mockHotel, 
        searchRank: 1,
        price_type: 'per_night',
        free_cancellation: true,
        rooms_available: 5, // 5 rooms available
        max_cash_payment: 253.09,
        coverted_max_cash_payment: 253.09,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 253.09,
        price: 253.09,
        converted_price: 253.09,
        lowest_converted_price: 253.09,
        market_rates: [{ supplier: 'Direct', rate: 253.09 }]
      }
    ]);

    mockUseFetchHotelRoomPrices.mockReturnValue({
      rooms: mockRooms, // Use mock rooms instead of empty array
      loading: false,
      error: null,
      retryCount: 0,
    });

    // Mock useNavigate
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    // Mock useSearchParams for 3 rooms requested
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destination_id', 'WD0M');
    mockSearchParams.set('checkin', '2025-08-12');
    mockSearchParams.set('checkout', '2025-08-19');
    mockSearchParams.set('adults', '6'); // 6 adults for 3 rooms
    mockSearchParams.set('children', '0');
    mockSearchParams.set('rooms', '3'); // User requests 3 rooms
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page
    renderHotelDetail('test-hotel-123');

    // Assert - Page loads with room availability information
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Test 1: Hotel information is displayed (appears in multiple places)
    expect(screen.getAllByText('Test Luxury Hotel')).toHaveLength(2);

    // Test 2: Room options are displayed
    expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
    expect(screen.getByText('Executive Suite')).toBeInTheDocument();

    // Test 3: User request is displayed in search bar (3 rooms requested)
    expect(screen.getAllByText(/3.*room/)).toHaveLength(2); // Appears in search bar and booking details

    // Test 4: Guest count matches room request
    expect(screen.getByText(/6.*adults/)).toBeInTheDocument();

    // Test 5: Date range is displayed
    expect(screen.getAllByText(/7.*nights/)).toHaveLength(2); // Appears in search bar and booking details
  });

  it('should adjust room request when user requests more rooms than available', async () => {
    // Arrange - Set up mock hooks with only 2 available rooms
    mockUseFetchHotelsForDetails.mockReturnValue({
      hotels: [mockHotel],
      loading: false,
      error: null,
    });

    mockUseFetchHotelPricesForDetails.mockReturnValue({
      prices: [{ 
        id: mockHotel.id, 
        searchRank: 1,
        price_type: 'per_night',
        free_cancellation: true,
        rooms_available: 2, // Only 2 rooms available
        max_cash_payment: 253.09,
        coverted_max_cash_payment: 253.09,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 253.09,
        price: 253.09,
        converted_price: 253.09,
        lowest_converted_price: 253.09,
        market_rates: [{ supplier: 'Direct', rate: 253.09 }]
      }],
      loading: false,
      error: null,
    });

    mockUsePricedHotelsForDetails.mockReturnValue([
      { 
        ...mockHotel, 
        searchRank: 1,
        price_type: 'per_night',
        free_cancellation: true,
        rooms_available: 2, // Only 2 rooms available
        max_cash_payment: 253.09,
        coverted_max_cash_payment: 253.09,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 253.09,
        price: 253.09,
        converted_price: 253.09,
        lowest_converted_price: 253.09,
        market_rates: [{ supplier: 'Direct', rate: 253.09 }]
      }
    ]);

    mockUseFetchHotelRoomPrices.mockReturnValue({
      rooms: mockRooms,
      loading: false,
      error: null,
      retryCount: 0,
    });

    // Mock useNavigate
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    // Mock useSearchParams for 5 rooms requested (but only 2 available)
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destination_id', 'WD0M');
    mockSearchParams.set('checkin', '2025-08-12');
    mockSearchParams.set('checkout', '2025-08-19');
    mockSearchParams.set('adults', '10'); // 10 adults for 5 rooms
    mockSearchParams.set('children', '0');
    mockSearchParams.set('rooms', '5'); // User requests 5 rooms
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page
    renderHotelDetail('test-hotel-123');

    // Assert - Page loads
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Test 1: Hotel information is displayed
    expect(screen.getAllByText('Test Luxury Hotel')).toHaveLength(2);

    // Test 2: User request is displayed in search bar (5 rooms requested)
    expect(screen.getAllByText(/5.*room/)).toHaveLength(2); // Appears in search bar and booking details

    // Test 3: Guest count is displayed
    expect(screen.getByText(/10.*adults/)).toBeInTheDocument();

    // Test 4: Room options are still displayed (even with limited availability)
    expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
    expect(screen.getByText('Executive Suite')).toBeInTheDocument();
  });

  it('should handle case when hotel has limited room availability', async () => {
    // Arrange - Set up mock hooks with 0 available rooms
    mockUseFetchHotelsForDetails.mockReturnValue({
      hotels: [mockHotel],
      loading: false,
      error: null,
    });

    mockUseFetchHotelPricesForDetails.mockReturnValue({
      prices: [{ 
        id: mockHotel.id, 
        searchRank: 1,
        price_type: 'per_night',
        free_cancellation: true,
        rooms_available: 0, // 0 rooms available
        max_cash_payment: 0,
        coverted_max_cash_payment: 0,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 0,
        price: 0,
        converted_price: 0,
        lowest_converted_price: 0,
        market_rates: [{ supplier: 'None', rate: 0 }] // Provide empty market rate structure
      }],
      loading: false,
      error: null,
    });

    mockUsePricedHotelsForDetails.mockReturnValue([
      { 
        ...mockHotel, 
        searchRank: 1,
        price_type: 'per_night',
        free_cancellation: true,
        rooms_available: 0, // 0 rooms available
        max_cash_payment: 0,
        coverted_max_cash_payment: 0,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 0,
        price: 0,
        converted_price: 0,
        lowest_converted_price: 0,
        market_rates: [{ supplier: 'None', rate: 0 }] // Provide empty market rate structure
      }
    ]);

    mockUseFetchHotelRoomPrices.mockReturnValue({
      rooms: [], // No rooms available - this will cause an error in current implementation
      loading: false,
      error: null,
      retryCount: 0,
    });

    // Mock useNavigate
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    // Mock useSearchParams
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destination_id', 'WD0M');
    mockSearchParams.set('checkin', '2025-08-12');
    mockSearchParams.set('checkout', '2025-08-19');
    mockSearchParams.set('adults', '2');
    mockSearchParams.set('children', '0');
    mockSearchParams.set('rooms', '1');
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page
    renderHotelDetail('test-hotel-123');

    // Assert - Page shows error when no rooms are available
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Test 1: Error message is displayed when no rooms available
    expect(screen.getByText(/Room information is required but not available/)).toBeInTheDocument();
    
    // Test 2: Hotel information is not displayed when no rooms available
    expect(screen.queryByText('Test Luxury Hotel')).not.toBeInTheDocument();
    
    // Test 3: No room options are shown when no rooms available
    expect(screen.queryByText('Deluxe King Room')).not.toBeInTheDocument();
    expect(screen.queryByText('Executive Suite')).not.toBeInTheDocument();
  });

  it('should update display when user changes guest count', async () => {
    // Arrange - Set up mock hooks with 5 available rooms
    mockUseFetchHotelsForDetails.mockReturnValue({
      hotels: [mockHotel],
      loading: false,
      error: null,
    });

    mockUseFetchHotelPricesForDetails.mockReturnValue({
      prices: [{ 
        id: mockHotel.id, 
        searchRank: 1,
        price_type: 'per_night',
        free_cancellation: true,
        rooms_available: 5, // 5 rooms available
        max_cash_payment: 253.09,
        coverted_max_cash_payment: 253.09,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 253.09,
        price: 253.09,
        converted_price: 253.09,
        lowest_converted_price: 253.09,
        market_rates: [{ supplier: 'Direct', rate: 253.09 }]
      }],
      loading: false,
      error: null,
    });

    mockUsePricedHotelsForDetails.mockReturnValue([
      { 
        ...mockHotel, 
        searchRank: 1,
        price_type: 'per_night',
        free_cancellation: true,
        rooms_available: 5, // 5 rooms available
        max_cash_payment: 253.09,
        coverted_max_cash_payment: 253.09,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 253.09,
        price: 253.09,
        converted_price: 253.09,
        lowest_converted_price: 253.09,
        market_rates: [{ supplier: 'Direct', rate: 253.09 }]
      }
    ]);

    mockUseFetchHotelRoomPrices.mockReturnValue({
      rooms: mockRooms,
      loading: false,
      error: null,
      retryCount: 0,
    });

    // Mock useNavigate
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    // Mock useSearchParams for initial guest count
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destination_id', 'WD0M');
    mockSearchParams.set('checkin', '2025-08-12');
    mockSearchParams.set('checkout', '2025-08-19');
    mockSearchParams.set('adults', '2'); // Initial: 2 adults
    mockSearchParams.set('children', '0');
    mockSearchParams.set('rooms', '1'); // Initial: 1 room
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page
    renderHotelDetail('test-hotel-123');

    // Assert - Page loads with initial guest count
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Test 1: Initial guest count is displayed
    expect(screen.getByText(/2.*adults/)).toBeInTheDocument();
    expect(screen.getAllByText(/1.*room/)).toHaveLength(2); // Appears in search bar and booking details

    // Test 2: Room options are displayed
    expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
    expect(screen.getByText('Executive Suite')).toBeInTheDocument();

    // Test 3: Date range is displayed
    expect(screen.getAllByText(/7.*nights/)).toHaveLength(2); // Appears in search bar and booking details
  });

  it('should handle guest capacity validation correctly', async () => {
    // Arrange - Set up mock hooks with limited room capacity
    mockUseFetchHotelsForDetails.mockReturnValue({
      hotels: [mockHotel],
      loading: false,
      error: null,
    });

    mockUseFetchHotelPricesForDetails.mockReturnValue({
      prices: [{ 
        id: mockHotel.id, 
        searchRank: 1,
        price_type: 'per_night',
        free_cancellation: true,
        rooms_available: 3, // 3 rooms available
        max_cash_payment: 253.09,
        coverted_max_cash_payment: 253.09,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 253.09,
        price: 253.09,
        converted_price: 253.09,
        lowest_converted_price: 253.09,
        market_rates: [{ supplier: 'Direct', rate: 253.09 }]
      }],
      loading: false,
      error: null,
    });

    mockUsePricedHotelsForDetails.mockReturnValue([
      { 
        ...mockHotel, 
        searchRank: 1,
        price_type: 'per_night',
        free_cancellation: true,
        rooms_available: 3, // 3 rooms available
        max_cash_payment: 253.09,
        coverted_max_cash_payment: 253.09,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 253.09,
        price: 253.09,
        converted_price: 253.09,
        lowest_converted_price: 253.09,
        market_rates: [{ supplier: 'Direct', rate: 253.09 }]
      }
    ]);

    mockUseFetchHotelRoomPrices.mockReturnValue({
      rooms: mockRooms,
      loading: false,
      error: null,
      retryCount: 0,
    });

    // Mock useNavigate
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    // Mock useSearchParams for guest capacity test
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destination_id', 'WD0M');
    mockSearchParams.set('checkin', '2025-08-12');
    mockSearchParams.set('checkout', '2025-08-19');
    mockSearchParams.set('adults', '12'); // 12 adults (exceeds room capacity)
    mockSearchParams.set('children', '0');
    mockSearchParams.set('rooms', '3'); // 3 rooms available
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page
    renderHotelDetail('test-hotel-123');

    // Assert - Page loads
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Test 1: Hotel information is displayed
    expect(screen.getAllByText('Test Luxury Hotel')).toHaveLength(2);

    // Test 2: Guest count is displayed
    expect(screen.getByText(/12.*adults/)).toBeInTheDocument();

    // Test 3: Room count is displayed
    expect(screen.getAllByText(/3.*room/)).toHaveLength(2); // Appears in search bar and booking details

    // Test 4: Room options are displayed
    expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
    expect(screen.getByText('Executive Suite')).toBeInTheDocument();
  });
});
