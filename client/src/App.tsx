import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingPage from './pages/ListingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/listing' element={<ListingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
