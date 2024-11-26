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

// Middleware to parse JSON
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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

const User = mongoose.model('users', userSchema);

// Route to get locations
app.get('/get-location', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations', error });
  }
});

// Endpoint to fetch the list of usernames
app.get('/usernames', async (req, res) => {
  try {
    const users = await User.find({}, 'name'); // Fetch only the name field
    res.json(users.map(user => user.name)); // Return list of usernames
  } catch (error) {
    console.error('Error fetching usernames:', error);
    res.status(500).send('Server error');
  }
});

// Endpoint to fetch a user profile by username
app.get('/userProfile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.username });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user); // Return the full user profile
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Server error');
  }
});

// Endpoint to update user status (verified or notVerified)
app.post('/update-status/:username', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['verified', 'notVerified'].includes(status)) {
      return res.status(400).send('Invalid status');
    }

    const user = await User.findOneAndUpdate(
      { name: req.params.username },
      { status },
      { new: true } // Return the updated user
    );

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json({ message: 'User status updated successfully', status: user.status });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(3000, () => console.log('Server running on port 3000!'));
