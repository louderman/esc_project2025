import express, { Request, Response, Router, RequestHandler } from 'express';
import { pool } from '../database/db';
import { Hotel } from '../../types/Hotel';
import { RowDataPacket } from 'mysql2';

interface Destination extends RowDataPacket {
  id: number;
  dest_id: string;
  term: string;
  lat: number;
  lng: number;
  type: string;
  state: string | null;
}

const router = express.Router();

// 1. Properly typed handler that satisfies Express's RequestHandler
const handleHotelRequest: RequestHandler<{ dest_id: string }> = async (req, res, next) => {
  try {
    const { dest_id } = req.params;
    
    // 2. Type-safe MySQL query
    const [destRows] = await pool.query<Destination[]>(
      'SELECT * FROM destination WHERE dest_id = ?', 
      [dest_id]
    );
    
    if (!Array.isArray(destRows) || destRows.length === 0) {
      res.status(404).json({ error: 'Destination not found' });
      return;
    }

  const url = `https://hotelapi.loyalty.dev/api/hotels?destination_id=${dest_id}`;

  const response = await fetch(url);
  const data: Hotel[] = await response.json();
  // console.log(data);
  console.log('called');

  res.send(data);
});

export { router };
