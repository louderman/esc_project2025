import React from 'react';
import styles from './selectedroomcard.module.css';

interface SelectedRoomCardProps {
  selectedRoom: {
    id: string;
    room_type: string;
    price: number;
    free_cancellation: boolean;
    occupancy: number;
    bed_type: string;
    size: string;
    description?: string;
    amenities?: string[];
  };
  numberOfNights: number;
  numberOfRooms: number;
}

const SelectedRoomCard: React.FC<SelectedRoomCardProps> = ({
  selectedRoom,
  numberOfNights,
  numberOfRooms,
}) => {
  const totalRoomPrice = selectedRoom.price * numberOfNights * numberOfRooms;

  return (
    <div className={styles.selectedRoomCard}>
      <div className={styles.roomHeader}>
        <h3 className={styles.roomTitle}>Selected Room</h3>
        {selectedRoom.free_cancellation && (
          <span className={styles.freeCancellation}>
            <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Free Cancellation
          </span>
        )}
      </div>
      
      <div className={styles.roomContent}>
        <div className={styles.roomImage}>
          <img 
            src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop" 
            alt={selectedRoom.room_type}
            className={styles.image}
          />
        </div>
        
        <div className={styles.roomDetails}>
          <div className={styles.roomInfo}>
            <h4 className={styles.roomType}>{selectedRoom.room_type}</h4>
            <p className={styles.roomDescription}>{selectedRoom.description}</p>
            
            <div className={styles.roomFeatures}>
              <div className={styles.feature}>
                <svg className={styles.featureIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{selectedRoom.occupancy} guests</span>
              </div>
              
              <div className={styles.feature}>
                <svg className={styles.featureIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                <span>{selectedRoom.bed_type}</span>
              </div>
              
              <div className={styles.feature}>
                <svg className={styles.featureIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>{selectedRoom.size} m²</span>
              </div>
            </div>
            
            {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
              <div className={styles.amenities}>
                <h5 className={styles.amenitiesTitle}>Room Amenities</h5>
                <div className={styles.amenitiesList}>
                  {selectedRoom.amenities.map((amenity, index) => (
                    <span key={index} className={styles.amenityTag}>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.priceSection}>
            <div className={styles.priceDetails}>
              <div className={styles.pricePerNight}>
                <span className={styles.price}>${selectedRoom.price}</span>
                <span className={styles.perNight}>per night</span>
              </div>
              <div className={styles.totalPrice}>
                <span className={styles.calculation}>
                  {numberOfNights} night{numberOfNights !== 1 ? 's' : ''} × {numberOfRooms} room{numberOfRooms !== 1 ? 's' : ''}
                </span>
                <span className={styles.total}>${totalRoomPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedRoomCard;
