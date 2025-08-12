import { Hotel, Emenities } from '../../types/Hotel';

export interface HotelDetailData {
  id: string;
  name: string;
  rating: number;
  address: string;
  address1: string;
  description: string;
  amenities: Emenities;
  price?: {
    amount: number;
    currency: string;
    perNight: boolean;
  };
  images?: string[];
  latitude?: number;
  longitude?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: HotelDetailData;
}

export class HotelDetailModel {
  private static readonly DEFAULT_AMENITIES: Emenities = {
    airConditioning: false,
    dataPorts: false,
    parkingGarage: false,
    safe: false,
    businessCenter: false,
    childrenAllowed: false,
    clothingIron: false,
    dryCleaning: false,
    hairDryer: false,
    inHouseBar: false,
    inHouseDining: false,
    meetingRooms: false,
    miniBarInRoom: false,
    outdoorPool: false,
    roomService: false,
    sauna: false,
    tVInRoom: false,
    voiceMail: false,
    continentalBreakfast: false,
    kitchen: false,
  };

  /**
   * Validates and formats hotel detail data
   */
  static validateAndFormat(data: Partial<HotelDetailData>): ValidationResult {
    const errors: string[] = [];

    // Check required fields
    if (!data.id?.trim()) {
      errors.push('Hotel ID is required');
    }

    if (!data.name?.trim()) {
      errors.push('Hotel name is required');
    }

    // If missing required fields, return early
    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
      };
    }

    // Check price details - price is required for hotel details
    if (!data.price?.amount || data.price.amount <= 0) {
      errors.push('Valid price details are required. Please go back to listing page and select new parameters.');
      return {
        isValid: false,
        errors,
      };
    }

    // Validate and clamp rating to valid range (0-5)
    let rating = data.rating || 0;
    if (rating < 0) {
      rating = 0;
    } else if (rating > 5) {
      rating = 5;
    }

    // Handle empty amenities object
    let amenities = data.amenities;
    if (!amenities || Object.keys(amenities).length === 0) {
      amenities = this.DEFAULT_AMENITIES;
    }

    // Format the validated data with proper trimming
    const formattedData: HotelDetailData = {
      id: data.id!.trim(),
      name: data.name!.trim(),
      rating,
      address: (data.address || data.address1 || '').trim(),
      address1: (data.address1 || data.address || '').trim(),
      description: (data.description || '').trim(),
      amenities,
      price: data.price,
      images: data.images || [],
      latitude: data.latitude,
      longitude: data.longitude,
    };

    return {
      isValid: true,
      errors: [],
      data: formattedData,
    };
  }

  /**
   * Creates a hotel detail object from raw data
   */
  static createFromRawData(rawData: any): HotelDetailData | null {
    const validationResult = this.validateAndFormat(rawData);
    
    if (!validationResult.isValid) {
      throw new Error(`Invalid hotel data: ${validationResult.errors.join(', ')}`);
    }

    return validationResult.data!;
  }

  /**
   * Updates hotel detail data with new information
   */
  static updateHotelDetail(existingData: HotelDetailData, updates: Partial<HotelDetailData>): ValidationResult {
    const mergedData = { ...existingData, ...updates };
    return this.validateAndFormat(mergedData);
  }

  /**
   * Validates hotel coordinates
   */
  static validateCoordinates(latitude?: number, longitude?: number): boolean {
    if (latitude === undefined || longitude === undefined) {
      return false;
    }
    
    return latitude >= -90 && latitude <= 90 && 
           longitude >= -180 && longitude <= 180;
  }

  /**
   * Sanitizes hotel description text
   */
  static sanitizeDescription(description: string): string {
    if (!description) return '';
    
    // Remove potentially harmful HTML tags
    return description
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
}

export default HotelDetailModel;
