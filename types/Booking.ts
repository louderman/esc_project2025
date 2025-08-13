export interface BookingData {
  id: string;
  userId: string;
  email: string;
  hotelId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guests: string;
  pricePerNight: number;
  numberOfNights: number;
  numberOfRooms: number;
  totalAmount: number;
  whatsIncluded: string[];
  imageUrl: string;
  bookingAddress: string;
  paymentIntentId?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

export interface CreateBookingRequest {
  userId: string;
  email: string;
  hotelId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  guests: string;
  pricePerNight: number;
  numberOfNights: number;
  numberOfRooms: number;
  totalAmount: number;
  whatsIncluded: string[];
  imageUrl: string;
  bookingAddress: string;
}
