const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create Express app
const app = express();

// Enable CORS for all origins
app.use(cors());

// Middleware to serve static files
app.use(express.static('public'));
app.use(express.json()); // To handle JSON request bodies

// MongoDB connection URI
const MONGO_URI = 'mongodb+srv://damaine334:Angulimala123@cluster0.vc4zr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log('Error connecting to MongoDB:', err);
});

// Define Mongoose schema and model for users
const userSchema = new mongoose.Schema({
  name: String,
  icNumber: String,
  latitude: Number,
  longitude: Number,
  pic1: String, // Base64 string for Pic1
  pic2: String, // Base64 string for Pic2
  status: { type: String, enum: ['verified', 'notVerified'], default: 'notVerified' }, // Verified status
  createdAt: {
    type: Date,
    default: Date.now
  }
});

