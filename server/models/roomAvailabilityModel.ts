export interface RoomCapacity {
  maxGuests: number;
  maxAdults: number;
  maxChildren: number;
  allowsChildren: boolean;
}

export interface RoomAvailability {
  roomId: string;
  roomType: string;
  capacity: RoomCapacity;
  isAvailable: boolean;
  price: number;
  amenities: string[];
}

export interface GuestRequirements {
  adults: number;
  children: number;
  rooms: number;
}

export interface AvailabilityResult {
  success: boolean;
  allocatedRooms: number;
  remainingRooms: number;
  adjustedGuests: {
    adults: number;
    children: number;
    total: number;
  };
  warnings: string[];
  errors: string[];
  totalPrice: number;
}

export interface RoomAllocation {
  roomId: string;
  roomType: string;
  guests: {
    adults: number;
    children: number;
    total: number;
  };
  price: number;
}

export class RoomAvailabilityModel {
  /**
   * Calculates room availability and allocates rooms based on guest requirements
   */
  static calculateAvailability(
    availableRooms: RoomAvailability[],
    requirements: GuestRequirements
  ): AvailabilityResult {
    const result: AvailabilityResult = {
      success: false,
      allocatedRooms: 0,
      remainingRooms: 0,
      adjustedGuests: {
        adults: 0,
        children: 0,
        total: 0,
      },
      warnings: [],
      errors: [],
      totalPrice: 0,
    };

    // Check if any rooms are available
    if (availableRooms.length === 0) {
      result.errors.push('No rooms available for the selected dates');
      return result;
    }

    // Filter only available rooms
    const rooms = availableRooms.filter(room => room.isAvailable);
    
    if (rooms.length === 0) {
      result.errors.push('All rooms are currently occupied');
      return result;
    }

    // Calculate total capacity across all available rooms
    const totalCapacity = this.calculateTotalCapacity(rooms);
    
    // Validate guest requirements against room capacity
    const guestValidation = this.validateGuestCapacity(
      requirements,
      totalCapacity,
      rooms.length
    );

    if (!guestValidation.isValid) {
      result.errors.push(...guestValidation.errors);
      return result;
    }

    // Add warnings for capacity adjustments
    if (guestValidation.warnings.length > 0) {
      result.warnings.push(...guestValidation.warnings);
    }

    // Calculate room allocation
    const allocation = this.allocateRooms(rooms, requirements, guestValidation.adjustedGuests);
    
    result.success = true;
    result.allocatedRooms = allocation.allocatedRooms;
    result.remainingRooms = rooms.length - allocation.allocatedRooms;
    result.adjustedGuests = guestValidation.adjustedGuests;
    result.totalPrice = allocation.totalPrice;

    return result;
  }

  /**
   * Validates guest capacity against available rooms
   */
  private static validateGuestCapacity(
    requirements: GuestRequirements,
    totalCapacity: RoomCapacity,
    availableRoomCount: number
  ): {
    isValid: boolean;
    adjustedGuests: { adults: number; children: number; total: number };
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    let adjustedAdults = requirements.adults;
    let adjustedChildren = requirements.children;

    // Check if requested rooms exceed available rooms
    if (requirements.rooms > availableRoomCount) {
      warnings.push(`Only ${availableRoomCount} rooms available (requested ${requirements.rooms})`);
      // Adjust to available rooms - this is just a warning, don't change guest count yet
    }

    // Check if total guests exceed room capacity
    const totalGuests = adjustedAdults + adjustedChildren;
    if (totalGuests > totalCapacity.maxGuests) {
      warnings.push(`Guest count adjusted to fit room capacity (max: ${totalCapacity.maxGuests})`);
      
      // Adjust guest count to fit capacity
      if (totalCapacity.maxGuests <= totalCapacity.maxAdults) {
        // If max capacity is only for adults, no children allowed
        adjustedAdults = totalCapacity.maxGuests;
        adjustedChildren = 0;
        warnings.push('Children not allowed due to room capacity restrictions');
      } else {
        // Distribute guests between adults and children
        adjustedAdults = Math.min(adjustedAdults, totalCapacity.maxAdults);
        adjustedChildren = Math.min(adjustedChildren, totalCapacity.maxGuests - adjustedAdults);
      }
    }

    // Check if children are allowed
    if (adjustedChildren > 0 && !totalCapacity.allowsChildren) {
      warnings.push('Children not allowed in these rooms');
      // Redistribute capacity to adults if possible
      const totalCapacityForAdults = totalCapacity.maxGuests;
      adjustedAdults = Math.min(adjustedAdults + adjustedChildren, totalCapacityForAdults);
      adjustedChildren = 0;
    }

    // Validate minimum requirements
    if (adjustedAdults < 1) {
      errors.push('At least one adult is required per booking');
      return {
        isValid: false,
        adjustedGuests: { adults: 0, children: 0, total: 0 },
        errors,
        warnings,
      };
    }

    return {
      isValid: true,
      adjustedGuests: {
        adults: adjustedAdults,
        children: adjustedChildren,
        total: adjustedAdults + adjustedChildren,
      },
      errors,
      warnings,
    };
  }

