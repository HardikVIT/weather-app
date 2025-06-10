const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Parser } = require('json2csv');
require('dotenv').config();

const City = require('./models/City'); // Your Mongoose model for City

const app = express();
app.use(cors({
  origin:[
    "https://weather-app-frontend-lovat.vercel.app/",
    "http://localhost:3000"
  ]
}));
app.use(express.json());
app.get('/api/weather/export/csv', async (req, res) => {
  try {
    const cities = await City.find().lean();

    if (!cities.length) {
      return res.status(404).send('No data to export');
    }

    const fields = Object.keys(cities[0]);
    const parser = new Parser({ fields });
    const csv = parser.parse(cities);

    res.header('Content-Type', 'text/csv');
    res.attachment('weather_data.csv');
    res.send(csv);
  } catch (err) {
    console.error('CSV Export Error:', err);
    res.status(500).send('Failed to export CSV');
  }
});
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// POST /api/weather/add - Add a new city with forecast
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

// GET /api/weather - Get all saved cities with forecast
app.get('/api/weather', async (req, res) => {
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (err) {
    console.error('Fetching error:', err);
    res.status(500).json({ error: 'Fetching failed' });
  }
});

// DELETE /api/weather/:name - Delete city by name
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
app.get('/', (req, res) => {
  res.send({
    activeStatus: true,
    error: false,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
