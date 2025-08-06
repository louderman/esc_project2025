import express from 'express';
import { CreateBookingRequest } from '../../types/Booking';
import { createBooking, getBookingById, updateBooking } from '../models/bookingModel';

const router = express.Router();

router.post('/', async (req, res) => {
    const bookingData: CreateBookingRequest = req.body;
    
    // Validate that userId and email are provided
    if (!bookingData.userId || !bookingData.email) {
        return res.status(400).json({ error: 'Missing required user fields: userId and email are required' });
    }
    
    try {
        const bookingId = await createBooking(bookingData);
        res.status(201).json({ bookingId });
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
        
        // Return 400 for validation errors, 500 for other errors
        if (error instanceof Error && (
            error.message.includes('Missing required') ||
            error.message.includes('Invalid booking data') ||
            error.message.includes('userId') ||
            error.message.includes('email') ||
            error.message.includes('booking address')
        )) {
            res.status(400).json({ error: errorMessage });
        } else {
            res.status(500).json({ error: errorMessage });
        }
    }
});

router.get('/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    try {
        const booking = await getBookingById(bookingId);
        if (booking) {
            res.json(booking);
        } else {
            res.status(404).json({ error: 'Booking not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve booking' });
    }
});

router.put('/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    const { paymentIntentId, status } = req.body;
    try {
        await updateBooking(bookingId, paymentIntentId, status);
        res.status(200).json({ message: 'Booking updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

export default router;
