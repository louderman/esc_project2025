import type { Hotel } from '../../../../../types/Hotel';
import type { Price } from '../../../../../types/Price';
import { AMENITY_TO_SVG } from '../../../constants/amenities';
import styles from './listingcard.module.css';

export default function ListingCard({
  hotel,
}: {
  hotel: Hotel & Partial<Price>;
}) {
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
            <span className={styles.stayInfoText}>1 room, 1 night</span>
          </div>
          <button className={styles.viewButton}>View</button>
        </div>
      </div>
    </div>
  );
}
