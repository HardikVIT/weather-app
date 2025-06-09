const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  name: String,         
  temperature: Number,
  t1: Number,
  t2: Number,
  t3: Number,
  t4: Number,
  t5: Number,    
  country: String,
  description: String,    
  date: { type: Date, default: Date.now }  
});

module.exports = mongoose.model('City', CitySchema);
