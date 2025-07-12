/*
export default function BookingPage() {
  return <div>Home Page</div>;
}
*/
import './bookingpage.css';

type RoomType = '' | 'single' | 'double' | 'suite';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  marginTop: '0.25rem',
  backgroundColor: '#f4f4f4',
  border: '1px solid #ccc',
  borderRadius: '2px',
  fontSize: '1rem',
};

export default function BookingPage() {
  // Dummy data — replace these with real state or props
  const checkin = "20 May";
  const checkout = "25 May";
  const roomType: RoomType = 'suite';
  const name = "2 guest";

  return (
    <>
      <div className="container">
        <div className="flex-row">
          <img
            src="/images/hotel.png"
            alt="Hotel Room"
            className="image"
          />
          <div className="text-content">
            <h2 style={{ marginBottom: '2rem' }}>REVIEW BOOKING</h2>

            <div className="booking-summary">
              <div className="summary-item">
                <p>Check-in{"      "}Check-out{"      "}Room & Guest</p>
              </div>
              <div className="summary-item">
                <strong>-</strong> {checkin} {checkout} {roomType} {name}
              </div>

              <h3 style={{ marginTop: '1rem' }}>Oasia Resort Sentosa</h3>
              <h3 style={{ marginBottom: '1rem'}}>By Far East Hospitality</h3>
              <h3 className="price" style={{ marginBottom: '1rem' }}>SGD 311 <span>/ night</span></h3>

              <h3>WHAT'S INCLUDED</h3>
              <ul>
                <p>{"      "}Luxurious Accommodations</p>
                <p>{"      "}Free Wi-Fi</p>
                <p>{"      "}Complimentary Breakfast</p>
                <p>{"      "}Access to the Pool and Spa</p>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="container2">
        <h1 style={{ marginBottom: '1rem' }}>POLICIES</h1>
        <p>Guarentee Policy</p>
        <p style={{ marginBottom: '1rem' }}>Credit Card is required at the time of booking.</p>
        <p>Cancel Policy</p>
        <p>Reservation must be cancelled by 3pm local time 1 day</p>
        <p style={{ marginBottom: '2rem' }}>before arrival to avoid penalty of 1 night room and tax.</p>

        <h1>Cost</h1>
        <hr style={{ marginBottom: '1rem' }} />
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>$ 311 x 2 nights</span>
          <span>$622</span>
        </div>
        <hr style={{ marginBottom: '1rem' }} />
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>Total</span>
          <span>$622</span>
        </div>
        <hr style={{ marginBottom: '1rem' }} />

        <div style={{ fontFamily: 'Arial, sans-serif' }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Personal Details</h2>

          {/* Name Row */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <label>FIRST NAME</label>
              <input type="text" placeholder="First name" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label>LAST NAME</label>
              <input type="text" placeholder="Last name" style={inputStyle} />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginTop: '1rem' }}>
            <label>EMAIL</label>
            <input type="email" placeholder="@" style={inputStyle} />
          </div>

          {/* Phone */}
          <div style={{ marginTop: '1rem' }}>
            <label>PHONE NUMBER</label>
            <input type="tel" placeholder="+" style={inputStyle} />
          </div>

          {/* Credit Card Section */}
          <div style={{ backgroundColor: '#bfcada', padding: '1rem', marginTop: '2rem' }}>
            <strong>💳 Credit card</strong>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Pay with a credit card</p>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label>🔒 Card number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="text-line"
            />
          </div>

          {/* Expiry, CVV, Postal Code Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <div>
              <label>Expiry</label>
              <input
                type="text"
                placeholder="MM / YY"
                className="text-line"
              />
            </div>
            <div>
              <label>CVV</label>
              <input
                type="text"
                placeholder="429"
                className="text-line"
              />
            </div>
            <div>
              <label>Postal Code</label>
              <input
                type="text"
                placeholder="921145"
                className="text-line"
              />
            </div>
          </div>
          <button className="reserve-button">Reserve</button>
        </div>
      </div>
    </>
  );
}
