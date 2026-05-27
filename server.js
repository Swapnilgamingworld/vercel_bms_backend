require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const documentRoutes = require('./routes/documents');
const markRoutes = require('./routes/marks');
const feeRoutes = require('./routes/fees');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Configure CORS for production
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send({ message: 'College Management Backend is running.' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-management';

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

connectDB()
  .then(() => {
    console.log('MongoDB connected.');

    if (require.main === module) {
      console.log('Starting local server...');
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Backend server running and listening on http://0.0.0.0:${PORT}`);
      });

      server.on('error', (err) => {
        console.error('Server error:', err && err.message ? err.message : err);
        process.exit(1);
      });
    }
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    if (require.main === module) {
      process.exit(1);
    }
  });

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err && err.stack ? err.stack : err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

module.exports = app;
