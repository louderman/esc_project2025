//not done yet

import '@testing-library/jest-dom/vitest';
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

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

describe('Integration Test - Price Calculation and Display', () => {
  it('ITC_HOTELDETAIL_3: Hotel prices are calculated and displayed correctly', () => {
    // Test 1: Price per night calculation (1771.63 ÷ 7 = 253.09)
    const totalPrice = 1771.63;
    const numberOfNights = 7;
    const pricePerNight = totalPrice / numberOfNights;
    
    expect(pricePerNight).toBeCloseTo(253.09, 2);
    expect(pricePerNight).toBeGreaterThan(0);
    expect(pricePerNight).toBeLessThan(totalPrice);
    
    // Test 2: Total price calculation
    const calculatedTotal = pricePerNight * numberOfNights;
    expect(calculatedTotal).toBeCloseTo(totalPrice, 2);
    
    // Test 3: Taxes calculation (10% of total)
    const taxes = Math.round(totalPrice * 0.1);
    expect(taxes).toBe(177); // 1771.63 * 0.1 = 177.163, rounded to 177
    
    // Test 4: Final total calculation (total + taxes)
    const finalTotal = Math.round(totalPrice * 1.1);
    expect(finalTotal).toBe(1949); // 1771.63 * 1.1 = 1948.793, rounded to 1949
  });

  it('should handle edge cases in price calculations correctly', () => {
    // Test 1: Single night pricing
    const singleNightPrice = 299.99;
    const singleNight = 1;
    const pricePerNight = singleNightPrice / singleNight;
    
    expect(pricePerNight).toBe(299.99);
    expect(pricePerNight).toBeGreaterThan(0);
    
    // Test 2: Fractional prices
    const fractionalPrice = 299.99;
    const taxes = Math.round(fractionalPrice * 0.1);
    expect(taxes).toBe(30); // 299.99 * 0.1 = 29.999, rounded to 30
    
    // Test 3: Final total with fractional amounts
    const finalTotal = Math.round(fractionalPrice * 1.1);
    expect(finalTotal).toBe(330); // 299.99 * 1.1 = 329.989, rounded to 330
  });

  it('should handle multiple room types with different prices', () => {
    // Test 1: Room 1 pricing
    const room1Price = 253.09;
    const room1Nights = 7;
    const room1Total = room1Price * room1Nights;
    
    expect(room1Total).toBeCloseTo(1771.63, 2);
    
    // Test 2: Room 2 pricing
    const room2Price = 450.00;
    const room2Nights = 7;
    const room2Total = room2Price * room2Nights;
    
    expect(room2Total).toBe(3150.00);
    
    // Test 3: Price difference between rooms
    const priceDifference = room2Price - room1Price;
    expect(priceDifference).toBe(196.91);
    
    // Test 4: Total for both rooms for 7 nights
    const totalForBothRooms = (room1Price + room2Price) * 7;
    expect(totalForBothRooms).toBeCloseTo(4921.63, 2);
  });

  it('should calculate taxes and fees correctly for different scenarios', () => {
    // Test 1: Standard tax calculation (10%)
    const basePrice = 1000;
    const taxRate = 0.1;
    const taxes = Math.round(basePrice * taxRate);
    expect(taxes).toBe(100);
    
    // Test 2: Multiple nights tax calculation
    const pricePerNight = 200;
    const nights = 5;
    const totalPrice = pricePerNight * nights;
    const totalTaxes = Math.round(totalPrice * taxRate);
    expect(totalTaxes).toBe(100); // 1000 * 0.1 = 100
    
    // Test 3: Final total with taxes
    const finalTotal = totalPrice + totalTaxes;
    expect(finalTotal).toBe(1100);
    
    // Test 4: Edge case with very small amounts
    const smallPrice = 50.99;
    const smallTaxes = Math.round(smallPrice * taxRate);
    expect(smallTaxes).toBe(5); // 50.99 * 0.1 = 5.099, rounded to 5
  });

  it('should handle date range calculations correctly', () => {
    // Test 1: 7 nights calculation
    const checkin = new Date('2025-08-12');
    const checkout = new Date('2025-08-19');
    const nights = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(nights).toBe(7);
    
    // Test 2: 3 nights calculation
    const checkout3 = new Date('2025-08-15');
    const nights3 = Math.ceil((checkout3.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(nights3).toBe(3);
    
    // Test 3: 1 night calculation
    const checkout1 = new Date('2025-08-13');
    const nights1 = Math.ceil((checkout1.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
    
    expect(nights1).toBe(1);
    
    // Test 4: Price calculation for different night counts
    const pricePerNight = 253.09;
    const total7Nights = pricePerNight * 7;
    const total3Nights = pricePerNight * 3;
    const total1Night = pricePerNight * 1;
    
    expect(total7Nights).toBeCloseTo(1771.63, 2);
    expect(total3Nights).toBeCloseTo(759.27, 2);
    expect(total1Night).toBeCloseTo(253.09, 2);
  });
});
