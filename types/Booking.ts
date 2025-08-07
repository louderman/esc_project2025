export interface BookingData {
  id: string;
  hotelId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guests: string;
  pricePerNight: number;
  numberOfNights: number;
  totalAmount: number;
  whatsIncluded: string[];
  imageUrl: string;
  paymentIntentId?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

export interface CreateBookingRequest {
  hotelId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guests: string;
  pricePerNight: number;
  numberOfNights: number;
  totalAmount: number;
  whatsIncluded: string[];
  imageUrl: string;
}
