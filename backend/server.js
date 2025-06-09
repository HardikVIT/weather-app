const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const City = require('./models/City'); // Your Mongoose model for City

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); 
});

// Routes
app.post('/api/weather/add', async (req, res) => {
    try {
        const city = new City(req.body);
        await city.save();
        res.status(201).json(city);
    } catch (err) {
        console.error('Saving error:', err);
        res.status(500).json({ error: 'Saving failed' });
    }
});

app.get('/api/weather', async (req, res) => {
    try {
        const cities = await City.find();
        res.json(cities);
    } catch (err) {
        console.error('Fetching error:', err);
        res.status(500).json({ error: 'Fetching failed' });
    }
});

app.delete('/api/weather/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const deleted = await City.findOneAndDelete({ name });
        if (!deleted) {
        return res.status(404).json({ error: 'City not found' });
        }
        res.json({ message: 'City deleted successfully' });
    } catch (err) {
        console.error('Deleting error:', err);
        res.status(500).json({ error: 'Deleting failed' });
    }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
