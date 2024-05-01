const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const SubBrandImageUploadSchema = new Schema({
  image: {type: String, required: true},
  subbrand: { type: mongoose.Schema.Types.ObjectId, ref: 'SubBrand', required: true },
  subbrandName: String,
  contentType: { type: String }
});

const SubBrandImageUploadModel = model('SubBrandImageUpload', SubBrandImageUploadSchema);

module.exports = SubBrandImageUploadModel;