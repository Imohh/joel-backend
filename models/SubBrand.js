// models/SubBrand.js
const mongoose = require('mongoose');

const subBrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  description: String,
  brandName: String,
});

module.exports = mongoose.model('SubBrand', subBrandSchema);
