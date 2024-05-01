const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const AcademySchema = new Schema({
  fullName: {type: String, required: true},
  email: {type: String, required: true},
  phoneNumber: {type: String, required: true},
  location: {type: String, required: true},
  gender: {type: String, required: true},
  photoTraining: {type: String, required: true},
  photographyFocus: {type: String, required: true},
  sessionPayment: {type: String, required: true},
  healthCondition: {type: String, required: true},
  message: {type: String, required: true},

});

const AcademyModel = model('Academy', AcademySchema);

module.exports = AcademyModel;