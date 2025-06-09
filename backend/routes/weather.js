const express = require('express');
const router = express.Router();
const City = require('../models/City');

// POST: Add a new city
router.post('/', async (req, res) => {
  try {
    const city = new City(req.body);
    await city.save();
    res.status(201).send(city);
  } catch (err) {
    console.error("Saving error:", err);
    res.status(500).send({ error: 'Saving failed' });
  }
});

// GET: Get all cities
router.get('/', async (req, res) => {
  try {
    const cities = await City.find();
    res.send(cities);
  } catch (err) {
    console.error("Fetching error:", err);
    res.status(500).send({ error: 'Fetching failed' });
  }
});

// DELETE: Delete city by name
router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const deleted = await City.findOneAndDelete({ name });
    if (!deleted) {
      return res.status(404).send({ error: 'City not found' });
    }
    res.send({ message: 'City deleted' });
  } catch (err) {
    console.error("Deleting error:", err);
    res.status(500).send({ error: 'Deleting failed' });
  }
});

module.exports = router;
