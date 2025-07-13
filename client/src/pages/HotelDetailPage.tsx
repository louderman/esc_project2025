import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Hotel } from '../../../types/Hotel';
import type { PriceResponse, Price } from '../../../types/Price';
import './HotelDetailPage.css';

// Configure path aliases in tsconfig.json:
// {
//   "compilerOptions": {
//     "baseUrl": ".",
//     "paths": {
//       "@types/*": ["../types/*"]
//     }
//   }
// }

type HotelParams = {
  hotelId: string;
};

type ApiResponse = {
  hotel: Hotel;
  prices: PriceResponse;
};

export default function HotelDetailPage() {
  const { hotelId } = useParams<HotelParams>();
  const navigate = useNavigate();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const fetchHotelData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!hotelId?.trim()) {
          throw new Error('Hotel ID is required');
        }

        const response = await fetch(`/api/hotel/combined/${hotelId}`, {
          signal,
          headers: {
            'Accept': 'application/json',
            'X-Request-Source': 'hotel-detail-page'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed: ${response.status} - ${errorText.slice(0, 100)}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error(`Expected JSON response, got ${contentType}`);
        }

        const result = await response.json() as ApiResponse;

        // Data validation
        if (!result.hotel?.id || !result.prices?.hotels) {
          throw new Error('Invalid data structure from server');
        }

        setData(result);
      } catch (err) {
        if (signal.aborted) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to load hotel data';
        setError(errorMessage);
        console.error('Fetch error:', err);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchHotelData();

    return () => {
      abortController.abort();
    };
  }, [hotelId]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading hotel details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h3>Error Loading Hotel</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="error">No hotel data available</div>;
  }

  const { hotel, prices } = data;

  // Memoized amenities render
  const amenities = [
    { key: 'airConditioning', label: 'Air Conditioning' },
    { key: 'businessCenter', label: 'Business Center' },
    { key: 'dryCleaning', label: 'Dry Cleaning' },
    { key: 'hairDryer', label: 'Hair Dryer' },
    { key: 'inHouseBar', label: 'Bar' },
    { key: 'inHouseDining', label: 'Restaurant' },
    { key: 'miniBarInRoom', label: 'Mini Bar' },
    { key: 'outdoorPool', label: 'Outdoor Pool' },
    { key: 'roomService', label: 'Room Service' },
    { key: 'sauna', label: 'Sauna' },
    { key: 'tVInRoom', label: 'TV' },
    { key: 'continentalBreakfast', label: 'Breakfast' }
  ].filter(item => hotel.amenities?.[item.key as keyof typeof hotel.amenities])
   .map((item, index) => (
    <div key={`amenity-${index}`} className="amenity-item">
      {item.label}
    </div>
  ));

  return (
    <div className="hotel-detail-container">
      <button 
        onClick={() => navigate(-1)} 
        className="back-button"
        aria-label="Back to previous page"
      >
        ← Back to Hotels
      </button>

      <header className="hotel-header">
        <h1>{hotel.name}</h1>
        {hotel.rating && (
          <div className="rating" aria-label={`Rating: ${hotel.rating} out of 5`}>
            <span className="rating-value">{hotel.rating}</span>
            <span className="rating-max">/5</span>
          </div>
        )}
      </header>

      {hotel.imgix_url && (
        <div className="hotel-gallery">
          <img
            src={`${hotel.imgix_url}${hotel.default_image_index || 0}${hotel.image_details?.suffix || ''}`}
            alt={hotel.name}
            className="main-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/hotel-placeholder.jpg';
            }}
          />
        </div>
      )}

      <section className="hotel-info">
        <div className="address">
          <h3>Address</h3>
          <p>{hotel.address1 || hotel.address || 'Address not available'}</p>
        </div>

        <div className="description">
          <h3>Description</h3>
          <p>{hotel.description || 'No description available.'}</p>
        </div>

        {hotel.trustyou?.score && (
          <GuestScores scores={hotel.trustyou.score} />
        )}
      </section>

      <section className="amenities">
        <h3>Amenities</h3>
        <div className="amenities-grid">
          {amenities}
        </div>
      </section>

      <RoomPrices prices={prices} />
    </div>
  );
}

// Extracted components with proper typing
type GuestScoresProps = {
  scores: NonNullable<Hotel['trustyou']>['score'];
};

function GuestScores({ scores }: GuestScoresProps) {
  const scoreItems = [
    { key: 'overall', label: 'Overall' },
    { key: 'solo', label: 'Solo Travelers' },
    { key: 'couple', label: 'Couples' },
    { key: 'family', label: 'Families' },
    { key: 'business', label: 'Business' }
  ].filter(item => scores[item.key as keyof typeof scores] !== null);

  return (
    <div className="trustyou-scores">
      <h3>Guest Ratings</h3>
      <div className="scores-grid">
        {scoreItems.map((item) => (
          <div key={item.key} className="score-item">
            <span>{item.label}</span>
            <span>{scores[item.key as keyof typeof scores]}/10</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type RoomPricesProps = {
  prices: PriceResponse;
};

function RoomPrices({ prices }: RoomPricesProps) {
  return (
    <section className="prices">
      <h3>Available Rooms</h3>
      {prices.hotels?.length ? (
        <div className="price-list">
          {prices.hotels.map((price: Price, index: number) => (
            <PriceCard key={`${price.id}-${index}`} price={price} />
          ))}
        </div>
      ) : (
        <p>No pricing information available</p>
      )}
    </section>
  );
}

type PriceCardProps = {
  price: Price;
};

function PriceCard({ price }: PriceCardProps) {
  return (
    <div className="price-item">
      <div className="price-header">
        <span className="price-type">{price.price_type}</span>
        {price.free_cancellation && (
          <span className="cancellation-badge">Free Cancellation</span>
        )}
      </div>
      <div className="price-details">
        <div className="price-numbers">
          <span className="price-amount">${price.price?.toFixed(2) || '0.00'}</span>
          <span className="price-night">per night</span>
        </div>
        {price.rooms_available !== undefined && (
          <div className="price-availability">
            {price.rooms_available} rooms available
          </div>
        )}
      </div>
    </div>
  );
}