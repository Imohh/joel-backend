const express = require('express');
const router = express.Router();
const upload = require('../middlewares/storage');
const Post = require('../models/Post');

// Create a new post
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const imageUrl = req.file.path;
    const post = new Post({ title, content, imageUrl });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a post by ID
router.patch('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a post by ID
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndRemove(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
