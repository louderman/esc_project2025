import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react'; // Explicit type-only import
import { useParams, useNavigate } from 'react-router-dom';
import type { Hotel } from '../../../types/Hotel';
import type { PriceResponse, Price } from '../../../types/Price';
import './HotelDetailPage.css';

// Type definitions
type HotelParams = {
  hotelId: string;
};

type ApiResponse = {
  hotel: Hotel;
  prices: PriceResponse;
};

// Sub-component: GuestScores
type GuestScoresProps = {
  scores: NonNullable<Hotel['trustyou']>['score'];
};

const GuestScores = ({ scores }: GuestScoresProps): ReactNode => {
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
};

// Sub-component: PriceCard
type PriceCardProps = {
  price: Price;
};

const PriceCard = ({ price }: PriceCardProps): ReactNode => {
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
};

// Sub-component: RoomPrices
type RoomPricesProps = {
  prices: PriceResponse;
};

const RoomPrices = ({ prices }: RoomPricesProps): ReactNode => {
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
};

// Main Component
const HotelDetailPage = (): ReactNode => {
  const { hotelId } = useParams<HotelParams>();
  const navigate = useNavigate();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`/api/hotel/combined/${hotelId}`, {
          signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Request-Source': 'hotel-detail-page'
          }
        });

        if (response.status === 401) {
          navigate('/login');
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Request failed: ${response.status} - ${errorText.slice(0, 100)}`);
        }

        const result = await response.json() as ApiResponse;
        setData(result);
      } catch (err) {
        if (signal.aborted) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to load hotel data';
        setError(errorMessage);
        if (errorMessage.includes('401')) navigate('/login');
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    fetchHotelData();
    return () => abortController.abort();
  }, [hotelId, navigate]);

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;
  if (!data) return <div className="error">No data available</div>;

  const { hotel, prices } = data;

  const amenities = [
    { key: 'airConditioning', label: 'Air Conditioning' },
    // ... other amenities
  ].filter(item => hotel.amenities?.[item.key as keyof typeof hotel.amenities])
   .map((item, index) => (
    <div key={`amenity-${index}`} className="amenity-item">{item.label}</div>
  ));

  return (
    <div className="hotel-detail-container">
      {/* All your JSX remains the same */}
    </div>
  );
};

export default HotelDetailPage;