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

// Mock data
const mockHotel = {
  id: 'test-hotel-123',
  imageCount: 2,
  latitude: 1.3521,
  longitude: 103.8198,
  name: 'Test Luxury Hotel',
  address: '123 Test Street, Test City, Test Country',
  address1: '123 Test Street, Test City',
  rating: 4.5,
  distance: 0.5,
  trustyou: {
    id: 'trustyou-123',
    score: {
      overall: 85,
      kaligo_overall: 80,
      solo: 82,
      couple: 88,
      family: 85,
      business: 87,
    },
  },
  categories: {
    overall: {
      name: 'Luxury Hotel',
      score: 85,
      popularity: 90,
    },
    city_hotel: {
      name: 'City Hotel',
      score: 82,
      popularity: 85,
    },
    romantic_hotel: {
      name: 'Romantic Hotel',
      score: 88,
      popularity: 88,
    },
    family_hotel: {
      name: 'Family Hotel',
      score: 85,
      popularity: 87,
    },
    business_hotel: {
      name: 'Business Hotel',
      score: 87,
      popularity: 89,
    },
  },
  amenities_ratings: [
    { name: 'WiFi', score: 90 },
    { name: 'Pool', score: 85 },
    { name: 'Breakfast', score: 88 },
  ],
  description: 'A luxurious test hotel for testing purposes',
  original_metadata: {
    name: 'Test Luxury Hotel',
    city: 'Test City',
    state: 'Test State',
    country: 'Test Country',
  },
  amenities: {
    airConditioning: true,
    outdoorPool: true,
    continentalBreakfast: true,
    businessCenter: false,
    sauna: true,
  },
  image_details: {
    suffix: '.jpg',
    count: 2,
    prefix: 'https://example.com/',
  },
  hires_image_index: '0',
  number_of_images: 2,
  default_image_index: 0,
  imgix_url: 'https://example.com/image1.jpg',
  cloudflare_image_url: 'https://example.com/image1.jpg',
  checkin_time: '15:00',
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
  ],
};

const mockRooms = [
  {
    key: 'room-1',
    room_normalized_description: 'Deluxe Room',
    free_cancellation: true,
    description: 'Spacious deluxe room with city view',
    long_description: 'This deluxe room offers a comfortable stay with modern amenities',
    images: ['https://example.com/room1.jpg'],
    amenities: ['WiFi', 'TV', 'Mini Bar'],
    price: 200,
    market_rates: [{ supplier: 'Direct', price: 200 }],
  },
  {
    key: 'room-2',
    room_normalized_description: 'Suite',
    free_cancellation: true,
    description: 'Luxury suite with separate living area',
    long_description: 'Premium suite featuring a separate living room and bedroom',
    images: ['https://example.com/room2.jpg'],
    amenities: ['WiFi', 'TV', 'Mini Bar', 'Jacuzzi'],
    price: 350,
    market_rates: [{ supplier: 'Direct', price: 350 }],
  },
];

