import express from 'express';
import { CreateBookingRequest } from '../../types/Booking';
import { createBooking, getBookingById, updateBooking } from '../models/bookingModel';

const router = express.Router();

router.post('/', async (req, res) => {
    const bookingData: CreateBookingRequest = req.body;
    try {
        const bookingId = await createBooking(bookingData);
        res.status(201).json({ bookingId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create booking' });
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
