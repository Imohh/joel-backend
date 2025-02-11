const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const SubBrandImageUploadSchema = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  image: { type: String, required: true },
  subbrand: { type: mongoose.Schema.Types.ObjectId, ref: 'SubBrand', required: true },
  contentType: { type: String, required: true },
  name: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
});

const SubBrandImageUploadModel = model('SubBrandImageUpload', SubBrandImageUploadSchema);

module.exports = SubBrandImageUploadModel;