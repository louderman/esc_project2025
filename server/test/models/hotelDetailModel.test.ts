import { HotelDetailModel, HotelDetailData, ValidationResult } from '../../models/hotelDetailModel';

describe('Unit Test - Hotel Detail Model', () => {
  describe('TC_HOTELDETAILMODEL_1: Test hotel detail data validation', () => {
    
    // Test data setup
    const validHotelData: Partial<HotelDetailData> = {
      id: 'HOTEL123',
      name: 'Test Luxury Hotel',
      rating: 4.5,
      address: '123 Test Street, Singapore 123456',
      address1: '123 Test Street, Singapore 123456',
      description: 'A luxurious hotel with amazing amenities',
      amenities: {
        airConditioning: true,
        outdoorPool: true,
        continentalBreakfast: true,
        businessCenter: true,
        roomService: true,
      },
      price: {
        amount: 200,
        currency: 'SGD',
        perNight: true,
      },
      images: ['https://example.com/hotel1.jpg', 'https://example.com/hotel2.jpg'],
      latitude: 1.3521,
      longitude: 103.8198,
    };

    describe('Input: Valid hotel data with all required fields', () => {
      it('should create hotel object with all fields populated', () => {
        // Act
        const result = HotelDetailModel.validateAndFormat(validHotelData);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.data).toBeDefined();
        
        if (result.data) {
          expect(result.data.id).toBe('HOTEL123');
          expect(result.data.name).toBe('Test Luxury Hotel');
          expect(result.data.rating).toBe(4.5);
          expect(result.data.address).toBe('123 Test Street, Singapore 123456');
          expect(result.data.address1).toBe('123 Test Street, Singapore 123456');
          expect(result.data.description).toBe('A luxurious hotel with amazing amenities');
          expect(result.data.amenities).toEqual(validHotelData.amenities);
          expect(result.data.price).toEqual(validHotelData.price);
          expect(result.data.images).toEqual(validHotelData.images);
          expect(result.data.latitude).toBe(1.3521);
          expect(result.data.longitude).toBe(103.8198);
        }
      });

      it('should create hotel object using createFromRawData method', () => {
        // Act
        const hotel = HotelDetailModel.createFromRawData(validHotelData);

        // Assert
        expect(hotel).toBeDefined();
        expect(hotel!.id).toBe('HOTEL123');
        expect(hotel!.name).toBe('Test Luxury Hotel');
        expect(hotel!.rating).toBe(4.5);
      });
    });

    describe('Input: Hotel data missing required fields (id, name)', () => {
      it('should reject data missing hotel ID', () => {
        // Arrange
        const invalidData = { ...validHotelData };
        delete invalidData.id;

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Hotel ID is required');
        expect(result.data).toBeUndefined();
      });

      it('should reject data missing hotel name', () => {
        // Arrange
        const invalidData = { ...validHotelData };
        delete invalidData.name;

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Hotel name is required');
        expect(result.data).toBeUndefined();
      });

      it('should reject data with empty hotel ID', () => {
        // Arrange
        const invalidData = { ...validHotelData, id: '' };

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Hotel ID is required');
        expect(result.data).toBeUndefined();
      });

      it('should reject data with empty hotel name', () => {
        // Arrange
        const invalidData = { ...validHotelData, name: '' };

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Hotel name is required');
        expect(result.data).toBeUndefined();
      });

      it('should reject data with whitespace-only hotel ID', () => {
        // Arrange
        const invalidData = { ...validHotelData, id: '   ' };

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Hotel ID is required');
        expect(result.data).toBeUndefined();
      });

      it('should reject data with whitespace-only hotel name', () => {
        // Arrange
        const invalidData = { ...validHotelData, name: '   ' };

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Hotel name is required');
        expect(result.data).toBeUndefined();
      });

      it('should throw error when using createFromRawData with missing required fields', () => {
        // Arrange
        const invalidData = { ...validHotelData };
        delete invalidData.id;

        // Act & Assert
        expect(() => {
          HotelDetailModel.createFromRawData(invalidData);
        }).toThrow('Invalid hotel data: Hotel ID is required');
      });
    });

    describe('Input: Hotel data missing price details', () => {
      it('should reject data with missing price', () => {
        // Arrange
        const invalidData = { ...validHotelData };
        delete invalidData.price;

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Valid price details are required. Please go back to listing page and select new parameters.');
        expect(result.data).toBeUndefined();
      });

      it('should reject data with zero price amount', () => {
        // Arrange
        const invalidData = { 
          ...validHotelData, 
          price: { amount: 0, currency: 'SGD', perNight: true } 
        };

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Valid price details are required. Please go back to listing page and select new parameters.');
        expect(result.data).toBeUndefined();
      });

      it('should reject data with negative price amount', () => {
        // Arrange
        const invalidData = { 
          ...validHotelData, 
          price: { amount: -100, currency: 'SGD', perNight: true } 
        };

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Valid price details are required. Please go back to listing page and select new parameters.');
        expect(result.data).toBeUndefined();
      });

      it('should throw error when using createFromRawData with missing price details', () => {
        // Arrange
        const invalidData = { ...validHotelData };
        delete invalidData.price;

        // Act & Assert
        expect(() => {
          HotelDetailModel.createFromRawData(invalidData);
        }).toThrow('Invalid hotel data: Valid price details are required. Please go back to listing page and select new parameters.');
      });
    });

    describe('Input: Hotel data with invalid rating (negative or > 5)', () => {
      it('should clamp negative rating to 0', () => {
        // Arrange
        const invalidData = { ...validHotelData, rating: -2.5 };

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.data!.rating).toBe(0);
      });

      it('should clamp rating above 5 to 5', () => {
        // Arrange
        const invalidData = { ...validHotelData, rating: 7.8 };

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.data!.rating).toBe(5);
      });

      it('should keep valid rating within range unchanged', () => {
        // Arrange
        const validRatings = [0, 1, 2.5, 4, 5];

        validRatings.forEach(rating => {
          // Arrange
          const testData = { ...validHotelData, rating };

          // Act
          const result = HotelDetailModel.validateAndFormat(testData);

          // Assert
          expect(result.isValid).toBe(true);
          expect(result.data!.rating).toBe(rating);
        });
      });

      it('should handle undefined rating by defaulting to 0', () => {
        // Arrange
        const invalidData = { ...validHotelData };
        delete invalidData.rating;

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.data!.rating).toBe(0);
      });

      it('should handle null rating by defaulting to 0', () => {
        // Arrange
        const invalidData = { ...validHotelData, rating: null as any };

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.data!.rating).toBe(0);
      });
    });

    describe('Input: Hotel data with empty amenities object', () => {
      it('should create default amenities object when amenities is empty', () => {
        // Arrange
        const invalidData = { ...validHotelData, amenities: {} };

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.data!.amenities).toBeDefined();
        expect(result.data!.amenities.airConditioning).toBe(false);
        expect(result.data!.amenities.outdoorPool).toBe(false);
        expect(result.data!.amenities.continentalBreakfast).toBe(false);
      });

      it('should create default amenities object when amenities is undefined', () => {
        // Arrange
        const invalidData = { ...validHotelData };
        delete invalidData.amenities;

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.data!.amenities).toBeDefined();
        expect(result.data!.amenities.airConditioning).toBe(false);
        expect(result.data!.amenities.outdoorPool).toBe(false);
        expect(result.data!.amenities.continentalBreakfast).toBe(false);
      });

      it('should create default amenities object when amenities is null', () => {
        // Arrange
        const invalidData = { ...validHotelData, amenities: null as any };

        // Act
        const result = HotelDetailModel.validateAndFormat(invalidData);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.data!.amenities).toBeDefined();
        expect(result.data!.amenities.airConditioning).toBe(false);
        expect(result.data!.amenities.outdoorPool).toBe(false);
        expect(result.data!.amenities.continentalBreakfast).toBe(false);
      });

      it('should preserve valid amenities when provided', () => {
        // Arrange
        const validAmenities = {
          airConditioning: true,
          outdoorPool: true,
          continentalBreakfast: false,
          businessCenter: true,
        };
        const validData = { ...validHotelData, amenities: validAmenities };

        // Act
        const result = HotelDetailModel.validateAndFormat(validData);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.data!.amenities).toEqual(validAmenities);
        expect(result.data!.amenities.airConditioning).toBe(true);
        expect(result.data!.amenities.outdoorPool).toBe(true);
        expect(result.data!.amenities.continentalBreakfast).toBe(false);
      });
    });

    describe('Additional validation methods', () => {
      it('should validate coordinates correctly', () => {
        // Valid coordinates
        expect(HotelDetailModel.validateCoordinates(0, 0)).toBe(true);
        expect(HotelDetailModel.validateCoordinates(90, 180)).toBe(true);
        expect(HotelDetailModel.validateCoordinates(-90, -180)).toBe(true);
        expect(HotelDetailModel.validateCoordinates(45.5, -120.3)).toBe(true);

        // Invalid coordinates
        expect(HotelDetailModel.validateCoordinates(91, 0)).toBe(false);
        expect(HotelDetailModel.validateCoordinates(0, 181)).toBe(false);
        expect(HotelDetailModel.validateCoordinates(-91, 0)).toBe(false);
        expect(HotelDetailModel.validateCoordinates(0, -181)).toBe(false);

        // Undefined coordinates
        expect(HotelDetailModel.validateCoordinates(undefined, 0)).toBe(false);
        expect(HotelDetailModel.validateCoordinates(0, undefined)).toBe(false);
        expect(HotelDetailModel.validateCoordinates(undefined, undefined)).toBe(false);
      });

      it('should sanitize description text', () => {
        // Test HTML tag removal
        expect(HotelDetailModel.sanitizeDescription('<p>Hotel description</p>')).toBe('Hotel description');
        expect(HotelDetailModel.sanitizeDescription('<script>alert("xss")</script>Hotel description')).toBe('Hotel description');
        expect(HotelDetailModel.sanitizeDescription('<div><span>Hotel</span> <strong>description</strong></div>')).toBe('Hotel description');

        // Test empty/whitespace handling
        expect(HotelDetailModel.sanitizeDescription('')).toBe('');
        expect(HotelDetailModel.sanitizeDescription('   ')).toBe('');
        expect(HotelDetailModel.sanitizeDescription('  Hotel description  ')).toBe('Hotel description');

        // Test normal text
        expect(HotelDetailModel.sanitizeDescription('Hotel description')).toBe('Hotel description');
        expect(HotelDetailModel.sanitizeDescription('Hotel description with special chars: !@#$%^&*()')).toBe('Hotel description with special chars: !@#$%^&*()');
      });

      it('should update hotel detail data correctly', () => {
        // Arrange
        const existingData = HotelDetailModel.createFromRawData(validHotelData)!;
        const updates = {
          rating: 5.0,
          description: 'Updated description',
        };

        // Act
        const result = HotelDetailModel.updateHotelDetail(existingData, updates);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.data!.rating).toBe(5.0);
        expect(result.data!.description).toBe('Updated description');
        expect(result.data!.id).toBe('HOTEL123'); // Should remain unchanged
        expect(result.data!.name).toBe('Test Luxury Hotel'); // Should remain unchanged
      });

      it('should handle updates with invalid data', () => {
        // Arrange
        const existingData = HotelDetailModel.createFromRawData(validHotelData)!;
        const invalidUpdates = {
          rating: -5.0, // Invalid rating
          name: '', // Invalid name
        };

        // Act
        const result = HotelDetailModel.updateHotelDetail(existingData, invalidUpdates);

        // Assert
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Hotel name is required');
        expect(result.data).toBeUndefined();
      });
    });

    describe('Edge cases and error handling', () => {
      it('should handle data with only required fields', () => {
        // Arrange
        const minimalData = {
          id: 'MINIMAL123',
          name: 'Minimal Hotel',
          price: { amount: 100, currency: 'SGD', perNight: true },
        };

        // Act
        const result = HotelDetailModel.validateAndFormat(minimalData);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.data!.id).toBe('MINIMAL123');
        expect(result.data!.name).toBe('Minimal Hotel');
        expect(result.data!.rating).toBe(0); // Default rating
        expect(result.data!.address).toBe(''); // Default empty string
        expect(result.data!.address1).toBe(''); // Default empty string
        expect(result.data!.description).toBe(''); // Default empty string
        expect(result.data!.amenities).toBeDefined(); // Default amenities
        expect(result.data!.images).toEqual([]); // Default empty array
      });

      it('should handle data with whitespace in string fields', () => {
        // Arrange
        const dataWithWhitespace = {
          ...validHotelData,
          id: '  WHITESPACE123  ',
          name: '  Whitespace Hotel  ',
          address: '  123 Whitespace St  ',
        };

        // Act
        const result = HotelDetailModel.validateAndFormat(dataWithWhitespace);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.data!.id).toBe('WHITESPACE123');
        expect(result.data!.name).toBe('Whitespace Hotel');
        expect(result.data!.address).toBe('123 Whitespace St');
      });

      it('should handle data with null/undefined optional fields', () => {
        // Arrange
        const dataWithNulls = {
          ...validHotelData,
          latitude: null as any,
          longitude: undefined,
          images: null as any,
        };

        // Act
        const result = HotelDetailModel.validateAndFormat(dataWithNulls);

        // Assert
        expect(result.isValid).toBe(true);
        expect(result.data!.latitude).toBeNull();
        expect(result.data!.longitude).toBeUndefined();
        expect(result.data!.images).toEqual([]); // Should default to empty array
      });
    });
  });
});
