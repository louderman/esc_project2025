import express, { Router, Request, Response, NextFunction } from 'express';
import { Hotel } from '../../types/Hotel';
import { type Destination } from '../../types/Destination';
import { getByUid } from '../models/destination';
import axios, { AxiosError } from 'axios';
import { validateHotelParams } from '../validators/hotelValidator';

const router: Router = express.Router();

// Constants
const HOTEL_API_BASE_URL = 'https://hotelapi.loyalty.dev/api/hotels';
const API_TIMEOUT_MS = 5000;

// Type Definitions
interface HotelApiResponse {
  destination: Destination;
  hotels: Hotel[];
  metadata: {
    hotelCount: number;
    destinationType: string;
  };
}

interface ErrorResponse {
  error: string;
  details?: string;
  validationErrors?: Record<string, string>;
}

/**
 * Fetches combined hotel and destination data
 */
const fetchHotelData = async (uid: string): Promise<HotelApiResponse> => {
  const destination = await getByUid(uid);
  if (!destination) {
    throw new Error('Destination not found');
  }

  const response = await axios.get<Hotel[]>(`${HOTEL_API_BASE_URL}?destination_id=${uid}`, {
    timeout: API_TIMEOUT_MS,
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip,deflate,compress'
    }
  });

  return {
    destination,
    hotels: response.data,
    metadata: {
      hotelCount: response.data.length,
      destinationType: destination.type
    }
  };
};

/**
 * Route handler for hotel queries
 */
const getHotelsHandler = async (
  req: Request<{ uid: string }>,
  res: Response<HotelApiResponse | ErrorResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { uid } = validateHotelParams(req.params);
    const result = await fetchHotelData(uid);
    res.json(result);
  } catch (error) {
    next(error); // Pass errors to the central error handler
  }
};

// Route Definitions
router.get('/query/:uid', (req, res, next) => {
  getHotelsHandler(req, res, next).catch(next);
});

export default router;