describe('Integration Test - Search Bar Integration', () => {
  it('ITC_HOTELDETAIL_2: User can modify search criteria and return to listing page', async () => {
    // Arrange - Set up mock hooks with complete data
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
        rooms_available: 2,
        max_cash_payment: 200,
        coverted_max_cash_payment: 200,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 150,
        price: 200,
        converted_price: 200,
        lowest_converted_price: 150,
        market_rates: [{ supplier: 'Direct', rate: 200 }]
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
        rooms_available: 2,
        max_cash_payment: 200,
        coverted_max_cash_payment: 200,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 150,
        price: 200,
        converted_price: 200,
        lowest_converted_price: 150,
        market_rates: [{ supplier: 'Direct', rate: 200 }]
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

    // Mock useSearchParams to return initial search parameters
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destination_id', 'WD0M');
    mockSearchParams.set('checkin', '2025-08-12');
    mockSearchParams.set('checkout', '2025-08-30');
    mockSearchParams.set('adults', '2');
    mockSearchParams.set('children', '0');
    mockSearchParams.set('rooms', '1');
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page
    renderHotelDetail('test-hotel-123');

    // Assert - Page loads with search bar
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify search bar is present
    expect(screen.getByText('Find Hotels')).toBeInTheDocument();

    // Test 1: User modifies destination in search bar
    // The search bar should be pre-populated with current values
    expect(screen.getByDisplayValue('Singapore')).toBeInTheDocument(); // Default destination name

    // Test 2: User modifies dates in search bar
    // Dates should be pre-populated from URL parameters
    expect(screen.getByText(/Tue, Aug 12/)).toBeInTheDocument(); // Checkin date
    expect(screen.getByText(/Sat, Aug 30/)).toBeInTheDocument(); // Checkout date

    // Test 3: User modifies guest count in search bar
    // Guest count should be pre-populated from URL parameters
    expect(screen.getByText(/2.*adults/)).toBeInTheDocument(); // Adults
    expect(screen.getByText(/0.*child/)).toBeInTheDocument(); // Children
    // Use getAllByText since room count appears in multiple places
    expect(screen.getAllByText(/1.*room/)).toHaveLength(2); // Rooms (search bar + hotel info)

    // Test 4: User clicks "Find Hotels" button
    const findHotelsButton = screen.getByText('Find Hotels');
    expect(findHotelsButton).toBeInTheDocument();
    
    // Simulate clicking the Find Hotels button
    fireEvent.click(findHotelsButton);

    // Verify navigation to listing page with updated search criteria
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/listing?destId="WD0M"&destName="Singapore"&checkin="2025-08-12"&checkout="2025-08-30"&adult=2&child=0&room=1')
    );

    // Verify search bar maintains state during the process
    expect(screen.getByDisplayValue('Singapore')).toBeInTheDocument();
    expect(screen.getByText(/Tue, Aug 12/)).toBeInTheDocument();
    expect(screen.getByText(/Sat, Aug 30/)).toBeInTheDocument();
    expect(screen.getByText(/2.*adults/)).toBeInTheDocument();
    expect(screen.getByText(/0.*child/)).toBeInTheDocument();
    expect(screen.getAllByText(/1.*room/)).toHaveLength(2); // Rooms (search bar + hotel info)
  });

  it('should handle search bar validation errors gracefully', async () => {
    // Arrange - Set up mock hooks with complete data
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
        rooms_available: 2,
        max_cash_payment: 200,
        coverted_max_cash_payment: 200,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 150,
        price: 200,
        converted_price: 200,
        lowest_converted_price: 150,
        market_rates: [{ supplier: 'Direct', rate: 200 }]
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
        rooms_available: 2,
        max_cash_payment: 200,
        coverted_max_cash_payment: 200,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 150,
        price: 200,
        converted_price: 200,
        lowest_converted_price: 150,
        market_rates: [{ supplier: 'Direct', rate: 200 }]
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

    // Mock useSearchParams with empty destination to trigger validation
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destination_id', '');
    mockSearchParams.set('checkin', '2025-08-12');
    mockSearchParams.set('checkout', '2025-08-30');
    mockSearchParams.set('adults', '2');
    mockSearchParams.set('children', '0');
    mockSearchParams.set('rooms', '1');
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page
    renderHotelDetail('test-hotel-123');

    // Assert - Page loads
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Clear the destination input to ensure it's empty
    const destinationInput = screen.getByDisplayValue('Singapore');
    fireEvent.change(destinationInput, { target: { value: '' } });

    // Try to submit with invalid data
    const findHotelsButton = screen.getByText('Find Hotels');
    fireEvent.click(findHotelsButton);

    // Verify validation error is displayed using the testid
    expect(screen.getByTestId('error-msg-box')).toBeInTheDocument();
    expect(screen.getByText('Destination name cannot be empty.')).toBeInTheDocument();

    // Verify navigation is not called due to validation error
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should update search bar state when URL parameters change', async () => {
    // Arrange - Set up mock hooks with complete data
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
        rooms_available: 2,
        max_cash_payment: 200,
        coverted_max_cash_payment: 200,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 150,
        price: 200,
        converted_price: 200,
        lowest_converted_price: 150,
        market_rates: [{ supplier: 'Direct', rate: 200 }]
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
        rooms_available: 2,
        max_cash_payment: 200,
        coverted_max_cash_payment: 200,
        points: 0,
        bonuses: 0,
        bonus_programs: [],
        bonus_tiers: [],
        lowest_price: 150,
        price: 200,
        converted_price: 200,
        lowest_converted_price: 150,
        market_rates: [{ supplier: 'Direct', rate: 200 }]
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

    // Mock useSearchParams with different search parameters
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set('destId', 'WD0M');
    mockSearchParams.set('checkin', '2025-09-15');
    mockSearchParams.set('checkout', '2025-09-22');
    mockSearchParams.set('adult', '3');
    mockSearchParams.set('child', '1');
    mockSearchParams.set('room', '2');
    
    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);

    // Act - Render the hotel detail page
    renderHotelDetail('test-hotel-123');

    // Assert - Page loads with updated search parameters
    await waitFor(() => {
      expect(screen.queryByText('Loading hotel details...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify search bar reflects the new URL parameters
    expect(screen.getByText(/Mon, Sep 15/)).toBeInTheDocument(); // New checkin date
    expect(screen.getByText(/Mon, Sep 22/)).toBeInTheDocument(); // New checkout date
    expect(screen.getByText(/3.*adult/)).toBeInTheDocument(); // New adults count (singular form)
    expect(screen.getByText(/1.*child/)).toBeInTheDocument(); // New children count
    expect(screen.getAllByText(/2.*room/)).toHaveLength(2); // New rooms count (singular form) (search bar + hotel info)

    // Verify search bar maintains state and allows navigation
    const findHotelsButton = screen.getByText('Find Hotels');
    expect(findHotelsButton).toBeInTheDocument();
    
    // Click Find Hotels to verify navigation works with new parameters
    fireEvent.click(findHotelsButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/listing?destId="WD0M"&destName="Singapore"&checkin="2025-09-15"&checkout="2025-09-22"&adult=3&child=1&room=2')
    );
  });
});
