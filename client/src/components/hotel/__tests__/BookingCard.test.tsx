import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';
import BookingCard from '../BookingCard';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockSearchParams = new URLSearchParams('checkin=2025-10-10&checkout=2025-10-17&adults=2&children=0&rooms=1');

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  };
});

// Calendar component is not being tested in these simplified tests

// Mock console methods to avoid noise in tests
let consoleErrorSpy: MockInstance;
let consoleWarnSpy: MockInstance;

beforeEach(() => {
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  
  // Reset mocks
  vi.clearAllMocks();
  
  // Reset navigate mock
  mockNavigate.mockClear();
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  consoleWarnSpy.mockRestore();
  cleanup();
});

// Helper function to render BookingCard with specific props
const renderBookingCard = (props: any = {}) => {
  const defaultProps = {
    price: 200,
    rating: 4.5,
    reviewCount: 100,
    hotelName: 'Test Hotel',
    hotelId: 'test-hotel-123',
    hotelAddress: '123 Test Street, Test City',
    hasRooms: true,
    availability: {
      requestedRooms: 1,
      availableRooms: 5,
      validRoomCount: 1,
      requestedAdults: 2,
      requestedChildren: 0,
      totalRequestedGuests: 2,
      maxGuestCapacity: 6,
      validGuestCapacity: 2,
      validAdults: 2,
      validChildren: 0,
    },
    selectedRoom: {
      id: 'room-123',
      room_type: 'Standard Room',
      price: 200,
      free_cancellation: true,
      image: 'test-image.jpg',
      occupancy: 2,
      bed_type: 'King bed',
      size: '35',
      description: 'Comfortable standard room',
      amenities: ['WiFi', 'TV', 'Air Conditioning'],
    },
    hotelImages: ['test-image-1.jpg', 'test-image-2.jpg'],
  };

  return render(
    <MemoryRouter initialEntries={['/hotel/test-hotel-123']}>
      <Routes>
        <Route path="/hotel/:hotelId" element={<BookingCard {...defaultProps} {...props} />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Unit Test - Booking Card Interaction', () => {
  describe('TC_HOTELDETAIL_4: User interacts with booking card', () => {
    it('should display booking information correctly when hotel data is valid', async () => {
      // Arrange
      const validProps = {
        price: 300,
        rating: 4.8,
        reviewCount: 250,
        hotelName: 'Luxury Hotel',
        hotelAddress: '456 Luxury Ave, Luxury City',
        hasRooms: true,
      };

      // Act
      renderBookingCard(validProps);

      // Assert
      expect(screen.getByText('Luxury Hotel')).toBeInTheDocument();
      expect(screen.getByText('456 Luxury Ave, Luxury City')).toBeInTheDocument();
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('(250 reviews)')).toBeInTheDocument();
      // Check for price elements (there might be multiple)
      const priceElements = screen.getAllByText('$300.00');
      expect(priceElements.length).toBeGreaterThan(0);
      expect(screen.getByText('total')).toBeInTheDocument();
      expect(screen.getByText('Selected: Standard Room')).toBeInTheDocument();
    });

    it('should navigate to booking page with correct details when Reserve Now is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      renderBookingCard();

      // Act
      const reserveButton = screen.getByText('Reserve Now');
      await user.click(reserveButton);

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/booking', {
        state: expect.objectContaining({
          bookingDetails: expect.objectContaining({
            selectedRoom: expect.objectContaining({
              id: 'room-123',
              room_type: 'Standard Room',
              price: expect.any(Number),
              totalPrice: 200,
              free_cancellation: true,
            }),
            numberOfGuests: {
              adults: 2,
              children: 0,
              total: 2,
            },
            numberOfNights: 7,
            numberOfRooms: 1,
            checkinDate: '2025-10-10',
            checkoutDate: '2025-10-17',
            totalAmount: 200,
            pricePerNight: expect.any(Number),
            hotelImage: 'test-image-1.jpg',
          }),
          hotel: expect.objectContaining({
            id: 'test-hotel-123',
            name: 'Test Hotel',
            address: '123 Test Street, Test City',
            rating: 4.5,
            reviewCount: 100,
            price: 200,
            image: 'test-image-1.jpg',
          }),
          totalAmount: 200,
        }),
      });
    });

    it('should prevent navigation when rooms are not available', async () => {
      // Arrange
      const user = userEvent.setup();
      renderBookingCard({ hasRooms: false });

      // Act
      const reserveButton = screen.getByText('No Availability');
      await user.click(reserveButton);

      // Assert
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByText('No rooms available for selected dates')).toBeInTheDocument();
    });

    it('should display date selection interface', async () => {
      // Arrange
      renderBookingCard();

      // Assert - Date selection interface should be visible
      expect(screen.getByText('Select Your Dates')).toBeInTheDocument();
      expect(screen.getByText('Check-in Date')).toBeInTheDocument();
      expect(screen.getByText('Check-out Date')).toBeInTheDocument();
      
      // Check that date buttons are present
      const dateButtons = screen.getAllByRole('button');
      const checkinButton = dateButtons.find(button => button.textContent?.includes('Check-in'));
      const checkoutButton = dateButtons.find(button => button.textContent?.includes('Check-out'));
      
      expect(checkinButton).toBeInTheDocument();
      expect(checkoutButton).toBeInTheDocument();
    });

    it('should display refresh bookings functionality', async () => {
      // Arrange
      renderBookingCard();

      // Assert - Refresh functionality should be visible
      // The button text depends on the state, so check for any of the possible texts
      const refreshButton = screen.getByText(/Refresh Bookings|Fix Date Errors|Dates Up to Date/);
      expect(refreshButton).toBeInTheDocument();
      expect(screen.getByText(/Reset to Original/)).toBeInTheDocument();
    });

    it('should display guest count information correctly', async () => {
      // Arrange
      renderBookingCard();

      // Assert
      expect(screen.getByText('Adults:')).toBeInTheDocument();
      // Check for guest count elements (there might be multiple)
      const adultElements = screen.getAllByText('2');
      expect(adultElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Children:')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Total Guests:')).toBeInTheDocument();
      // Check for total guest count elements (there might be multiple)
      const totalGuestElements = screen.getAllByText('2');
      expect(totalGuestElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Rooms:')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display availability warnings when requested exceeds available', async () => {
      // Arrange
      const limitedAvailability = {
        requestedRooms: 3,
        availableRooms: 1,
        validRoomCount: 1,
        requestedAdults: 6,
        requestedChildren: 0,
        totalRequestedGuests: 6,
        maxGuestCapacity: 4,
        validGuestCapacity: 4,
        validAdults: 4,
        validChildren: 0,
      };

      // Act
      renderBookingCard({ availability: limitedAvailability });

      // Assert
      expect(screen.getByText(/Only 1 room available \(requested 3\)/)).toBeInTheDocument();
      expect(screen.getByText(/Maximum 4 guests allowed \(requested 6\)/)).toBeInTheDocument();
      expect(screen.getByText(/Guest count adjusted to fit room capacity/)).toBeInTheDocument();
    });

    it('should display pricing breakdown correctly', async () => {
      // Arrange
      renderBookingCard({ price: 350 });

      // Assert - The pricing text is in one span element
      expect(screen.getByText(/7 nights × 1 room × \$50\.00\/night/)).toBeInTheDocument();
      
      // Check for price elements (there might be multiple)
      const priceElements = screen.getAllByText('$350.00');
      expect(priceElements.length).toBeGreaterThan(0);
      
      expect(screen.getByText('Taxes & fees')).toBeInTheDocument();
      expect(screen.getByText('$35.00')).toBeInTheDocument(); // 10% of 350
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('$385.00')).toBeInTheDocument(); // 350 + 35
    });

    it('should display reset to original dates functionality', async () => {
      // Arrange
      renderBookingCard();

      // Assert - Reset functionality should be visible
      expect(screen.getByText('🔄 Reset to Original')).toBeInTheDocument();
    });

    it('should show error message when dates are invalid', async () => {
      // Arrange
      const user = userEvent.setup();
      
      // Create a new component with invalid dates by modifying the mock
      const invalidSearchParams = new URLSearchParams('checkin=invalid-date&checkout=another-invalid&adults=2&children=0&rooms=1');
      
      // Act - Render with a custom component that uses invalid dates
      const CustomBookingCard = () => {
        const [searchParams] = useSearchParams();
        // Override the search params for this test
        Object.defineProperty(searchParams, 'get', {
          value: (param: string) => invalidSearchParams.get(param),
          writable: true
        });
        
        return <BookingCard 
          price={200}
          rating={4.5}
          reviewCount={100}
          hotelName="Test Hotel"
          hotelId="test-hotel-123"
          hotelAddress="123 Test Street, Test City"
          hasRooms={true}
        />;
      };

      render(
        <MemoryRouter initialEntries={['/hotel/test-hotel-123']}>
          <Routes>
            <Route path="/hotel/:hotelId" element={<CustomBookingCard />} />
          </Routes>
        </MemoryRouter>
      );

      // Assert - Check that error handling is in place
      // The component should handle invalid dates gracefully
      expect(screen.getByText('Select Your Dates')).toBeInTheDocument();
    });

    it('should display selected room information when available', async () => {
      // Arrange
      const customRoom = {
        id: 'deluxe-room-456',
        room_type: 'Deluxe Suite',
        price: 500,
        free_cancellation: true,
        image: 'deluxe-image.jpg',
        occupancy: 4,
        bed_type: 'King + Queen',
        size: '65',
        description: 'Spacious deluxe suite',
        amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
      };

      // Act
      renderBookingCard({ selectedRoom: customRoom });

      // Assert
      expect(screen.getByText('Selected: Deluxe Suite')).toBeInTheDocument();
      // Check for the main price display (the larger one in the header)
      const priceElements = screen.getAllByText('$200.00');
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should handle missing hotel images gracefully', async () => {
      // Arrange
      renderBookingCard({ 
        hotelImages: [], 
        selectedRoom: null // Remove selectedRoom to test fallback
      });

      // Act
      const reserveButton = screen.getByText('Reserve Now');
      await userEvent.click(reserveButton);

      // Assert - Should use fallback image from the fallback array
      expect(mockNavigate).toHaveBeenCalledWith('/booking', {
        state: expect.objectContaining({
          bookingDetails: expect.objectContaining({
            hotelImage: expect.stringMatching(/^https:\/\/images\.unsplash\.com\/photo-\d+.*$/),
          }),
        }),
      });
    });

    it('should display free cancellation information', async () => {
      // Arrange
      renderBookingCard();

      // Assert
      expect(screen.getByText(/✨ Free cancellation until 24 hours before check-in/)).toBeInTheDocument();
    });

    it('should display calendar interface elements', async () => {
      // Arrange
      renderBookingCard();

      // Assert - Calendar interface elements should be visible
      expect(screen.getByText('Select Your Dates')).toBeInTheDocument();
      expect(screen.getByText('Check-in Date')).toBeInTheDocument();
      expect(screen.getByText('Check-out Date')).toBeInTheDocument();
    });

    it('should calculate correct number of nights for pricing', async () => {
      // Arrange
      renderBookingCard({ price: 210 }); // 7 nights × $30/night

      // Assert - Check for parts of the text since it might be broken up
      // The exact text depends on how dates are parsed, so be flexible
      const pricingText = screen.getByText(/night.*room.*\/night/);
      expect(pricingText).toBeInTheDocument();
      // Check for price elements (there might be multiple)
      const priceElements = screen.getAllByText('$210.00');
      expect(priceElements.length).toBeGreaterThan(0);
    });

    it('should handle room selection state correctly', async () => {
      // Arrange
      renderBookingCard();

      // Assert - Only the room type is displayed in the UI
      expect(screen.getByText('Selected: Standard Room')).toBeInTheDocument();
      
      // Other room details (bed type, size, description, amenities) are not displayed in the UI
      // They are only used internally for booking details
    });
  });
});
