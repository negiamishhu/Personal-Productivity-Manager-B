const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Allowed Origins
const allowedOrigins = [
  "https://personal-productivity-manager-f.vercel.app",
  "http://localhost:3000", // optional, for local testing
];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes  
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const expensesRoutes = require('./routes/expenses');
app.use('/api/expenses', expensesRoutes);
const tasksRoutes = require('./routes/tasks');
app.use('/api/tasks', tasksRoutes);
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;
