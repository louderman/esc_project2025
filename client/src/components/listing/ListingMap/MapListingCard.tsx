import type { SetStateAction } from 'react';
import type { Hotel } from '../../../../../types/Hotel';
import type { Price } from '../../../../../types/Price';
import type { StayDatesState } from '../SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../SearchBar/GuestInput/GuestInput';
import styles from './maplistingcard.module.css';
import { useNavigate } from 'react-router-dom';

export default function MapListingCard({
  hotel,
  stayDates,
  occupancy,
  setHoveredHotelId,
}: {
  hotel: Hotel & Price;
  stayDates: StayDatesState;
  occupancy: OccupancyState;
  setHoveredHotelId: React.Dispatch<SetStateAction<string | null>>;
}) {
  const userRating = hotel.categories.overall?.score;
  const checkin = stayDates.checkinDate;
  const checkout = stayDates.checkoutDate;
  const numNights =
    checkin && checkout
      ? Math.round(
          (checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

  const navigate = useNavigate();
  const handleView = () => {
    // Build URL parameters for hotel detail page
    const params = new URLSearchParams();

    if (stayDates.checkinDate) {
      params.set('checkin', stayDates.checkinDate.toISOString().split('T')[0]);
    }
    if (stayDates.checkoutDate) {
      params.set(
        'checkout',
        stayDates.checkoutDate.toISOString().split('T')[0]
      );
    }
    params.set('adults', occupancy.adults.toString());
    params.set('children', occupancy.children.toString());
    params.set('rooms', occupancy.rooms.toString());
    // Get the destination ID from the current URL (should be passed down from parent)
    const currentDestId = new URLSearchParams(window.location.search).get(
      'destId'
    );
    if (currentDestId) {
      params.set('destination_id', JSON.parse(currentDestId));
    }

    navigate(`/hotel/${hotel.id}?${params.toString()}`);
  };

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setHoveredHotelId(hotel.id)}
      onMouseLeave={() => setHoveredHotelId(null)}
      onClick={handleView}
    >
      {hotel.imageCount > 0 ? (
        <img
          className={styles.image}
          src={`${hotel.image_details.prefix}0${hotel.image_details.suffix}`}
          alt='hotel img'
          onError={(e) => {
            if (!e.currentTarget.src.includes('hotel_img_placeholder.png')) {
              e.currentTarget.src = '/listing/hotel_img_placeholder.png';
            }
          }}
        />
      ) : (
        <img
          className={styles.image}
          src='/listing/hotel_img_placeholder.png'
          alt='hotel img'
        />
      )}
      <div className={styles.infoSection}>
        <span className={styles.titleText}>{hotel.name}</span>
        <div className={styles.starsSection}>
          {Array.from({ length: hotel.rating }).map((_, i) => (
            <img
              src='/listing/stars/star_full.svg'
              key={`${hotel.id}-star-${i}`}
            />
          ))}
        </div>
        <div className={styles.userRatingBox}>
          <div
            className={`${styles.userRatingNumber} ${
              (userRating === undefined || userRating === null) &&
              styles.noRating
            }`}
          >
            {userRating ? (userRating / 10).toFixed(1) : '-'}
          </div>
        </div>
        <div className={styles.priceSection}>
          <span className={styles.stayInfoText}>
            {occupancy.rooms} room{occupancy.rooms > 0 ? 's' : ''}, {numNights}{' '}
            night{numNights > 0 ? 's' : ''}
          </span>
          <div className={styles.priceBox}>
            <span className={styles.priceText}>
              SGD {Math.round(hotel.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
