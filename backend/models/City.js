const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  name: String,         
  temperature: Number,    
  description: String,    
  date: { type: Date, default: Date.now }  
});

module.exports = mongoose.model('City', CitySchema);
