// client/src/pages/HomePage.tsx
import { Link } from 'react-router-dom';

export default function HomePage() {
  const sampleHotels = [
    { id: 'RsBU', name: 'Grand Plaza Hotel' },
    { id: 'Lk9X', name: 'Beachside Resort' },
    { id: 'Pq4R', name: 'Mountain View Lodge' }
  ];

  return (
    <div className="home-container">
      <h1>Featured Hotels</h1>
      <div className="hotel-list">
        {sampleHotels.map((hotel) => (
          <div key={hotel.id} className="hotel-card">
            <h3>{hotel.name}</h3>
            <Link to={`/hotels/${hotel.id}`} className="view-details-btn">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}