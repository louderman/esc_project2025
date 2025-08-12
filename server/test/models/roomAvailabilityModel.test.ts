import { 
  RoomAvailabilityModel, 
  RoomAvailability, 
  GuestRequirements, 
  RoomCapacity,
  AvailabilityResult,
  RoomAllocation 
} from '../../models/roomAvailabilityModel';

describe('Unit Test - Room Availability Model', () => {
  describe('TC_HOTELDETAILMODEL_2: Test room availability calculation', () => {
    
    // Test data setup
    const createRoomCapacity = (
      maxGuests: number, 
      maxAdults: number, 
      maxChildren: number, 
      allowsChildren: boolean = true
    ): RoomCapacity => ({
      maxGuests,
      maxAdults,
      maxChildren,
      allowsChildren,
    });

    const createRoom = (
      roomId: string,
      roomType: string,
      capacity: RoomCapacity,
      price: number,
      isAvailable: boolean = true
    ): RoomAvailability => ({
      roomId,
      roomType,
      capacity,
      isAvailable,
      price,
      amenities: ['WiFi', 'Air Conditioning', 'TV'],
    });

    const createGuestRequirements = (
      adults: number,
      children: number,
      rooms: number
    ): GuestRequirements => ({
      adults,
      children,
      rooms,
    });

    describe('Input: 5 available rooms, 3 requested rooms', () => {
      it('should allocate 3 rooms and leave 2 rooms remaining', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(2, 2, 1), 100),
          createRoom('R2', 'Standard', createRoomCapacity(2, 2, 1), 110),
          createRoom('R3', 'Standard', createRoomCapacity(2, 2, 1), 120),
          createRoom('R4', 'Standard', createRoomCapacity(2, 2, 1), 130),
          createRoom('R5', 'Standard', createRoomCapacity(2, 2, 1), 140),
        ];

        const requirements = createGuestRequirements(6, 0, 3);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(true);
        expect(result.allocatedRooms).toBe(3);
        expect(result.remainingRooms).toBe(2);
        expect(result.adjustedGuests.adults).toBe(6);
        expect(result.adjustedGuests.children).toBe(0);
        expect(result.adjustedGuests.total).toBe(6);
        expect(result.totalPrice).toBe(330); // 100 + 110 + 120 (cheapest 3 rooms)
        expect(result.warnings).toHaveLength(0);
        expect(result.errors).toHaveLength(0);
      });

      it('should handle mixed guest types correctly', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(3, 2, 1), 100),
          createRoom('R2', 'Standard', createRoomCapacity(3, 2, 1), 110),
          createRoom('R3', 'Standard', createRoomCapacity(3, 2, 1), 120),
          createRoom('R4', 'Standard', createRoomCapacity(3, 2, 1), 130),
          createRoom('R5', 'Standard', createRoomCapacity(3, 2, 1), 140),
        ];

        const requirements = createGuestRequirements(4, 2, 3);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(true);
        expect(result.allocatedRooms).toBe(2); // 2 rooms needed for 6 guests (3 per room)
        expect(result.remainingRooms).toBe(3);
        expect(result.adjustedGuests.adults).toBe(4);
        expect(result.adjustedGuests.children).toBe(2);
        expect(result.adjustedGuests.total).toBe(6);
        expect(result.totalPrice).toBe(210); // 100 + 110 (cheapest 2 rooms)
      });
    });

    describe('Input: 2 available rooms, 5 requested rooms', () => {
      it('should allocate 2 rooms, leave 0 rooms remaining, and generate warning', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(2, 2, 1), 100),
          createRoom('R2', 'Standard', createRoomCapacity(2, 2, 1), 110),
        ];

        const requirements = createGuestRequirements(10, 0, 5);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(true);
        expect(result.allocatedRooms).toBe(2);
        expect(result.remainingRooms).toBe(0);
        expect(result.adjustedGuests.adults).toBe(4); // Limited by room capacity
        expect(result.adjustedGuests.children).toBe(0);
        expect(result.adjustedGuests.total).toBe(4);
        expect(result.totalPrice).toBe(210); // 100 + 110
        expect(result.warnings).toContain('Only 2 rooms available (requested 5)');
        expect(result.warnings).toContain('Guest count adjusted to fit room capacity (max: 4)');
        expect(result.errors).toHaveLength(0);
      });

      it('should handle guest count exceeding room capacity gracefully', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(2, 2, 0), 100),
          createRoom('R2', 'Standard', createRoomCapacity(2, 2, 0), 110),
        ];

        const requirements = createGuestRequirements(8, 2, 5);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(true);
        expect(result.allocatedRooms).toBe(2);
        expect(result.remainingRooms).toBe(0);
        expect(result.adjustedGuests.adults).toBe(4); // Limited by room capacity
        expect(result.adjustedGuests.children).toBe(0); // Children not allowed
        expect(result.adjustedGuests.total).toBe(4);
        expect(result.warnings).toContain('Only 2 rooms available (requested 5)');
        expect(result.warnings).toContain('Guest count adjusted to fit room capacity (max: 4)');
        expect(result.warnings).toContain('Children not allowed due to room capacity restrictions');
      });
    });

    describe('Input: 0 available rooms, any requested rooms', () => {
      it('should generate error when no rooms are available', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [];
        const requirements = createGuestRequirements(2, 0, 1);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(false);
        expect(result.allocatedRooms).toBe(0);
        expect(result.remainingRooms).toBe(0);
        expect(result.errors).toContain('No rooms available for the selected dates');
        expect(result.warnings).toHaveLength(0);
        expect(result.totalPrice).toBe(0);
      });

      it('should generate error when all rooms are occupied', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(2, 2, 1), 100, false), // Not available
          createRoom('R2', 'Standard', createRoomCapacity(2, 2, 1), 110, false), // Not available
        ];

        const requirements = createGuestRequirements(2, 0, 1);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(false);
        expect(result.allocatedRooms).toBe(0);
        expect(result.remainingRooms).toBe(0);
        expect(result.errors).toContain('All rooms are currently occupied');
        expect(result.warnings).toHaveLength(0);
        expect(result.totalPrice).toBe(0);
      });

      it('should handle mixed availability status correctly', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(2, 2, 1), 100, false), // Not available
          createRoom('R2', 'Standard', createRoomCapacity(2, 2, 1), 110, true),  // Available
          createRoom('R3', 'Standard', createRoomCapacity(2, 2, 1), 120, false), // Not available
        ];

        const requirements = createGuestRequirements(2, 0, 1);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(true);
        expect(result.allocatedRooms).toBe(1);
        expect(result.remainingRooms).toBe(0);
        expect(result.totalPrice).toBe(110);
      });
    });

    describe('Input: Guest count exceeds room capacity', () => {
      it('should adjust guest count to fit room capacity', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(2, 2, 0), 100),
          createRoom('R2', 'Standard', createRoomCapacity(2, 2, 0), 110),
        ];

        const requirements = createGuestRequirements(5, 1, 2);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(true);
        expect(result.allocatedRooms).toBe(2);
        expect(result.remainingRooms).toBe(0);
        expect(result.adjustedGuests.adults).toBe(4); // Limited by room capacity
        expect(result.adjustedGuests.children).toBe(0); // Children not allowed
        expect(result.adjustedGuests.total).toBe(4);
        expect(result.warnings).toContain('Guest count adjusted to fit room capacity (max: 4)');
        expect(result.warnings).toContain('Children not allowed due to room capacity restrictions');
      });

      it('should prioritize adults over children when capacity is limited', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(3, 3, 1), 100),
        ];

        const requirements = createGuestRequirements(2, 2, 1);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(true);
        expect(result.allocatedRooms).toBe(1);
        expect(result.remainingRooms).toBe(0);
        expect(result.adjustedGuests.adults).toBe(3); // Max adults allowed
        expect(result.adjustedGuests.children).toBe(0); // No children due to capacity
        expect(result.adjustedGuests.total).toBe(3);
        expect(result.warnings).toContain('Guest count adjusted to fit room capacity (max: 3)');
      });

      it('should handle children not allowed scenarios', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(2, 2, 0, false), 100), // No children allowed
        ];

        const requirements = createGuestRequirements(1, 1, 1);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(true);
        expect(result.allocatedRooms).toBe(1);
        expect(result.remainingRooms).toBe(0);
        expect(result.adjustedGuests.adults).toBe(2); // Adults redistributed from children (1 + 1)
        expect(result.adjustedGuests.children).toBe(0); // Children not allowed
        expect(result.adjustedGuests.total).toBe(2);
        expect(result.warnings).toContain('Children not allowed in these rooms');
      });
    });

    describe('Additional functionality tests', () => {
      it('should validate room data integrity correctly', () => {
        // Arrange
        const validRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(2, 2, 1), 100),
          createRoom('R2', 'Deluxe', createRoomCapacity(3, 2, 2), 150),
        ];

        const invalidRooms: RoomAvailability[] = [
          createRoom('', 'Standard', createRoomCapacity(2, 2, 1), 100), // Invalid ID
          createRoom('R3', '', createRoomCapacity(2, 2, 1), 100), // Invalid type
          createRoom('R4', 'Standard', createRoomCapacity(0, 2, 1), 100), // Invalid capacity
          createRoom('R5', 'Standard', createRoomCapacity(2, 0, 1), 100), // Invalid adult capacity
          createRoom('R6', 'Standard', createRoomCapacity(2, 2, 1), -50), // Invalid price
        ];

        // Act
        const validResult = RoomAvailabilityModel.validateRoomData(validRooms);
        const invalidResult = RoomAvailabilityModel.validateRoomData(invalidRooms);

        // Assert
        expect(validResult.isValid).toBe(true);
        expect(validResult.errors).toHaveLength(0);

        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toHaveLength(5);
        expect(invalidResult.errors).toContain('Room  has invalid ID');
        expect(invalidResult.errors).toContain('Room R3 has invalid type');
        expect(invalidResult.errors).toContain('Room R4 has invalid max guests capacity');
        expect(invalidResult.errors).toContain('Room R5 has invalid max adults capacity');
        expect(invalidResult.errors).toContain('Room R6 has invalid price');
      });

      it('should check if specific room can accommodate guests', () => {
        // Arrange
        const room = createRoom('R1', 'Standard', createRoomCapacity(3, 2, 1), 100);

        // Act & Assert
        expect(RoomAvailabilityModel.canRoomAccommodateGuests(room, 2, 1)).toBe(true);
        expect(RoomAvailabilityModel.canRoomAccommodateGuests(room, 2, 0)).toBe(true); // 2 adults within capacity
        expect(RoomAvailabilityModel.canRoomAccommodateGuests(room, 1, 1)).toBe(true); // 1 adult + 1 child within capacity
        expect(RoomAvailabilityModel.canRoomAccommodateGuests(room, 4, 0)).toBe(false); // Too many guests
        expect(RoomAvailabilityModel.canRoomAccommodateGuests(room, 3, 1)).toBe(false); // Too many guests
        expect(RoomAvailabilityModel.canRoomAccommodateGuests(room, 0, 3)).toBe(false); // No adults
      });

      it('should handle rooms that do not allow children', () => {
        // Arrange
        const adultOnlyRoom = createRoom('R1', 'Adult-Only', createRoomCapacity(2, 2, 0), 100);

        // Act & Assert
        expect(RoomAvailabilityModel.canRoomAccommodateGuests(adultOnlyRoom, 2, 0)).toBe(true);
        expect(RoomAvailabilityModel.canRoomAccommodateGuests(adultOnlyRoom, 1, 1)).toBe(false); // Children not allowed
        expect(RoomAvailabilityModel.canRoomAccommodateGuests(adultOnlyRoom, 0, 2)).toBe(false); // No adults, children not allowed
      });

      it('should find optimal room combination', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(2, 2, 1), 120), // Higher price
          createRoom('R2', 'Standard', createRoomCapacity(2, 2, 1), 100), // Lower price
          createRoom('R3', 'Deluxe', createRoomCapacity(3, 2, 2), 150),   // Higher capacity
        ];

        const requirements = createGuestRequirements(4, 1, 2);

        // Act
        const result = RoomAvailabilityModel.findOptimalRoomCombination(availableRooms, requirements);

        // Assert
        expect(result).toHaveLength(2);
        expect(result[0].price).toBe(100); // Most efficient (50 efficiency)
        expect(result[1].price).toBe(150); // Second most efficient (50 efficiency, but higher capacity)
        expect(result[0].guests.total).toBe(3); // Room 2 can accommodate 3 guests (2 adults + 1 child)
        expect(result[1].guests.total).toBe(2); // Room 1 accommodates remaining 2 guests
      });

      it('should handle minimum adult requirement validation', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(1, 1, 0), 100),
        ];

        const requirements = createGuestRequirements(0, 1, 1);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(false);
        expect(result.errors).toContain('At least one adult is required per booking');
        expect(result.allocatedRooms).toBe(0);
        expect(result.totalPrice).toBe(0);
      });
    });

    describe('Edge cases and boundary conditions', () => {
      it('should handle single room with maximum capacity', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Suite', createRoomCapacity(4, 3, 2), 200),
        ];

        const requirements = createGuestRequirements(3, 1, 1);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(true);
        expect(result.allocatedRooms).toBe(1);
        expect(result.remainingRooms).toBe(0);
        expect(result.adjustedGuests.adults).toBe(3);
        expect(result.adjustedGuests.children).toBe(1);
        expect(result.adjustedGuests.total).toBe(4);
        expect(result.totalPrice).toBe(200);
      });

      it('should handle zero children requirement', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(2, 2, 1), 100),
        ];

        const requirements = createGuestRequirements(2, 0, 1);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(true);
        expect(result.allocatedRooms).toBe(1);
        expect(result.remainingRooms).toBe(0);
        expect(result.adjustedGuests.adults).toBe(2);
        expect(result.adjustedGuests.children).toBe(0);
        expect(result.adjustedGuests.total).toBe(2);
      });

      it('should handle rooms with different capacity configurations', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Single', createRoomCapacity(1, 1, 0), 80),
          createRoom('R2', 'Double', createRoomCapacity(2, 2, 0), 100),
          createRoom('R3', 'Family', createRoomCapacity(4, 2, 2), 150),
        ];

        const requirements = createGuestRequirements(3, 2, 2);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(true);
        expect(result.allocatedRooms).toBe(2);
        expect(result.remainingRooms).toBe(1);
        expect(result.adjustedGuests.adults).toBe(3);
        expect(result.adjustedGuests.children).toBe(2);
        expect(result.adjustedGuests.total).toBe(5);
        expect(result.totalPrice).toBe(180); // Single room (80) + Double room (100) - cheapest 2 rooms
      });

      it('should handle price optimization correctly', () => {
        // Arrange
        const availableRooms: RoomAvailability[] = [
          createRoom('R1', 'Standard', createRoomCapacity(2, 2, 1), 150), // Higher price
          createRoom('R2', 'Standard', createRoomCapacity(2, 2, 1), 100), // Lower price
          createRoom('R3', 'Standard', createRoomCapacity(2, 2, 1), 120), // Medium price
        ];

        const requirements = createGuestRequirements(4, 0, 2);

        // Act
        const result = RoomAvailabilityModel.calculateAvailability(availableRooms, requirements);

        // Assert
        expect(result.success).toBe(true);
        expect(result.allocatedRooms).toBe(2);
        expect(result.remainingRooms).toBe(1);
        expect(result.totalPrice).toBe(220); // 100 + 120 (cheapest 2 rooms)
      });
    });
  });
});
