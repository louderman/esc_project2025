// Guest Information Interface - as per Feature 4 requirements
export interface GuestInformation {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  specialRequests?: string; // Max 250 characters
}

// Payment Information Interface - PCI Compliant (transient data only)
export interface PaymentInformation {
  paymentIntentId?: string; // Stripe payment intent ID
  payeeId?: string; // Non-PII payee reference for tracking
  maskedCardNumber?: string; // Only first 6 & last 4 digits (e.g., "1234 56** **** 7890")
  cardExpiryDate?: string; // MM/YY format
  // Note: CVV should never be stored - transient only during payment processing
}

// Selected Room Information Interface
export interface SelectedRoomInfo {
  id: string;
  room_type: string;
  roomType?: string; // For backward compatibility
  price: number;
  totalPrice?: number;
  free_cancellation: boolean;
  occupancy: number;
  bed_type: string;
  size: string;
  description: string;
  amenities: string[];
  image?: string;
}

// Booking Display Information - as per Feature 4 specification
export interface BookingDisplayInformation {
  destinationId: string; // Required as per specification
  hotelId: string;
  numberOfNights: number;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  messageToHotel?: string; // Max 250 characters
  roomTypes: string[];
}

// Core Booking Data - updated for compliance
// Guest Information Interface - as per Feature 4 requirements
export interface GuestInformation {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  specialRequests?: string; // Max 250 characters
}

// Payment Information Interface - PCI Compliant (transient data only)
export interface PaymentInformation {
  paymentIntentId?: string; // Stripe payment intent ID
  payeeId?: string; // Non-PII payee reference for tracking
  maskedCardNumber?: string; // Only first 6 & last 4 digits (e.g., "1234 56** **** 7890")
  cardExpiryDate?: string; // MM/YY format
  // Note: CVV should never be stored - transient only during payment processing
}

// Selected Room Information Interface
export interface SelectedRoomInfo {
  id: string;
  room_type: string;
  roomType?: string; // For backward compatibility
  price: number;
  totalPrice?: number;
  free_cancellation: boolean;
  occupancy: number;
  bed_type: string;
  size: string;
  description: string;
  amenities: string[];
  image?: string;
}

// Booking Display Information - as per Feature 4 specification
export interface BookingDisplayInformation {
  destinationId: string; // Required as per specification
  hotelId: string;
  numberOfNights: number;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  messageToHotel?: string; // Max 250 characters
  roomTypes: string[];
}

// Core Booking Data - updated for compliance
export interface BookingData {
  id: string; // System's booking ID
  bookingReference: string; // User-facing booking reference
  id: string; // System's booking ID
  bookingReference: string; // User-facing booking reference
  userId: string;
  
  // Destination Information
  destinationId?: string; // Optional for backward compatibility
  
  // Hotel Information
  
  // Destination Information
  destinationId?: string; // Optional for backward compatibility
  
  // Hotel Information
  hotelId: string;
  hotelName: string;
  hotelAddress: string;
  imageUrl: string;
  
  // Booking Details
  hotelAddress: string;
  imageUrl: string;
  
  // Booking Details
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfRooms: number;
  adults: number;
  children: number;
  roomTypes: string[]; // Contains room type information
  
  // Pricing
  pricePerNight: number;
  totalAmount: number;
  whatsIncluded: string[];
  
  // Guest Information
  guestInformation: GuestInformation;
  
  // Payment Information (PCI Compliant)
  paymentInformation: PaymentInformation;
  
  // Booking Status
  
  // Guest Information
  guestInformation: GuestInformation;
  
  // Payment Information (PCI Compliant)
  paymentInformation: PaymentInformation;
  
  // Booking Status
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt?: Date;
  updatedAt?: Date;
}

// Create Booking Request - updated for compliance
// Create Booking Request - updated for compliance
export interface CreateBookingRequest {
  userId: string;
  
  // Destination Information
  destinationId?: string; // Optional for backward compatibility, but recommended
  
  // Hotel Information
  
  // Destination Information
  destinationId?: string; // Optional for backward compatibility, but recommended
  
  // Hotel Information
  hotelId: string;
  hotelName: string;
  hotelAddress: string;
  imageUrl: string;
  
  // Booking Details
  hotelAddress: string;
  imageUrl: string;
  
  // Booking Details
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfRooms: number;
  adults: number;
  children: number;
  roomTypes: string[]; // Contains room type information
  messageToHotel?: string; // Max 250 characters
  
  // Pricing
  pricePerNight: number;
  totalAmount: number;
  whatsIncluded: string[];
  
  // Guest Information
  guestInformation: GuestInformation;
}

// Billing Address Interface - separate from booking data
export interface BillingAddress {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  emailAddress: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Payment Processing Request - transient data only
export interface PaymentProcessingRequest {
  bookingId: string;
  amount: number;
  currency: string;
  billingAddress: BillingAddress;
  // Card details should never be stored - handled by Stripe
  
  // Guest Information
  guestInformation: GuestInformation;
}

// Billing Address Interface - separate from booking data
export interface BillingAddress {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  emailAddress: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Payment Processing Request - transient data only
export interface PaymentProcessingRequest {
  bookingId: string;
  amount: number;
  currency: string;
  billingAddress: BillingAddress;
  // Card details should never be stored - handled by Stripe
}
