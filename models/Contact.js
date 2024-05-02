const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const ContactSchema = new Schema({
  fullName: {type: String, required: true},
  email: {type: String, required: true},
  message: {type: String, required: true},
});

const ContactModel = model('Contact', ContactSchema);

module.exports = ContactModel;