const express = require('express');
const router = express.Router();
const upload = require('../middlewares/storage');
const Post = require('../models/Post');


router.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .sort({createdAt: -1}))
})

module.exports = router;