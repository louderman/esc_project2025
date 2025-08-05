import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingPage from './pages/ListingPage';
import NavBar from './components/common/navbar';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PastBookingPage from './pages/PastBookingPage';
import HotelDetail from "./pages/HotelDetail";
import NotFound from "./pages/NotFound";
import HotelDetailPageTest from './pages/hoteldetailmockedfrontend';
import { AuthProvider} from './components/common/authcontext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/listing' element={<ListingPage />} />
          <Route path='/booking' element={<BookingPage />} />
          <Route path='/booking/confirmation' element={<BookingConfirmationPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/past_booking' element={<PastBookingPage />} />
          <Route path="/hotel/:hotelId" element={<HotelDetail />} />
          <Route path="/hotel_detail" element={<HotelDetail />} />
          <Route path="/hotel_detail_test" element={<HotelDetailPageTest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;