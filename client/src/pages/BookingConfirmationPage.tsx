/*
export default function BookingConfirmationPage() {
  return <div>Home Page</div>;
}
*/
//import React from 'react';
import './bookingconfirmationpage.css';

export default function BookingConfirmation() {
  return (
    <div className="booking-page" >
      <div className="booking-box" >
        <h1 className="booking-title" style={{ marginBottom: '1rem', marginTop: '1rem' }}>Booking Confirmed!</h1>
        <p className="booking-subtitle">
          We are pleased to inform you that your booking is successful!
        </p>
        <hr className="divider" style={{ marginBottom: '3rem' }}/>

        <div className="details-title">Booking Details</div>

        <div className="details-grid">
          <div className="detail-item">
            <div className="label">Booking ID</div>
            <div className="value">1211</div>
          </div>
          <div className="detail-item">
            <div className="label">Check-in Date</div>
            <div className="value">20th May 2025</div>
          </div>
          <div className="detail-item">
            <div className="label">Check-out Date</div>
            <div className="value">22th May 2025</div>
          </div>
          <div className="detail-item">
            <div className="label">Total</div>
            <div className="value">$622</div>
          </div>
          <div className="detail-item">
            <div className="label">Status</div>
            <div className="value confirmed">Confirmed</div>
          </div > 
        </div >

        <div className="room-detail">
          <p className="label" style={{ marginBottom: '1rem', marginTop: '2.5rem' }}>Details:</p>
          <p className="value bold"> Standard Single Room</p>
        </div >
      </div>

      <div className="hotel-section">
        <div className="flex-row">
          <img
            src="/images/hotel.png"
            alt="Hotel Room"
            className="hotel-image"
          />
          <div className="text-content">
            <div className="hotel-info">
              <h2 className="hotel-name">
                Oasia Resort Sentosa <br />
                <span className="hotel-brand">By Far East Hospitality</span>
              </h2>
              <p className="hotel-address">
                📍 23 Beach View Rd, Palawan Ridge <br />
                Sentosa Island
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
