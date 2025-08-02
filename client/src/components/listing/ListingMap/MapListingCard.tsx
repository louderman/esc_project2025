import type { Hotel } from '../../../../../types/Hotel';
import type { Price } from '../../../../../types/Price';
import type { StayDatesState } from '../SearchBar/DateInput/DateInput';
import type { OccupancyState } from '../SearchBar/GuestInput/GuestInput';
import styles from './maplistingcard.module.css';

export default function MapListingCard({
  hotel,
  stayDates,
  occupancy,
}: {
  hotel: Hotel & Price;
  stayDates: StayDatesState;
  occupancy: OccupancyState;
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

  return (
    <div className={styles.container}>
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
            }`}>
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
