import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import RoomOptions from '../RoomOptions';

// Mock the UI components
vi.mock('@/components/hotel/ui/card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/hotel/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button 
      data-testid="button" 
      onClick={onClick} 
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/hotel/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => (
    <span data-testid="badge" {...props}>
      {children}
    </span>
  ),
}));

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  Users: ({ size, className, ...props }: any) => (
    <svg data-testid="users-icon" {...props} />
  ),
  Bed: ({ size, className, ...props }: any) => (
    <svg data-testid="bed-icon" {...props} />
  ),
  Check: ({ size, className, ...props }: any) => (
    <svg data-testid="check-icon" {...props} />
  ),
  ImageOff: ({ size, className, ...props }: any) => (
    <svg data-testid="image-off-icon" {...props} />
  ),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams()],
}));

describe('Unit Test - Room Selection', () => {
  const mockHotelId = 'test-hotel-123';
  const mockHotelName = 'Test Hotel';
  const mockHotelRating = 4.5;
  const mockHotelReviewCount = 1250;
  const mockTotalAvailableRooms = 5;

  const mockRooms = [
    {
      id: 'room-1',
      room_type: 'Deluxe King Room',
      price: 200,
      free_cancellation: true,
      image: 'https://example.com/room1.jpg',
      occupancy: 2,
      bed_type: 'King bed',
      size: '35'
    },
    {
      id: 'room-2',
      room_type: 'Executive Suite',
      price: 350,
      free_cancellation: false,
      image: 'https://example.com/room2.jpg',
      occupancy: 4,
      bed_type: '2 King beds',
      size: '50'
    },
    {
      id: 'room-3',
      room_type: 'Standard Twin Room',
      price: 150,
      free_cancellation: true,
      image: 'https://example.com/room3.jpg',
      occupancy: 2,
      bed_type: '2 Twin beds',
      size: '28'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TC_HOTELDETAIL_7: User views room options and details', () => {
    describe('Room Information Display Accuracy', () => {
      it('should display room images correctly when valid images are provided', () => {
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Should display room images with correct alt text
        const roomImages = screen.getAllByAltText(/Deluxe King Room|Executive Suite|Standard Twin Room/);
        expect(roomImages).toHaveLength(3);
        
        // Check image sources are correct
        expect(roomImages[0]).toHaveAttribute('src', 'https://example.com/room1.jpg');
        expect(roomImages[1]).toHaveAttribute('src', 'https://example.com/room2.jpg');
        expect(roomImages[2]).toHaveAttribute('src', 'https://example.com/room3.jpg');
        
        // Check image styling
        roomImages.forEach(image => {
          expect(image).toHaveClass('w-full', 'h-48', 'md:h-full', 'object-cover');
        });
      });

      it('should display placeholder images when room data has missing or invalid images', () => {
        const roomsWithInvalidImages = [
          {
            id: 'room-no-image',
            room_type: 'Room Without Image',
            price: 100,
            free_cancellation: false,
            image: '',
            occupancy: 2,
            bed_type: 'Queen bed',
            size: '25'
          },
          {
            id: 'room-undefined-image',
            room_type: 'Room With Undefined Image',
            price: 120,
            free_cancellation: true,
            image: 'undefined',
            occupancy: 2,
            bed_type: 'Queen bed',
            size: '25'
          },
          {
            id: 'room-null-image',
            room_type: 'Room With Null Image',
            price: 130,
            free_cancellation: false,
            image: 'null',
            occupancy: 2,
            bed_type: 'Queen bed',
            size: '25'
          }
        ];

        render(
          <RoomOptions
            rooms={roomsWithInvalidImages}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Should display "No Image Available" cards for all invalid images
        const noImageCards = screen.getAllByText('No Image Available');
        expect(noImageCards).toHaveLength(3);
        
        // Should display ImageOff icons
        const imageOffIcons = screen.getAllByTestId('image-off-icon');
        expect(imageOffIcons).toHaveLength(3);
        
        // Should display room types in placeholder cards (use getAllByText since they appear multiple times)
        expect(screen.getAllByText('Room Without Image')).toHaveLength(2); // Header + placeholder
        expect(screen.getAllByText('Room With Undefined Image')).toHaveLength(2); // Header + placeholder
        expect(screen.getAllByText('Room With Null Image')).toHaveLength(2); // Header + placeholder
        
        // Check placeholder styling
        const placeholderCards = screen.getAllByText('No Image Available');
        placeholderCards.forEach(card => {
          const container = card.closest('div');
          expect(container).toHaveClass('bg-gradient-to-br', 'from-gray-100', 'to-gray-200');
        });
      });

      it('should display room amenities information with appropriate icons', () => {
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Should display occupancy information with Users icon
        const usersIcons = screen.getAllByTestId('users-icon');
        expect(usersIcons).toHaveLength(3);
        
        // Should display bed type information with Bed icon
        const bedIcons = screen.getAllByTestId('bed-icon');
        expect(bedIcons).toHaveLength(3);
        
        // Should display occupancy text
        expect(screen.getAllByText(/2 guests/)).toHaveLength(2); // Deluxe King Room and Standard Twin Room
        expect(screen.getByText(/4 guests/)).toBeInTheDocument(); // Executive Suite
        
        // Should display bed type text
        expect(screen.getAllByText(/King bed/)).toHaveLength(2); // "King bed" and "2 King beds"
        expect(screen.getByText(/2 Twin beds/)).toBeInTheDocument();
        
        // Should display room size when available
        expect(screen.getByText(/35 m²/)).toBeInTheDocument();
        expect(screen.getByText(/50 m²/)).toBeInTheDocument();
        expect(screen.getByText(/28 m²/)).toBeInTheDocument();
        
        // Should display included amenities text
        const amenitiesText = screen.getAllByText('Includes: Free WiFi, Air conditioning, Private bathroom');
        expect(amenitiesText).toHaveLength(3); // One for each room
      });

      it('should display room pricing information with proper formatting', () => {
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Should display prices with dollar sign and proper formatting
        expect(screen.getByText('$200')).toBeInTheDocument();
        expect(screen.getByText('$350')).toBeInTheDocument();
        expect(screen.getByText('$150')).toBeInTheDocument();
        
        // Should display "total" label for each price
        const totalLabels = screen.getAllByText('total');
        expect(totalLabels).toHaveLength(3);
        
        // Check price styling
        const priceElements = screen.getAllByText(/\$200|\$350|\$150/);
        priceElements.forEach(price => {
          expect(price).toHaveClass('text-2xl', 'font-bold');
        });
        
        // Check total label styling
        totalLabels.forEach(label => {
          expect(label).toHaveClass('text-sm', 'text-hotel-text-secondary');
        });
      });

      it('should display cancellation policy clearly for each room', () => {
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Should display "Free Cancellation" badge for rooms with free cancellation
        const freeCancellationBadges = screen.getAllByText('Free Cancellation');
        expect(freeCancellationBadges).toHaveLength(2); // Deluxe King Room and Standard Twin Room
        
        // Should display Check icon in free cancellation badges
        const checkIcons = screen.getAllByTestId('check-icon');
        expect(checkIcons).toHaveLength(2); // 2 for free cancellation badges
        
        // Check badge styling
        freeCancellationBadges.forEach(badge => {
          expect(badge).toHaveClass('bg-green-50', 'text-green-700');
        });
        
        // Rooms without free cancellation should not display the badge
        // Executive Suite doesn't have free cancellation
        expect(screen.getAllByText('Free Cancellation')).toHaveLength(2); // Only rooms with free cancellation show it
      });

      it('should display all room information accurately with proper fallbacks', () => {
        const roomsWithMissingData = [
          {
            id: 'room-minimal',
            room_type: 'Minimal Room',
            price: 80,
            free_cancellation: false,
            image: 'https://example.com/minimal.jpg',
            // Missing occupancy, bed_type, and size
          },
          {
            id: 'room-complete',
            room_type: 'Complete Room',
            price: 200,
            free_cancellation: true,
            image: 'https://example.com/complete.jpg',
            occupancy: 3,
            bed_type: 'Queen bed',
            size: '40'
          }
        ];

        render(
          <RoomOptions
            rooms={roomsWithMissingData}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Should display room types
        expect(screen.getByText('Minimal Room')).toBeInTheDocument();
        expect(screen.getByText('Complete Room')).toBeInTheDocument();
        
        // Should display prices
        expect(screen.getByText('$80')).toBeInTheDocument();
        expect(screen.getByText('$200')).toBeInTheDocument();
        
        // Should display default values for missing data
        expect(screen.getAllByText(/2 guests/)).toHaveLength(1); // Default occupancy for minimal room
        expect(screen.getByText(/3 guests/)).toBeInTheDocument(); // Actual occupancy for complete room
        
        expect(screen.getAllByText(/King bed/)).toHaveLength(1); // Default bed type for minimal room
        expect(screen.getByText(/Queen bed/)).toBeInTheDocument(); // Actual bed type for complete room
        
        // Should display size only when available
        expect(screen.queryByText(/40 m²/)).toBeInTheDocument(); // Size for complete room
        
        // Should display cancellation policy correctly
        expect(screen.getAllByText('Free Cancellation')).toHaveLength(1); // Only complete room has it
        
        // Should display images correctly
        const roomImages = screen.getAllByAltText(/Minimal Room|Complete Room/);
        expect(roomImages).toHaveLength(2);
      });
    });

    describe('Room Data Validation and Fallbacks', () => {
      it('should handle rooms with completely missing optional properties', () => {
        const roomWithNoOptionalData = [
          {
            id: 'room-basic',
            room_type: 'Basic Room',
            price: 50,
            free_cancellation: false,
            image: 'https://example.com/basic.jpg'
            // No occupancy, bed_type, or size
          }
        ];

        render(
          <RoomOptions
            rooms={roomWithNoOptionalData}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Should display basic room information
        expect(screen.getByText('Basic Room')).toBeInTheDocument();
        expect(screen.getByText('$50')).toBeInTheDocument();
        
        // Should use default values for missing properties
        expect(screen.getByText(/2 guests/)).toBeInTheDocument(); // Default occupancy
        expect(screen.getByText(/King bed/)).toBeInTheDocument(); // Default bed type
        expect(screen.queryByText(/m²/)).not.toBeInTheDocument(); // No size display
        
        // Should not display free cancellation badge
        expect(screen.queryByText('Free Cancellation')).not.toBeInTheDocument();
      });

      it('should handle rooms with edge case image scenarios', () => {
        const roomsWithEdgeCaseImages = [
          {
            id: 'room-whitespace',
            room_type: 'Room With Whitespace',
            price: 100,
            free_cancellation: false,
            image: '   ', // Whitespace only
            occupancy: 2,
            bed_type: 'Queen bed',
            size: '25'
          },
          {
            id: 'room-long-url',
            room_type: 'Room With Long URL',
            price: 120,
            free_cancellation: true,
            image: 'https://example.com/very/long/image/url/that/might/cause/issues/with/very/long/paths/image.jpg',
            occupancy: 2,
            bed_type: 'Queen bed',
            size: '25'
          }
        ];

        render(
          <RoomOptions
            rooms={roomsWithEdgeCaseImages}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Room with whitespace image should show placeholder
        expect(screen.getByText('No Image Available')).toBeInTheDocument();
        expect(screen.getAllByText('Room With Whitespace')).toHaveLength(2); // Header + placeholder
        
        // Room with long URL should display image
        const roomImages = screen.getAllByAltText(/Room With Long URL/);
        expect(roomImages).toHaveLength(1);
        expect(roomImages[0]).toHaveAttribute('src', 'https://example.com/very/long/image/url/that/might/cause/issues/with/very/long/paths/image.jpg');
      });
    });
  });

  describe('TC_HOTELDETAIL_3: User selects a room', () => {
    describe('Basic Room Display', () => {
      it('should render room options with available rooms', () => {
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
            totalAvailableRooms={mockTotalAvailableRooms}
          />
        );

        // Should display header
        expect(screen.getByText('Available Rooms')).toBeInTheDocument();
        
        // Should display total available rooms
        expect(screen.getByText('5 Total Rooms Available')).toBeInTheDocument();
        
        // Should display all rooms
        expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
        expect(screen.getByText('Executive Suite')).toBeInTheDocument();
        expect(screen.getByText('Standard Twin Room')).toBeInTheDocument();
        
        // Should display room prices
        expect(screen.getByText('$200')).toBeInTheDocument();
        expect(screen.getByText('$350')).toBeInTheDocument();
        expect(screen.getByText('$150')).toBeInTheDocument();
        
        // Should display "Select Room" buttons
        const selectButtons = screen.getAllByText('Select Room');
        expect(selectButtons).toHaveLength(3);
      });

      it('should display room details correctly', () => {
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Check first room details
        expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
        expect(screen.getAllByText(/2 guests/)).toHaveLength(2); // Deluxe King Room and Standard Twin Room
        expect(screen.getAllByText(/King bed/)).toHaveLength(2); // "King bed" and "2 King beds"
        expect(screen.getByText(/35 m²/)).toBeInTheDocument();
        expect(screen.getAllByText('Free Cancellation')).toHaveLength(2); // Deluxe King Room and Standard Twin Room
        
        // Check second room details
        expect(screen.getByText('Executive Suite')).toBeInTheDocument();
        expect(screen.getByText(/4 guests/)).toBeInTheDocument();
        expect(screen.getByText(/2 King beds/)).toBeInTheDocument();
        expect(screen.getByText(/50 m²/)).toBeInTheDocument();
        
        // Second room should not have free cancellation
        // Note: Executive Suite doesn't have free cancellation, but Deluxe King Room and Standard Twin Room do
        expect(screen.getAllByText('Free Cancellation')).toHaveLength(2); // Deluxe King Room and Standard Twin Room
      });

      it('should display room images correctly', () => {
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Should display room images
        const roomImages = screen.getAllByAltText(/Deluxe King Room|Executive Suite|Standard Twin Room/);
        expect(roomImages).toHaveLength(3);
        
        // Check image sources
        expect(roomImages[0]).toHaveAttribute('src', 'https://example.com/room1.jpg');
        expect(roomImages[1]).toHaveAttribute('src', 'https://example.com/room2.jpg');
        expect(roomImages[2]).toHaveAttribute('src', 'https://example.com/room3.jpg');
      });

      it('should handle rooms without images gracefully', () => {
        const roomsWithoutImages = [
          {
            id: 'room-no-image',
            room_type: 'Room Without Image',
            price: 100,
            free_cancellation: false,
            image: '',
            occupancy: 2,
            bed_type: 'Queen bed',
            size: '25'
          }
        ];

        render(
          <RoomOptions
            rooms={roomsWithoutImages}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Should display "No Image Available" card
        expect(screen.getByText('No Image Available')).toBeInTheDocument();
        expect(screen.getAllByText('Room Without Image')).toHaveLength(2); // Both in header and in no-image card
        expect(screen.getByTestId('image-off-icon')).toBeInTheDocument();
      });
    });

    describe('Room Selection State Management', () => {
      it('should call onSelectRoom when "Select Room" button is clicked', async () => {
        const mockOnSelectRoom = vi.fn();
        const user = userEvent.setup();
        
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
            onSelectRoom={mockOnSelectRoom}
          />
        );

        // Click "Select Room" button for first room
        const selectButtons = screen.getAllByText('Select Room');
        await user.click(selectButtons[0]);

        // Should call onSelectRoom with correct room data
        expect(mockOnSelectRoom).toHaveBeenCalledTimes(1);
        expect(mockOnSelectRoom).toHaveBeenCalledWith(mockRooms[0]);
      });

      it('should call onSelectRoom for different rooms', async () => {
        const mockOnSelectRoom = vi.fn();
        const user = userEvent.setup();
        
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
            onSelectRoom={mockOnSelectRoom}
          />
        );

        const selectButtons = screen.getAllByText('Select Room');
        
        // Click first room
        await user.click(selectButtons[0]);
        expect(mockOnSelectRoom).toHaveBeenCalledWith(mockRooms[0]);
        
        // Click second room
        await user.click(selectButtons[1]);
        expect(mockOnSelectRoom).toHaveBeenCalledWith(mockRooms[1]);
        
        // Click third room
        await user.click(selectButtons[2]);
        expect(mockOnSelectRoom).toHaveBeenCalledWith(mockRooms[2]);
        
        // Should have been called 3 times total
        expect(mockOnSelectRoom).toHaveBeenCalledTimes(3);
      });

      it('should handle multiple clicks on the same room', async () => {
        const mockOnSelectRoom = vi.fn();
        const user = userEvent.setup();
        
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
            onSelectRoom={mockOnSelectRoom}
          />
        );

        const selectButtons = screen.getAllByText('Select Room');
        
        // Click first room multiple times
        await user.click(selectButtons[0]);
        await user.click(selectButtons[0]);
        await user.click(selectButtons[0]);
        
        // Should call onSelectRoom each time
        expect(mockOnSelectRoom).toHaveBeenCalledTimes(3);
        expect(mockOnSelectRoom).toHaveBeenCalledWith(mockRooms[0]);
      });
    });

    describe('Button State Changes (Simulated)', () => {
      it('should maintain "Select Room" button text after selection', () => {
        const mockOnSelectRoom = vi.fn();
        
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
            onSelectRoom={mockOnSelectRoom}
          />
        );

        // Buttons should remain "Select Room" (component doesn't change state internally)
        const selectButtons = screen.getAllByText('Select Room');
        expect(selectButtons).toHaveLength(3);
        
        // Click a button
        fireEvent.click(selectButtons[0]);
        
        // Button text should still be "Select Room" (no internal state change)
        expect(screen.getAllByText('Select Room')).toHaveLength(3);
      });

      it('should maintain button styling after selection', () => {
        const mockOnSelectRoom = vi.fn();
        
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
            onSelectRoom={mockOnSelectRoom}
          />
        );

        const selectButtons = screen.getAllByText('Select Room');
        
        // Check initial button styling
        selectButtons.forEach(button => {
          expect(button).toHaveClass('bg-primary', 'hover:bg-primary/90');
        });
        
        // Click a button
        fireEvent.click(selectButtons[0]);
        
        // Button styling should remain the same
        selectButtons.forEach(button => {
          expect(button).toHaveClass('bg-primary', 'hover:bg-primary/90');
        });
      });
    });

    describe('Selection Management', () => {
      it('should handle selection callback for all room types', async () => {
        const mockOnSelectRoom = vi.fn();
        const user = userEvent.setup();
        
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
            onSelectRoom={mockOnSelectRoom}
          />
        );

        const selectButtons = screen.getAllByText('Select Room');
        
        // Select each room type
        await user.click(selectButtons[0]); // Deluxe King Room
        await user.click(selectButtons[1]); // Executive Suite
        await user.click(selectButtons[2]); // Standard Twin Room
        
        // Verify all selections were recorded
        expect(mockOnSelectRoom).toHaveBeenCalledWith(mockRooms[0]);
        expect(mockOnSelectRoom).toHaveBeenCalledWith(mockRooms[1]);
        expect(mockOnSelectRoom).toHaveBeenCalledWith(mockRooms[2]);
      });

      it('should handle rooms without onSelectRoom callback', () => {
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
            // No onSelectRoom provided
          />
        );

        const selectButtons = screen.getAllByText('Select Room');
        
        // Should still render buttons
        expect(selectButtons).toHaveLength(3);
        
        // Clicking should not cause errors
        expect(() => fireEvent.click(selectButtons[0])).not.toThrow();
      });
    });

    describe('Edge Cases and Error Handling', () => {
      it('should handle empty rooms array', () => {
        render(
          <RoomOptions
            rooms={[]}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Should still display header
        expect(screen.getByText('Available Rooms')).toBeInTheDocument();
        
        // Should not display any room cards
        expect(screen.queryByTestId('card')).not.toBeInTheDocument();
        
        // Should not display total available rooms
        expect(screen.queryByText(/Total Rooms Available/)).not.toBeInTheDocument();
      });

      it('should handle rooms with missing optional properties', () => {
        const roomsWithMissingProps = [
          {
            id: 'room-minimal',
            room_type: 'Minimal Room',
            price: 100,
            free_cancellation: false,
            image: 'https://example.com/minimal.jpg'
            // Missing occupancy, bed_type, size
          }
        ];

        render(
          <RoomOptions
            rooms={roomsWithMissingProps}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Should display room with default values
        expect(screen.getByText('Minimal Room')).toBeInTheDocument();
        expect(screen.getByText('2 guests')).toBeInTheDocument(); // Default occupancy
        expect(screen.getByText('King bed')).toBeInTheDocument(); // Default bed type
        expect(screen.queryByText(/m²/)).not.toBeInTheDocument(); // No size
      });

      it('should handle rooms with invalid image URLs', () => {
        const roomsWithInvalidImages = [
          {
            id: 'room-invalid-image',
            room_type: 'Invalid Image Room',
            price: 100,
            free_cancellation: false,
            image: 'undefined', // Invalid image
            occupancy: 2,
            bed_type: 'Queen bed',
            size: '25'
          }
        ];

        render(
          <RoomOptions
            rooms={roomsWithInvalidImages}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Should display "No Image Available" card
        expect(screen.getByText('No Image Available')).toBeInTheDocument();
        expect(screen.getAllByText('Invalid Image Room')).toHaveLength(2); // Both in header and in no-image card
      });

      it('should handle rapid button clicks without errors', async () => {
        const mockOnSelectRoom = vi.fn();
        const user = userEvent.setup();
        
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
            onSelectRoom={mockOnSelectRoom}
          />
        );

        const selectButtons = screen.getAllByText('Select Room');
        
        // Rapidly click buttons
        await user.click(selectButtons[0]);
        await user.click(selectButtons[1]);
        await user.click(selectButtons[2]);
        await user.click(selectButtons[0]);
        await user.click(selectButtons[1]);
        
        // Should handle all clicks without errors
        expect(mockOnSelectRoom).toHaveBeenCalledTimes(5);
      });
    });

    describe('Accessibility and UX', () => {
      it('should have proper button accessibility', () => {
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        const selectButtons = screen.getAllByText('Select Room');
        
        // Each button should be accessible
        selectButtons.forEach(button => {
          expect(button).toBeInTheDocument();
          expect(button.tagName).toBe('BUTTON');
        });
      });

      it('should display room information clearly', () => {
        render(
          <RoomOptions
            rooms={mockRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Room information should be well-structured
        expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
        expect(screen.getByText('$200')).toBeInTheDocument();
        expect(screen.getAllByText('total')).toHaveLength(3); // One for each room
        expect(screen.getAllByText('Includes: Free WiFi, Air conditioning, Private bathroom')).toHaveLength(3); // One for each room
      });

      it('should handle different room configurations', () => {
        const variedRooms = [
          {
            id: 'room-1',
            room_type: 'Single Room',
            price: 80,
            free_cancellation: false,
            image: 'https://example.com/single.jpg',
            occupancy: 1,
            bed_type: 'Single bed',
            size: '20'
          },
          {
            id: 'room-2',
            room_type: 'Family Suite',
            price: 400,
            free_cancellation: true,
            image: 'https://example.com/family.jpg',
            occupancy: 6,
            bed_type: 'Multiple beds',
            size: '75'
          }
        ];

        render(
          <RoomOptions
            rooms={variedRooms}
            hotelId={mockHotelId}
            hotelName={mockHotelName}
            hotelRating={mockHotelRating}
            hotelReviewCount={mockHotelReviewCount}
          />
        );

        // Should display different room configurations
        expect(screen.getByText('Single Room')).toBeInTheDocument();
        expect(screen.getByText(/1 guest/)).toBeInTheDocument();
        expect(screen.getByText(/Single bed/)).toBeInTheDocument();
        expect(screen.getByText(/20 m²/)).toBeInTheDocument();
        
        expect(screen.getByText('Family Suite')).toBeInTheDocument();
        expect(screen.getByText(/6 guests/)).toBeInTheDocument();
        expect(screen.getByText(/Multiple beds/)).toBeInTheDocument();
        expect(screen.getByText(/75 m²/)).toBeInTheDocument();
        expect(screen.getAllByText('Free Cancellation')).toHaveLength(1); // Only Family Suite has free cancellation
      });
    });
  });
});
