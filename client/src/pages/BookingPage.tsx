/*
export default function BookingPage() {
  return <div>Home Page</div>;
}
*/
import React, { useState } from 'react';
import './bookingconfirmationpage.css';

type RoomType = '' | 'single' | 'double' | 'suite';

const App: React.FC = () => {
  const [name, setName] = useState('');
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!name || !checkin || !checkout || !roomType) {
      setError('Please fill in all fields.');
      return;
    }

    if (checkout <= checkin) {
      setError('Check-out date must be after check-in date.');
      return;
    }

    setMessage(
      `Thank you, ${name}! Your booking for a ${roomType} room from ${checkin} to ${checkout} is confirmed.`
    );
  };

  return (
    <div className="container">
      <h1>Hotel Booking Form</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Check-in Date:
          <input
            type="date"
            value={checkin}
            onChange={e => setCheckin(e.target.value)}
            required
          />
        </label>
        <label>
          Check-out Date:
          <input
            type="date"
            value={checkout}
            onChange={e => setCheckout(e.target.value)}
            required
          />
        </label>
        <label>
          Room Type:
          <select
            value={roomType}
            onChange={e => setRoomType(e.target.value as RoomType)}
            required
          >
            <option value="">Select...</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="suite">Suite</option>
          </select>
        </label>
        <button type="submit">Book Now</button>
      </form>
      {error && <div className="error">{error}</div>}
      {message && <div className="confirmation">{message}</div>}
    </div>
  );
};

export default App;
