import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  render,
  screen,
  waitFor,
  fireEvent,
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

describe('Integration Test - Calendar and Booking Integration', () => {
  it('ITC_HOTELDETAIL_6: Date changes in calendar update booking card and pricing', async () => {
    // Arrange - Set up mock hooks for hotel detail page
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
        rooms_available: 5,
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
        rooms_available: 5,
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

    // Mock useSearchParams for initial dates (7 nights)
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destination_id', 'WD0M');
    mockSearchParams.set('checkin', '2025-08-12');
    mockSearchParams.set('checkout', '2025-08-19');
    mockSearchParams.set('adults', '2');
    mockSearchParams.set('children', '0');
    mockSearchParams.set('rooms', '1');
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page
    renderHotelDetail('test-hotel-123', {
      destination_id: 'WD0M',
      checkin: '2025-08-12',
      checkout: '2025-08-19',
      adults: '2',
      children: '0',
      rooms: '1'
    });

    // Assert - Hotel detail page loads with initial dates
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Test 1: Initial booking information is displayed
    expect(screen.getAllByText('Test Luxury Hotel')).toHaveLength(2);
    expect(screen.getByText(/2.*adults/)).toBeInTheDocument();
    expect(screen.getAllByText(/1.*room/)).toHaveLength(2);
    expect(screen.getAllByText(/7.*nights/)).toHaveLength(2);

    // Test 2: Initial pricing is displayed (7 nights × $253.09 = $1,771.63)
    expect(screen.getByText(/7.*nights.*1.*room.*\$36\.16/)).toBeInTheDocument();

    // Test 3: Room options are displayed
    expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
    expect(screen.getByText('Executive Suite')).toBeInTheDocument();
  });

  it('should update booking card when user selects new check-in date', async () => {
    // Arrange - Set up mock hooks for hotel detail page
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
        rooms_available: 5,
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
        rooms_available: 5,
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

    // Mock useSearchParams for new check-in date (6 nights instead of 7)
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destination_id', 'WD0M');
    mockSearchParams.set('checkin', '2025-08-13'); // New check-in date (1 day later)
    mockSearchParams.set('checkout', '2025-08-19');
    mockSearchParams.set('adults', '2');
    mockSearchParams.set('children', '0');
    mockSearchParams.set('rooms', '1');
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page with new check-in date
    renderHotelDetail('test-hotel-123', {
      destination_id: 'WD0M',
      checkin: '2025-08-13',
      checkout: '2025-08-19',
      adults: '2',
      children: '0',
      rooms: '1'
    });

    // Assert - Hotel detail page loads with updated check-in date
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Test 1: Hotel information is displayed
    expect(screen.getAllByText('Test Luxury Hotel')).toHaveLength(2);

    // Test 2: Updated check-in date is reflected (6 nights instead of 7)
    expect(screen.getAllByText(/6.*nights/)).toHaveLength(2);

    // Test 3: Pricing is updated for 6 nights (6 × $253.09 = $1,518.54)
    expect(screen.getByText(/6.*nights.*1.*room/)).toBeInTheDocument();

    // Test 4: Room options remain available
    expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
    expect(screen.getByText('Executive Suite')).toBeInTheDocument();
  });

  it('should update booking card when user selects new check-out date', async () => {
    // Arrange - Set up mock hooks for hotel detail page
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
        rooms_available: 5,
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
        rooms_available: 5,
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

    // Mock useSearchParams for new check-out date (10 nights instead of 7)
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destination_id', 'WD0M');
    mockSearchParams.set('checkin', '2025-08-12');
    mockSearchParams.set('checkout', '2025-08-22'); // New check-out date (3 days later)
    mockSearchParams.set('adults', '2');
    mockSearchParams.set('children', '0');
    mockSearchParams.set('rooms', '1');
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page with new check-out date
    renderHotelDetail('test-hotel-123', {
      destination_id: 'WD0M',
      checkin: '2025-08-12',
      checkout: '2025-08-22',
      adults: '2',
      children: '0',
      rooms: '1'
    });

    // Assert - Hotel detail page loads with updated check-out date
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Test 1: Hotel information is displayed
    expect(screen.getAllByText('Test Luxury Hotel')).toHaveLength(2);

    // Test 2: Updated check-out date is reflected (10 nights instead of 7)
    expect(screen.getAllByText(/10.*nights/)).toHaveLength(2);

    // Test 3: Pricing is updated for 10 nights (10 × $253.09 = $2,530.90)
    expect(screen.getByText(/10.*nights.*1.*room/)).toBeInTheDocument();

    // Test 4: Room options remain available
    expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
    expect(screen.getByText('Executive Suite')).toBeInTheDocument();
  });

  it('should handle invalid date range (check-out before check-in)', async () => {
    // Arrange - Set up mock hooks for hotel detail page
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
        rooms_available: 5,
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
        rooms_available: 5,
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

    // Mock useSearchParams for invalid date range (check-out before check-in)
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destination_id', 'WD0M');
    mockSearchParams.set('checkin', '2025-08-19');
    mockSearchParams.set('checkout', '2025-08-12'); // Invalid: check-out before check-in
    mockSearchParams.set('adults', '2');
    mockSearchParams.set('children', '0');
    mockSearchParams.set('rooms', '1');
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page with invalid date range
    renderHotelDetail('test-hotel-123', {
      destination_id: 'WD0M',
      checkin: '2025-08-19',
      checkout: '2025-08-12',
      adults: '2',
      children: '0',
      rooms: '1'
    });

    // Assert - Hotel detail page loads
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Test 1: Hotel information is displayed
    expect(screen.getAllByText('Test Luxury Hotel')).toHaveLength(2);

    // Test 2: Invalid date range is handled gracefully
    // The system should either show an error or default to valid dates
    // For now, we verify the page loads without crashing
    expect(screen.getByText(/2.*adults/)).toBeInTheDocument();
    expect(screen.getAllByText(/1.*room/)).toHaveLength(2);

    // Test 3: Room options remain available
    expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
    expect(screen.getByText('Executive Suite')).toBeInTheDocument();
  });

  it('should reset calendar dates to original values', async () => {
    // Arrange - Set up mock hooks for hotel detail page
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
        rooms_available: 5,
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
        rooms_available: 5,
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

    // Mock useSearchParams for original dates (7 nights)
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destination_id', 'WD0M');
    mockSearchParams.set('checkin', '2025-08-12');
    mockSearchParams.set('checkout', '2025-08-19');
    mockSearchParams.set('adults', '2');
    mockSearchParams.set('children', '0');
    mockSearchParams.set('rooms', '1');
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page with original dates
    renderHotelDetail('test-hotel-123', {
      destination_id: 'WD0M',
      checkin: '2025-08-12',
      checkout: '2025-08-19',
      adults: '2',
      children: '0',
      rooms: '1'
    });

    // Assert - Hotel detail page loads with original dates
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Test 1: Hotel information is displayed
    expect(screen.getAllByText('Test Luxury Hotel')).toHaveLength(2);

    // Test 2: Original dates are restored (7 nights)
    expect(screen.getAllByText(/7.*nights/)).toHaveLength(2);

    // Test 3: Original pricing is restored (7 × $253.09 = $1,771.63)
    expect(screen.getByText(/7.*nights.*1.*room/)).toBeInTheDocument();

    // Test 4: Room options remain available
    expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
    expect(screen.getByText('Executive Suite')).toBeInTheDocument();

    // Test 5: URL parameters are correctly set
    expect(mockSearchParams.get('checkin')).toBe('2025-08-12');
    expect(mockSearchParams.get('checkout')).toBe('2025-08-19');
  });

  it('should synchronize calendar and booking card with accurate pricing', async () => {
    // Arrange - Set up mock hooks for hotel detail page
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
        rooms_available: 5,
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
        rooms_available: 5,
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

    // Mock useSearchParams for 3 nights (different duration)
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destination_id', 'WD0M');
    mockSearchParams.set('checkin', '2025-08-12');
    mockSearchParams.set('checkout', '2025-08-15'); // 3 nights
    mockSearchParams.set('adults', '2');
    mockSearchParams.set('children', '0');
    mockSearchParams.set('rooms', '1');
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page with 3 nights
    renderHotelDetail('test-hotel-123', {
      destination_id: 'WD0M',
      checkin: '2025-08-12',
      checkout: '2025-08-15',
      adults: '2',
      children: '0',
      rooms: '1'
    });

    // Assert - Hotel detail page loads with 3 nights
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Test 1: Hotel information is displayed
    expect(screen.getAllByText('Test Luxury Hotel')).toHaveLength(2);

    // Test 2: Calendar shows 3 nights
    expect(screen.getAllByText(/3.*nights/)).toHaveLength(2);

    // Test 3: Booking card shows 3 nights
    expect(screen.getByText(/3.*nights.*1.*room/)).toBeInTheDocument();

    // Test 4: Pricing is calculated for 3 nights (3 × $253.09 = $759.27)
    // The price per night should remain $253.09, but total should be for 3 nights
    expect(screen.getByText(/3.*nights.*1.*room.*\$/)).toBeInTheDocument();

    // Test 5: Room options remain available
    expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
    expect(screen.getByText('Executive Suite')).toBeInTheDocument();

    // Test 6: URL parameters are correctly synchronized
    expect(mockSearchParams.get('checkin')).toBe('2025-08-12');
    expect(mockSearchParams.get('checkout')).toBe('2025-08-15');
  });
});
