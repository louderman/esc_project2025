import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingPage from './pages/ListingPage';
import NavBar from './components/common/navbar';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import BookingPage from './pages/BookingPage';
//import HotelDetailPage from './pages/HotelDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PastBookingPage from './pages/PastBookingPage';
import HotelDetailPageTest from './pages/hoteldetailmockedfrontend';
import HotelDetail from "./pages/HotelDetail";
import NotFound from "./pages/NotFound";


function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/listing' element={<ListingPage />} />
        <Route
          path='/booking/confirmation'
          element={<BookingConfirmationPage />}
        />
        <Route path='/booking' element={<BookingPage />} />

      <Route path="/hotel/:hotelId" element={<HotelDetailPageTest />} />
        <Route path='/hotel_detail' element={<HotelDetail />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/past_booking' element={<PastBookingPage />} />
      </Routes>
    </Router>
  );
}

export default App;