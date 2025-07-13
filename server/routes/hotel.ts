// server/routes/hotel.ts
import express, { Router, Request, Response, NextFunction } from 'express';
import { Hotel } from '../../types/Hotel';
import { type Destination } from '../../types/Destination';
import { getByUid } from '../models/destination';
import axios, { AxiosError } from 'axios';
import { validateHotelParams } from '../validators/hotelValidator'; // Fixed import path

const router: Router = express.Router();

interface HotelApiResponse {
  destination: Destination;
  hotels: Hotel[];
  metadata?: {
    hotelCount: number;
    destinationType: string;
  };
}

interface ErrorResponse {
  error: string;
  details?: string;
  validationErrors?: Record<string, string>;
}

// Simplified handler without explicit Response generic
const getHotelsHandler = async (
  req: Request<{ uid: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = validateHotelParams(req.params);
    
    const destination = await getByUid(uid);
    if (!destination) {
      return res.status(404).json({ 
        error: 'Destination not found',
        details: `No destination found with UID: ${uid}`
      } as ErrorResponse);
    }

    const response = await axios.get<Hotel[]>(
      `https://hotelapi.loyalty.dev/api/hotels?destination_id=${uid}`,
      {
        timeout: 5000,
        headers: { 
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip,deflate,compress',
        }
      }
    );

    const result: HotelApiResponse = {
      destination,
      hotels: response.data,
      metadata: {
        hotelCount: response.data.length,
        destinationType: destination.type
      }
    };

    return res.json(result);
  } catch (error: unknown) {
    if (error instanceof Error && 'validationErrors' in error) {
      const validationError = error as { validationErrors?: Record<string, string> };
      return res.status(400).json({
        error: 'Validation Error',
        details: error.message,
        ...(validationError.validationErrors && { 
          validationErrors: validationError.validationErrors 
        })
      } as ErrorResponse);
    }

    if (axios.isAxiosError(error)) {
      console.error('Hotel API Error:', error.code, error.message);
      const statusCode = error.response?.status || 502;
      return res.status(statusCode).json({
        error: 'Hotel Service Error',
        details: error.response?.data?.message || error.message
      } as ErrorResponse);
    }

    console.error('Server Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.stack : 'Unknown error'
      })
    } as ErrorResponse);
  }
};

// Register route with simplified typing
router.get('/query/:uid', (req, res, next) => {
  getHotelsHandler(req, res, next).catch(next);
});

export default router;