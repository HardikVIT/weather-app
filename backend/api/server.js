const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Parser } = require('json2csv');
require('dotenv').config();

const City = require('../backend/models/City'); // Path updated from api to backend

const app = express();
app.use(cors());
app.use(express.json());

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
  console.log('MongoDB connected');
}

// Add a new city
app.post('/api/weather/add', async (req, res) => {
  await connectDB();
  try {
    const city = new City(req.body);
    await city.save();
    res.status(201).json(city);
  } catch (err) {
    console.error('Saving error:', err);
    res.status(500).json({ error: 'Saving failed' });
  }
});

// Get all cities
app.get('/api/weather', async (req, res) => {
  await connectDB();
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (err) {
    console.error('Fetching error:', err);
    res.status(500).json({ error: 'Fetching failed' });
  }
});

// Delete city by name
app.delete('/api/weather/:name', async (req, res) => {
  await connectDB();
  try {
    const { name } = req.params;
    const deleted = await City.findOneAndDelete({ name });
    if (!deleted) return res.status(404).json({ error: 'City not found' });
    res.json({ message: 'City deleted successfully' });
  } catch (err) {
    console.error('Deleting error:', err);
    res.status(500).json({ error: 'Deleting failed' });
  }
});

// Export cities as CSV
app.get('/api/weather/export/csv', async (req, res) => {
  await connectDB();
  try {
    const cities = await City.find().lean();
    if (!cities.length) return res.status(404).send('No data to export');

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

// Export as Vercel-compatible handler
module.exports = app;
