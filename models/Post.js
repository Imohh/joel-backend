const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ContentBlockSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true }, // e.g., 'text' or 'image'
  content: { type: String }, // Text content for 'text' blocks
  src: { type: String },
  caption: { type: String },
});

const PostSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: String, required: true },
    slug: { type: String, required: true },
    summary: { type: String },
    coverImage: { type: String },
    content: [ContentBlockSchema],
    contentType: { type: String },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
  }
);

const PostModel = model('Post', PostSchema);

module.exports = PostModel;
