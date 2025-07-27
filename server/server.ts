import express from 'express';
import cors from 'cors';

console.log('Starting main server...');

const app = express();

app.use(cors());
app.use(express.json());

console.log('Setting up routes...');

// Basic test route
app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.json({ message: 'Main server is working!' });
});

// Test hotel detail route
app.get('/api/hotel-detail/test', (req, res) => {
  console.log('Hotel detail test route accessed');
  res.json({ message: 'Hotel detail route is working!' });
});

// Combined route to get both hotel details and prices
app.get('/api/hotel-detail/combined/:hotelId', async (req, res) => {
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

  console.log('Combined route accessed with hotelId:', hotelId);
  console.log('Query parameters:', req.query);

  if (!hotelId?.trim()) {
    return res.status(400).json({
      error: 'Missing hotel ID'
    });
  }

  try {
    const hotelUrl = `https://hotelapi.loyalty.dev/api/hotels/${hotelId}`;
    const pricesUrl = `https://hotelapi.loyalty.dev/api/hotels/${hotelId}/prices?${new URLSearchParams({
      destination_id: destination_id as string,
      checkin: checkin as string,
      checkout: checkout as string,
      lang: lang as string,
      currency: currency as string,
      country_code: country_code as string,
      guests: guests as string,
      partner_id: partner_id as string,
    })}`;

    console.log('Fetching hotel details from:', hotelUrl);
    console.log('Fetching prices from:', pricesUrl);

    // First, fetch hotel details
    const hotelResponse = await fetch(hotelUrl, {
      headers: { Accept: 'application/json' }
    });

    console.log('Hotel response status:', hotelResponse.status);

    if (!hotelResponse.ok) {
      const hotelErrorText = await hotelResponse.text();
      console.error('Hotel API error:', hotelResponse.status, hotelErrorText);
      throw new Error(`Hotel details API error: ${hotelResponse.status} - ${hotelErrorText}`);
    }

    const hotelData = await hotelResponse.json();
    console.log('Successfully fetched hotel data');

    // Then, try to fetch prices (but don't fail if prices aren't available)
    let pricesData = { rooms: [] };
    try {
      const pricesResponse = await fetch(pricesUrl, {
        headers: { Accept: 'application/json' }
      });

      console.log('Prices response status:', pricesResponse.status);

      if (pricesResponse.ok) {
        pricesData = await pricesResponse.json();
        console.log('Successfully fetched prices data');
      } else {
        console.log('Prices not available for this hotel/parameters, using empty prices');
        // Return hotel data with empty prices instead of failing
        pricesData = { rooms: [] };
      }
    } catch (pricesError) {
      console.log('Error fetching prices, using empty prices:', pricesError);
      // Continue with empty prices
      pricesData = { rooms: [] };
    }

    return res.json({
      hotel: hotelData,
      prices: pricesData
    });
  } catch (err) {
    console.error('[Combined Hotel API Fetch Error]', err);
    return res.status(500).json({
      error: 'Internal server error while fetching hotel data',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

app.listen(5001, () => {
  console.log('Main server listening on port 5001.');
  console.log('Available routes:');
  console.log('  GET /');
  console.log('  GET /api/hotel-detail/test');
  console.log('  GET /api/hotel-detail/combined/:hotelId');
});