import { useNavigate } from 'react-router-dom';
import type { Hotel } from '../../../../../types/Hotel';
import type { Price } from '../../../../../types/Price';
import type { StayDatesState } from '../SearchBar/DateInput/DateInput';
import { AMENITY_TO_SVG } from '../../../constants/amenities';
import styles from './listingcard.module.css';
import type { OccupancyState } from '../SearchBar/GuestInput/GuestInput';

export default function ListingCard({
  hotel,
  stayDates,
  occupancy,
}: {
  hotel: Hotel & Partial<Price>;
  stayDates: StayDatesState;
  occupancy: OccupancyState;
}) {
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

  const userRating = hotel.categories.overall?.score;
  const checkin = stayDates.checkinDate;
  const checkout = stayDates.checkoutDate;
  const numNights =
    checkin && checkout
      ? Math.round(
          (checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

  return (
    <div
      data-testid='hotel-listing-card'
      data-cy='hotel-listing-card'
      className={styles.container}
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
        <div className={styles.infoLeftSection}>
          <span className={styles.titleText}>{hotel.name}</span>
          <span className={styles.addrText}>{hotel.address}</span>
          <div className={styles.starsSection}>
            {Array.from({ length: hotel.rating }).map((_, i) => (
              <img
                src='/listing/stars/star_full.svg'
                key={`${hotel.id}-star-${i}`}
              />
            ))}
            {hotel.rating > 0 && <span>hotel</span>}
          </div>
          <div className={styles.amenitiesSection}>
            {Object.keys(hotel.amenities)
              .filter(
                (a): a is keyof typeof AMENITY_TO_SVG => a in AMENITY_TO_SVG
              )
              .slice(0, 3)
              .map((amenity) => (
                <div key={`${hotel.id}-${amenity}`} className={styles.amenity}>
                  <img src={`/amenities/${AMENITY_TO_SVG[amenity]}`} />
                  <span>
                    {amenity
                      .replace(/(tV)/g, 'tv')
                      .replace(/([A-Z])/g, ' $1')
                      .toLowerCase()}
                  </span>
                </div>
              ))}
          </div>
        </div>
        <div className={styles.infoRightSection}>
          <div className={styles.priceSection}>
            <span className={styles.priceText}>
              SGD{' '}
              {hotel.price?.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              }) ?? '...'}
            </span>
            <span className={styles.stayInfoText}>
              {`${occupancy.rooms} room${
                occupancy.rooms > 1 ? 's' : ''
              }, ${numNights} night${numNights > 1 ? 's' : ''}`}
            </span>
            <div className={styles.userRatingBox}>
              <span className={styles.userRatingText}>Rating</span>
              <div
                className={`${styles.userRatingNumber} ${
                  (userRating === undefined || userRating === null) &&
                  styles.noRating
                }`}
              >
                {userRating ? (userRating / 10).toFixed(1) : '-'}
              </div>
            </div>
          </div>
          <button
            data-cy='card-view-btn'
            className={styles.viewButton}
            onClick={handleView}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}
