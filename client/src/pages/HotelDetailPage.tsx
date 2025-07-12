import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Hotel } from '/Users/mandarjoshi/Desktop/SUTD-Term-5/ElementsOfSoftwareConstruction/ProjectStuff/esc_project2025/types/Hotel.ts';
import type { PriceResponse } from '/Users/mandarjoshi/Desktop/SUTD-Term-5/ElementsOfSoftwareConstruction/ProjectStuff/esc_project2025/types/Price.ts';
import '/Users/mandarjoshi/Desktop/SUTD-Term-5/ElementsOfSoftwareConstruction/ProjectStuff/esc_project2025/client/src/pages/HotelDetailPage.css';

type HotelParams = {
  hotelId: string;
};

export default function HotelDetailPage() {
  const { hotelId } = useParams<HotelParams>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [prices, setPrices] = useState<PriceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!hotelId) {
          throw new Error('Hotel ID is missing');
        }

        // Fetch hotel details
        const hotelResponse = await fetch(`/api/hotel/query/${hotelId}`);
        if (!hotelResponse.ok) throw new Error('Failed to fetch hotel details');
        const hotelData = await hotelResponse.json() as Hotel[];
        if (!hotelData?.length) throw new Error('Hotel not found');
        setHotel(hotelData[0]);

        // Fetch prices
        const priceResponse = await fetch(`/api/hotel-price/query/${hotelId}`);
        if (!priceResponse.ok) throw new Error('Failed to fetch prices');
        const priceData = await priceResponse.json() as PriceResponse;
        setPrices(priceData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelData();
  }, [hotelId]);

  if (loading) {
    return <div className="loading">Loading hotel details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!hotel) {
    return <div className="error">Hotel not found</div>;
  }

  // Helper function to render amenities
  const renderAmenities = () => {
    const amenities = [];
    if (hotel.amenities?.airConditioning) amenities.push('Air Conditioning');
    if (hotel.amenities?.businessCenter) amenities.push('Business Center');
    if (hotel.amenities?.dryCleaning) amenities.push('Dry Cleaning');
    if (hotel.amenities?.hairDryer) amenities.push('Hair Dryer');
    if (hotel.amenities?.inHouseBar) amenities.push('Bar');
    if (hotel.amenities?.inHouseDining) amenities.push('Restaurant');
    if (hotel.amenities?.miniBarInRoom) amenities.push('Mini Bar');
    if (hotel.amenities?.outdoorPool) amenities.push('Outdoor Pool');
    if (hotel.amenities?.roomService) amenities.push('Room Service');
    if (hotel.amenities?.sauna) amenities.push('Sauna');
    if (hotel.amenities?.tVInRoom) amenities.push('TV');
    if (hotel.amenities?.continentalBreakfast) amenities.push('Breakfast');

    return amenities.map((amenity, index) => (
      <div key={index}>{amenity}</div>
    ));
  };

  return (
    <div className="hotel-detail-container">
      {/* Header with hotel name and rating */}
      <header className="hotel-header">
        <h1>{hotel.name}</h1>
        {hotel.rating && (
          <div className="rating">
            <span className="rating-value">{hotel.rating}</span>
            <span className="rating-max">/5</span>
          </div>
        )}
      </header>

      {/* Main image gallery */}
      {hotel.imgix_url && hotel.default_image_index !== undefined && hotel.image_details?.suffix && (
        <div className="hotel-gallery">
          <img 
            src={`${hotel.imgix_url}${hotel.default_image_index}${hotel.image_details.suffix}`} 
            alt={hotel.name} 
            className="main-image"
          />
        </div>
      )}

      {/* Hotel details section */}
      <section className="hotel-info">
        <div className="address">
          <h3>Address</h3>
          <p>{hotel.address1 || hotel.address || 'Address not available'}</p>
        </div>

        <div className="description">
          <h3>Description</h3>
          <p>{hotel.description || 'No description available.'}</p>
        </div>

        {/* TrustYou scores if available */}
        {hotel.trustyou?.score && (
          <div className="trustyou-scores">
            <h3>Guest Ratings</h3>
            <div className="scores-grid">
              {hotel.trustyou.score.overall !== null && (
                <div className="score-item">
                  <span>Overall</span>
                  <span>{hotel.trustyou.score.overall}/10</span>
                </div>
              )}
              {hotel.trustyou.score.solo !== null && (
                <div className="score-item">
                  <span>Solo Travelers</span>
                  <span>{hotel.trustyou.score.solo}/10</span>
                </div>
              )}
              {hotel.trustyou.score.couple !== null && (
                <div className="score-item">
                  <span>Couples</span>
                  <span>{hotel.trustyou.score.couple}/10</span>
                </div>
              )}
              {hotel.trustyou.score.family !== null && (
                <div className="score-item">
                  <span>Families</span>
                  <span>{hotel.trustyou.score.family}/10</span>
                </div>
              )}
              {hotel.trustyou.score.business !== null && (
                <div className="score-item">
                  <span>Business</span>
                  <span>{hotel.trustyou.score.business}/10</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Amenities section */}
      <section className="amenities">
        <h3>Amenities</h3>
        <div className="amenities-grid">
          {renderAmenities()}
        </div>
      </section>

      {/* Prices section */}
      <section className="prices">
        <h3>Available Rooms</h3>
        {prices?.hotels?.length ? (
          <div className="price-list">
            {prices.hotels.map((price, index) => (
              <div key={index} className="price-item">
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
            ))}
          </div>
        ) : (
          <p>No pricing information available</p>
        )}
      </section>
    </div>
  );
}