  /**
   * Calculates total capacity across all available rooms
   */
  private static calculateTotalCapacity(rooms: RoomAvailability[]): RoomCapacity {
    return rooms.reduce(
      (total: RoomCapacity, room: RoomAvailability) => ({
        maxGuests: total.maxGuests + room.capacity.maxGuests,
        maxAdults: total.maxAdults + room.capacity.maxAdults,
        maxChildren: total.maxChildren + room.capacity.maxChildren,
        allowsChildren: total.allowsChildren || room.capacity.allowsChildren,
      }),
      {
        maxGuests: 0,
        maxAdults: 0,
        maxChildren: 0,
        allowsChildren: false,
      } as RoomCapacity
    );
  }

  /**
   * Allocates rooms based on guest requirements and capacity
   */
  private static allocateRooms(
    rooms: RoomAvailability[],
    requirements: GuestRequirements,
    adjustedGuests: { adults: number; children: number; total: number }
  ): {
    allocatedRooms: number;
    totalPrice: number;
  } {
    let allocatedRooms = 0;
    let totalPrice = 0;
    let remainingAdults = adjustedGuests.adults;
    let remainingChildren = adjustedGuests.children;

    // Sort rooms by price (cheapest first) for optimal allocation
    const sortedRooms = [...rooms].sort((a, b) => a.price - b.price);

    for (const room of sortedRooms) {
      if (allocatedRooms >= requirements.rooms) {
        break;
      }

      // Calculate how many guests this room can accommodate
      const adultsForRoom = Math.min(remainingAdults, room.capacity.maxAdults);
      const childrenForRoom = Math.min(remainingChildren, room.capacity.maxChildren);
      
      // Check if room can accommodate at least some guests
      if (adultsForRoom > 0 || childrenForRoom > 0) {
        // Verify total capacity constraint
        const totalGuestsForRoom = adultsForRoom + childrenForRoom;
        if (totalGuestsForRoom <= room.capacity.maxGuests) {
          allocatedRooms++;
          totalPrice += room.price;
          remainingAdults -= adultsForRoom;
          remainingChildren -= childrenForRoom;
        }
      }
      
      // If we've allocated all requested rooms, break
      if (allocatedRooms >= requirements.rooms) {
        break;
      }
    }

    return {
      allocatedRooms,
      totalPrice,
    };
  }

  /**
   * Checks if a specific room can accommodate given guests
   */
  static canRoomAccommodateGuests(
    room: RoomAvailability,
    adults: number,
    children: number
  ): boolean {
    if (!room.isAvailable) {
      return false;
    }

    const totalGuests = adults + children;
    
    if (totalGuests > room.capacity.maxGuests) {
      return false;
    }

    if (adults > room.capacity.maxAdults) {
      return false;
    }

    if (children > room.capacity.maxChildren) {
      return false;
    }

    if (children > 0 && !room.capacity.allowsChildren) {
      return false;
    }

    // Ensure at least one adult
    if (adults < 1) {
      return false;
    }

    return true;
  }

  /**
   * Calculates optimal room combination for given requirements
   */
  static findOptimalRoomCombination(
    availableRooms: RoomAvailability[],
    requirements: GuestRequirements
  ): RoomAllocation[] {
    const result: RoomAllocation[] = [];
    let remainingAdults = requirements.adults;
    let remainingChildren = requirements.children;
    let remainingRooms = requirements.rooms;

    // Sort rooms by price and capacity efficiency
    const sortedRooms = [...availableRooms]
      .filter(room => room.isAvailable)
      .sort((a, b) => {
        // Sort by price per guest capacity (most efficient first)
        const efficiencyA = a.price / a.capacity.maxGuests;
        const efficiencyB = b.price / b.capacity.maxGuests;
        return efficiencyA - efficiencyB;
      });

    for (const room of sortedRooms) {
      if (remainingRooms <= 0 || (remainingAdults <= 0 && remainingChildren <= 0)) {
        break;
      }

      const adultsForRoom = Math.min(remainingAdults, room.capacity.maxAdults);
      const childrenForRoom = Math.min(remainingChildren, room.capacity.maxChildren);
      
      if (adultsForRoom > 0 || childrenForRoom > 0) {
        result.push({
          roomId: room.roomId,
          roomType: room.roomType,
          guests: {
            adults: adultsForRoom,
            children: childrenForRoom,
            total: adultsForRoom + childrenForRoom,
          },
          price: room.price,
        });

        remainingAdults -= adultsForRoom;
        remainingChildren -= childrenForRoom;
        remainingRooms--;
      }
    }

    return result;
  }

  /**
   * Validates room availability data integrity
   */
  static validateRoomData(rooms: RoomAvailability[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const room of rooms) {
      if (!room.roomId?.trim()) {
        errors.push(`Room ${room.roomId} has invalid ID`);
      }

      if (!room.roomType?.trim()) {
        errors.push(`Room ${room.roomId} has invalid type`);
      }

      if (room.capacity.maxGuests <= 0) {
        errors.push(`Room ${room.roomId} has invalid max guests capacity`);
      }

      if (room.capacity.maxAdults <= 0) {
        errors.push(`Room ${room.roomId} has invalid max adults capacity`);
      }

      if (room.price < 0) {
        errors.push(`Room ${room.roomId} has invalid price`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default RoomAvailabilityModel;
