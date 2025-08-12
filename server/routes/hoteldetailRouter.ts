import express, { Request, Response } from 'express';
import { PriceResponse } from '../../types/Price';
import fs from 'fs';
import path from 'path';
import { ParsedQs } from 'qs';

const router = express.Router();

// Test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Hotel detail router is working', timestamp: new Date().toISOString() });
});

// Define the error response type for reusability
interface ErrorResponse {
  searchCompleted: boolean | null;
  completed: boolean;
  status: string;
  currency: string | null;
  hotels: any[];
}

// Route to get hotel details by ID
router.get('/hotel/:hotelId', async (req, res) => {
  const { hotelId } = req.params;

  if (!hotelId?.trim()) {
    return res.status(400).json({
      error: 'Missing hotel ID'
    });
  }

  const url = `https://hotelapi.loyalty.dev/api/hotels/${hotelId}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[Hotel Detail API Error] ${response.status}: ${text}`);
      return res.status(response.status).json({
        error: `Upstream error: ${response.status}`
      });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('[Hotel Detail API Fetch Error]', err);
    return res.status(500).json({
      error: 'Internal server error while fetching hotel details'
    });
  }
});

// Route to get hotel prices by ID - using the working destination-based API with fallback
router.get('/hotel/:hotelId/prices', async (req, res) => {
  const { hotelId } = req.params;
  const { 
    destination_id, 
    checkin, 
    checkout, 
    lang = 'en_US', 
    currency = 'SGD', 
    country_code = 'SG', 
    guests = '2'
  } = req.query;

  if (!hotelId?.trim()) {
    return res.status(400).json({
      error: 'Missing hotel ID'
    });
  }

  if (!destination_id || !checkin || !checkout) {
    return res.status(400).json({
      error: 'Missing required parameters: destination_id, checkin, checkout'
    });
  }

  // Primary approach: Use the reliable destination-based API
  const destinationUrl = `https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&lang=${lang}&currency=${currency}&country_code=${country_code}&guests=${guests}&partner_id=1089&landing_page=wl-acme-earn&product_type=earn`;
  
  console.log('Calling external API URL (destination-based):', destinationUrl);

  try {
    const response = await fetch(destinationUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[Hotel Price API Error] ${response.status}: ${text}`);
      
      // Fallback to individual hotel endpoint
      console.log('Destination-based API failed, trying individual hotel endpoint as fallback...');
      return await tryIndividualHotelEndpoint(hotelId, destination_id, checkin, checkout, lang, currency, country_code, guests, res);
    }
    
    console.log(`External API response status: ${response.status}`);

    const data = await response.json();
    console.log('External API response:', JSON.stringify(data, null, 2));
    
    // Validate the response structure
    if (!data || !data.hotels || !Array.isArray(data.hotels)) {
      console.error('Invalid API response structure:', data);
      return res.status(500).json({
        error: 'Invalid response from price API',
        message: 'Price data format is invalid'
      });
    }
    
    // Find the specific hotel in the destination results
    const targetHotel = data.hotels?.find((hotel: any) => hotel.id === hotelId);
    
    if (targetHotel && targetHotel.rooms && Array.isArray(targetHotel.rooms)) {
      console.log(`Found ${targetHotel.rooms.length} rooms for hotel ${hotelId}`);
      return res.json({
        searchCompleted: data.searchCompleted,
        completed: data.completed,
        status: data.status,
        currency: data.currency,
        hotels: [{
          id: hotelId,
          rooms: targetHotel.rooms
        }]
      });
    }
    
    // If hotel not found in destination results, try individual endpoint as fallback
    console.log(`Hotel ${hotelId} not found in destination results, trying individual endpoint...`);
    return await tryIndividualHotelEndpoint(hotelId, destination_id, checkin, checkout, lang, currency, country_code, guests, res);
    
  } catch (err) {
    console.error('[Hotel Price API Fetch Error]', err);
    
    // Final fallback to individual hotel endpoint
    console.log('Destination-based API failed with error, trying individual hotel endpoint as final fallback...');
    return await tryIndividualHotelEndpoint(hotelId, destination_id, checkin, checkout, lang, currency, country_code, guests, res);
  }
});

// Helper function to try individual hotel endpoint as fallback
async function tryIndividualHotelEndpoint(
  hotelId: string, 
  destination_id: string | ParsedQs | (string | ParsedQs)[], 
  checkin: string | ParsedQs | (string | ParsedQs)[], 
  checkout: string | ParsedQs | (string | ParsedQs)[], 
  lang: string | ParsedQs | (string | ParsedQs)[], 
  currency: string | ParsedQs | (string | ParsedQs)[], 
  country_code: string | ParsedQs | (string | ParsedQs)[], 
  guests: string | ParsedQs | (string | ParsedQs)[], 
  res: any
) {
  // Convert query parameters to strings
  const destId = Array.isArray(destination_id) ? destination_id[0] : destination_id;
  const checkinDate = Array.isArray(checkin) ? checkin[0] : checkin;
  const checkoutDate = Array.isArray(checkout) ? checkout[0] : checkout;
  const langParam = Array.isArray(lang) ? lang[0] : lang;
  const currencyParam = Array.isArray(currency) ? currency[0] : currency;
  const countryCodeParam = Array.isArray(country_code) ? country_code[0] : country_code;
  const guestsParam = Array.isArray(guests) ? guests[0] : guests;
  
  const individualUrl = `https://hotelapi.loyalty.dev/api/hotels/${hotelId}/price?destination_id=${destId}&checkin=${checkinDate}&checkout=${checkoutDate}&lang=${langParam}&currency=${currencyParam}&country_code=${countryCodeParam}&guests=${guestsParam}&partner_id=1089&landing_page=wl-acme-earn&product_type=earn`;
  
  console.log('Trying individual hotel endpoint as fallback:', individualUrl);
  
  try {
    const fallbackResponse = await fetch(individualUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!fallbackResponse.ok) {
      const text = await fallbackResponse.text();
      console.error(`[Individual Hotel Price API Fallback Error] ${fallbackResponse.status}: ${text}`);
      return res.status(fallbackResponse.status).json({
        error: `Both price APIs failed`,
        message: 'Price service unavailable from all sources'
      });
    }

    const fallbackData = await fallbackResponse.json();
    console.log('Individual hotel endpoint fallback response:', JSON.stringify(fallbackData, null, 2));
    
    // Handle individual hotel endpoint response format
    if (fallbackData.rooms && Array.isArray(fallbackData.rooms)) {
      console.log(`Fallback found ${fallbackData.rooms.length} rooms for hotel ${hotelId}`);
      return res.json({
        searchCompleted: fallbackData.searchCompleted,
        completed: fallbackData.completed,
        status: fallbackData.status,
        currency: fallbackData.currency,
        hotels: [{
          id: hotelId,
          rooms: fallbackData.rooms
        }]
      });
    }
    
    // If individual endpoint also fails, return empty rooms
    console.log('Individual hotel endpoint also failed to return rooms');
    return res.json({
      searchCompleted: false,
      completed: false,
      status: 'no_rooms',
      currency: fallbackData.currency,
      hotels: [{
        id: hotelId,
        rooms: []
      }],
      message: `No rooms available for hotel ${hotelId} from any source`
    });
    
  } catch (fallbackErr) {
    console.error('[Individual Hotel Price API Fallback Error]', fallbackErr);
    return res.status(500).json({
      error: 'All price APIs failed',
      message: 'Price service completely unavailable'
    });
  }
}

// Combined route to get both hotel details and prices
router.get('/combined/:hotelId', async (req, res) => {
  const { hotelId } = req.params;
  const { 
    destination_id, 
    checkin, 
    checkout, 
    lang = 'en_US', 
    currency = 'SGD', 
    country_code = 'SG', 
    guests = '2', 
    partner_id = '1' 
  } = req.query;

  if (!hotelId?.trim()) {
    return res.status(400).json({
      error: 'Missing hotel ID'
    });
  }

  try {
    // Fetch hotel details (like hotel router)
    const hotelUrl = `https://hotelapi.loyalty.dev/api/hotels/${hotelId}`;
    const hotelResponse = await fetch(hotelUrl);
    const hotelData = await hotelResponse.json();

    // Fetch prices (like hotel price router)
    const priceUrl = `https://hotelapi.loyalty.dev/api/hotels/prices?destination_id=${destination_id}&checkin=${checkin}&checkout=${checkout}&lang=${lang}&currency=${currency}&country_code=${country_code}&guests=${guests}&partner_id=1089&landing_page=wl-acme-earn&product_type=earn`;
    const priceResponse = await fetch(priceUrl);
    const pricesData = await priceResponse.json();

    return res.json({
      hotel: hotelData,
      prices: pricesData
    });
  } catch (err) {
    console.error('[Combined Hotel API Fetch Error]', err);
    return res.status(500).json({
      error: 'Internal server error while fetching hotel data'
    });
  }
});

export { router };