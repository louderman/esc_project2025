import express from 'express';
import { insertUser, findByEmail } from '../models/userModel';

const router = express.Router();

// POST /register
router.post('/register', function (req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: 'All fields are required.' });
    return;
  }

  findByEmail(email.trim())
    .then((existingUser) => {
      if (existingUser) {
        res.status(400).json({ message: 'Email already exists.' });
        return null; // Prevents returning Response
      }

      return insertUser(name.trim(), email.trim(), password.trim());
    })
    .then((result) => {
      if (result === null) return; // Email exists case
      res.status(201).json({ message: 'User registered successfully.' });
    })
    .catch((err) => {
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Internal server error.' });
    });
});

// POST /login
router.post('/login', function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required.' });
    return;
  }

  findByEmail(email.trim())
    .then((user) => {
      if (!user || user.password !== password.trim()) {
        res.status(401).json({ message: 'Invalid email or password.' });
        return null;
      }

      res.status(200).json({
        message: 'Login successful.',
        userId: user.id,
        name: user.name,
      });
    })
    .catch((err) => {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Internal server error.' });
    });
});

export { router };
