import express from 'express';

const app = express();

app.use(express.json());

console.log('Starting minimal test server...');

app.get('/', (req, res) => {
  console.log('Root route hit');
  res.json({ message: 'Minimal server working!' });
});

app.get('/api/hotel-detail/test', (req, res) => {
  console.log('Hotel detail test route hit');
  res.json({ message: 'Hotel detail route working!' });
});

app.listen(5001, () => {
  console.log('Minimal test server listening on port 5001');
  console.log('Try: http://localhost:5001/');
  console.log('Try: http://localhost:5001/api/hotel-detail/test');
}); 