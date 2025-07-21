import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HotelDetailPage from './HotelDetailPageFrontendTest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// This import should be in your setupTests.ts file instead
// But we'll include it here temporarily to verify the solution
import '@testing-library/jest-dom';

describe('HotelDetailPage', () => {
  it('renders loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/hotel/test123']}>
        <Routes>
          <Route path="/hotel/:hotelId" element={<HotelDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/loading mock data/i)).toBeInTheDocument();
  });

  it('displays hotel data after loading', async () => {
    render(
      <MemoryRouter initialEntries={['/hotel/test123']}>
        <Routes>
          <Route path="/hotel/:hotelId" element={<HotelDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/mock hotel test123/i)).toBeInTheDocument();
      expect(screen.getByText(/mock street/i)).toBeInTheDocument();
      expect(screen.getAllByText(/room/i)).toHaveLength(2);
    });
  });
});