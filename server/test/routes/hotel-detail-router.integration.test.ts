import request from 'supertest';
import app from '../../server';

// Mock fetch to control external API responses
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Integration Test - Hotel Detail Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
    (console.log as jest.Mock).mockRestore();
  });

  describe('ITC_HOTELDETAILROUTER_1: Test combined hotel detail endpoint', () => {
    it('should return status 200 with hotel details and pricing data for valid hotel ID', async () => {
      // Arrange - Mock successful responses
      const mockHotelData = {
        id: 'jOZC',
        name: 'Marina Bay Sands',
        rating: 4.5,
        description: 'Luxury hotel with iconic architecture',
        address: '10 Bayfront Avenue, Singapore',
        latitude: 1.2838,
        longitude: 103.8591,
        amenities: {
          wifi: true,
          pool: true,
          fitness: true
        }
      };

      const mockPricingData = {
        searchCompleted: true,
        completed: true,
        status: 'success',
        currency: 'SGD',
        hotels: [{
          id: 'jOZC',
          rooms: [
            {
              id: 'room1',
              room_type: 'Deluxe Room',
              price: 500,
              free_cancellation: true
            }
          ]
        }]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockHotelData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPricingData
        });

      // Act
      const response = await request(app)
        .get('/api/hotel-detail/combined/jOZC')
        .query({
          destination_id: 'RsBU',
          checkin: '2025-10-10',
          checkout: '2025-10-17',
          adults: '2',
          children: '0',
          rooms: '1'
        })
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('hotel');
      expect(response.body).toHaveProperty('prices');
      expect(response.body.hotel).toMatchObject(mockHotelData);
      expect(response.body.prices).toMatchObject(mockPricingData);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should return an empty array for invalid hotel ID', async () => {
      // Arrange - Mock hotel API failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Hotel not found'
      });

      // Act
      const response = await request(app)
        .get('/api/hotel-detail/combined/INVALID_HOTEL_ID')
        .query({
          destination_id: 'RsBU',
          checkin: '2025-10-10',
          checkout: '2025-10-17'
        })
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Internal server error');
    });

    it('should return an empty array for missing hotel ID parameter', async () => {
      // Act
      const response = await request(app)
        .get('/api/hotel-detail/combined/')
        .query({
          destination_id: 'RsBU',
          checkin: '2025-10-10',
          checkout: '2025-10-17'
        })
        .expect(404);

      // Assert - Route not found when hotel ID is missing
      expect(response.status).toBe(404);
    });

    it('should handle external API errors gracefully', async () => {
      // Arrange - Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Act
      const response = await request(app)
        .get('/api/hotel-detail/combined/jOZC')
        .query({
          destination_id: 'RsBU',
          checkin: '2025-10-10',
          checkout: '2025-10-17'
        })
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Internal server error');
    });
  });

  describe('ITC_HOTELDETAILROUTER_2: Test hotel-specific price endpoint', () => {
    it('should return status 200 with hotel pricing data for valid hotel ID with destination_id parameter', async () => {
      // Arrange - Mock successful destination-based API response
      const mockPricingData = {
        searchCompleted: true,
        completed: true,
        status: 'success',
        currency: 'SGD',
        hotels: [{
          id: 'jOZC',
          rooms: [
            {
              id: 'room1',
              room_type: 'Deluxe Room',
              price: 500,
              free_cancellation: true
            },
            {
              id: 'room2',
              room_type: 'Suite',
              price: 800,
              free_cancellation: true
            }
          ]
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPricingData
      });

      // Act
      const response = await request(app)
        .get('/api/hotel-detail/hotel/jOZC/prices')
        .query({
          destination_id: 'RsBU',
          checkin: '2025-10-10',
          checkout: '2025-10-17',
          adults: '2',
          children: '0',
          rooms: '1'
        })
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('hotels');
      expect(response.body.hotels).toHaveLength(1);
      expect(response.body.hotels[0].id).toBe('jOZC');
      expect(response.body.hotels[0].rooms).toHaveLength(2);
      expect(response.body.status).toBe('success');
    });

    it('should return status 200 with empty pricing array for hotel ID with no pricing data', async () => {
      // Arrange - Mock API response with no rooms
      const mockEmptyPricingData = {
        searchCompleted: true,
        completed: true,
        status: 'success',
        currency: 'SGD',
        hotels: [{
          id: 'jOZC',
          rooms: []
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyPricingData
      });

      // Act
      const response = await request(app)
        .get('/api/hotel-detail/hotel/jOZC/prices')
        .query({
          destination_id: 'RsBU',
          checkin: '2025-10-10',
          checkout: '2025-10-17'
        })
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('hotels');
      expect(response.body.hotels).toHaveLength(1);
      expect(response.body.hotels[0].rooms).toHaveLength(0);
      expect(response.body.status).toBe('success');
    });

    it('should return status 400 with error message for invalid destination_id parameter', async () => {
      // Act
      const response = await request(app)
        .get('/api/hotel-detail/hotel/jOZC/prices')
        .query({
          destination_id: '', // Invalid empty destination_id
          checkin: '2025-10-10',
          checkout: '2025-10-17'
        })
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required parameters');
    });

    it('should return status 400 with error message for missing required parameters', async () => {
      // Act - Missing checkin parameter
      const response = await request(app)
        .get('/api/hotel-detail/hotel/jOZC/prices')
        .query({
          destination_id: 'RsBU',
          checkout: '2025-10-17'
          // Missing checkin
        })
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required parameters');
    });

    it('should handle destination-based API failure and fallback to individual hotel endpoint', async () => {
      // Arrange - Mock destination API failure, then successful individual hotel API
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => 'Internal server error'
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            rooms: [
              {
                id: 'room1',
                room_type: 'Deluxe Room',
                price: 500,
                free_cancellation: true
              }
            ]
          })
        });

      // Act
      const response = await request(app)
        .get('/api/hotel-detail/hotel/jOZC/prices')
        .query({
          destination_id: 'RsBU',
          checkin: '2025-10-10',
          checkout: '2025-10-17'
        })
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('hotels');
      expect(response.body.hotels).toHaveLength(1);
      expect(response.body.hotels[0].rooms).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle both APIs failing and return empty rooms with appropriate message', async () => {
      // Arrange - Mock both APIs failing
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => 'Internal server error'
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          text: async () => 'Hotel not found'
        });

      // Act
      const response = await request(app)
        .get('/api/hotel-detail/hotel/jOZC/prices')
        .query({
          destination_id: 'RsBU',
          checkin: '2025-10-10',
          checkout: '2025-10-17'
        })
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Both price APIs failed');
    });

    it('should handle network errors gracefully', async () => {
      // Arrange - Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Act
      const response = await request(app)
        .get('/api/hotel-detail/hotel/jOZC/prices')
        .query({
          destination_id: 'RsBU',
          checkin: '2025-10-10',
          checkout: '2025-10-17'
        })
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('All price APIs failed');
    });
  });

  describe('Additional edge cases and error handling', () => {
    it('should handle malformed query parameters gracefully', async () => {
      // Act - Test with malformed date parameters
      const response = await request(app)
        .get('/api/hotel-detail/hotel/jOZC/prices')
        .query({
          destination_id: 'RsBU',
          checkin: 'invalid-date',
          checkout: '2025-10-17'
        })
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('error');
    });

    it('should handle missing hotel ID in prices endpoint', async () => {
      // Act
      const response = await request(app)
        .get('/api/hotel-detail/hotel//prices')
        .query({
          destination_id: 'RsBU',
          checkin: '2025-10-10',
          checkout: '2025-10-17'
        })
        .expect(404);

      // Assert
      expect(response.status).toBe(404);
    });

    it('should handle whitespace-only hotel ID', async () => {
      // Act
      const response = await request(app)
        .get('/api/hotel-detail/hotel/   /prices')
        .query({
          destination_id: 'RsBU',
          checkin: '2025-10-10',
          checkout: '2025-10-17'
        })
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing hotel ID');
    });
  });
});
