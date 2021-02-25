const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  address: {
    type: String,
  },
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
  images: [
    {
      url: String,
      description: String,
      size: String,
    },
  ],
});

module.exports = mongoose.model('properties', PropertySchema);
