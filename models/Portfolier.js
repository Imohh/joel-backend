const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const PortfolierSchema = new Schema({
  id: { type: String, default: () => new mongoose.Types.ObjectId().toString() }, // Auto-generate ID
  image: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  subbrand: { type: mongoose.Schema.Types.ObjectId, ref: 'SubBrand', required: true }, // Added subbrand reference
  brandName: String,
  subbrandName: String,
  contentType: { type: String },
});

const PortfolierModel = model('Portfolier', PortfolierSchema);

module.exports = PortfolierModel;