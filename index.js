const express = require('express');
const cors = require('cors');
const mongoose= require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Contact = require('./models/Contact');
const Academy = require('./models/Academy');
const Subscribe = require('./models/Subscribe');
const Brand = require('./models/Brand');
const SubBrand = require('./models/SubBrand');
const Portfolio = require('./models/Portfolio');
const Product = require('./models/Product');
const Portfolier = require('./models/Portfolier');
const Order = require('./models/Order');
const SubPortfolio = require('./models/SubPortfolio');
const SubBrandImageUpload = require('./models/SubBrandImageUpload');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
// const multer = require('multer');
const Multer = require('multer')
const fs = require('fs');
const cloudinary = require('cloudinary').v2
require('dotenv').config();

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';


const JWT_SECRET = process.env.JWT_SECRET || "gfdtrxtrxtxtxxfs";

// const storage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename(req, file, cb) {
//     cb(null, `${Date.now()}.jpg`);
//   },
// })
// const uploadMiddleware = multer({ storage });

const storage = new Multer.memoryStorage();
const uploadMiddleware = Multer({
  storage,
});

// CLOUDINARY SETUP
cloudinary.config({
  cloud_name: 'dfs540rt8',
  api_key: '393498944556749',
  api_secret: '-mnTD9Y96yxJLY_SESRwp34Gb38', // JWT Secret
});

// const allowedOrigins = process.env.ALLOWED_ORIGIN
const allowedOrigins = 'https://joelstudio.vercel.app'

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));



app.use(express.json());
app.use(cookieParser());

// mongoose.connect(process.env.MONGO_URI);

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1); // Exit the process with an error code
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });




// Register
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    console.log('Received registration data:', { name, email });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      username: username || undefined, // Avoid saving null for optional fields
    });

    console.log('Attempting to save user...');
    await user.save();
    console.log('User saved successfully');

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'gfdtrxtrxtxtxxfs',
      { expiresIn: '1h' }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});





// Generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};


// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'gfdtrxtrxtxtxxfs',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/users', async (req, res) => {
  try {
    // Optional: Add authentication/authorization if needed to restrict this route.
    const users = await User.find().select('-password');  // Exclude password for security reasons
    
    if (!users) {
      return res.status(404).json({ message: 'No users found.' });
    }

    res.json(users);  // Send the list of users as the response
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// VERIFY TOKEN
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Debug log
    console.log('Auth header received:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Debug verification
    console.log('Attempting to verify token:', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id || decoded.userId;
    
    console.log('Decoded user ID:', req.userId);

    if (!req.userId) {
      throw new Error('No user ID found in token');
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};


// app.get('/user', verifyToken, async (req, res) => {
//   try {
//     // Find the user based on the ID in the token payload
//     const user = await User.findById(req.user._id).select('-__v');
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     res.status(200).json(user);
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// Update user name route
app.put('/user/update-name', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { name },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Update name error:', error);
    res.status(500).json({ message: 'Error updating name' });
  }
});

// Add address route
app.post('/user/add-address', verifyToken, async (req, res) => {
  try {
    const { address, country, countryCode } = req.body;
    
    if (!address || !country || !countryCode) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const newAddress = { address, country, countryCode };

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $push: { addresses: newAddress } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Error adding address' });
  }
});

app.get("/user/profile", verifyToken, async (req, res) => {
  try {
    console.log('Attempting to find user with ID:', req.userId);
    
    const user = await User.findById(req.userId).select("-password");
    
    if (!user) {
      console.log('No user found for ID:', req.userId);
      return res.status(404).json({ message: "User not found" });
    }
    
    console.log('User found:', user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete('/user/delete-address', verifyToken, async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || !address.address || !address.country) {
      return res.status(400).json({ message: 'Address and country are required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { addresses: address } }, // Remove the specific address
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ message: 'Error deleting address' });
  }
});





app.post('/post', uploadMiddleware.array('images', 10), async (req, res) => {
  try {
    const { name, author, date, slug, content, coverImage } = req.body;

    // Ensure `content` is parsed if it's a string
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;

    // Handle cover image upload first if provided
    let coverImageUrl = null;
    if (coverImage && coverImage.startsWith('data:')) {
      const result = await cloudinary.uploader.upload(coverImage, {
        folder: 'sope blog covers',
      });
      coverImageUrl = result.url;
    }

    // Upload images from the content to Cloudinary
    const processedContent = await Promise.all(
      parsedContent.map(async (block) => {
        if (block.type === 'image' && block.src.startsWith('data:')) {
          try {
            // Upload the base64 image to Cloudinary
            const result = await cloudinary.uploader.upload(block.src, {
              folder: 'sope blog',
            });
            console.log('Uploaded Image URL:', result.url); // Log the uploaded URL
            return { ...block, src: result.url }; // Replace the src with the Cloudinary URL
          } catch (err) {
            console.error('Error uploading image to Cloudinary:', err);
            return block; // Return the block as is if the upload fails
          }
        }
        return block; // Return the block as is if it's not an image
      })
    );


    const productId = new Date().getTime();

    // Create the post document
    const postDoc = await Post.create({
      id: productId,
      name,
      author,
      date,
      slug,
      coverImage: coverImageUrl,
      content: processedContent, // Save the updated content with image URLs
    });

    res.json(postDoc);
  } catch (error) {
    console.error('Error posting blog:', error);
    res.status(500).json({ error: 'An error occurred while creating the post' });
  }
});

app.post("/post/:slug/comment", async (req, res) => {
  const { slug } = req.params;
  const { name, email, text, website } = req.body;

  // Validate input fields
  if (!name || !email || !text || !website) {
    return res.status(400).json({ error: "Name, email, and comment text are required." });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    // Create a new comment
    const comment = new Comment({ slug, name, email, text, website });
    await comment.save();

    // Fetch all comments for the post after saving
    const comments = await Comment.find({ slug }).sort({ createdAt: -1 });
    res.status(201).json(comments);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment." });
  }
});


app.get("/post/:slug/comments", async (req, res) => {
  const { slug } = req.params;

  try {
    const comments = await Comment.find({ slug }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments." });
  }
});


app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;

  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
  }

  const { id, name, summary, content } = req.body;

  try {
    const postDoc = await Post.findById(id);

    if (!postDoc) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update fields
    postDoc.name = name;
    postDoc.summary = summary;
    postDoc.content = content;
    if (newPath) {
      postDoc.cover = newPath;
    }

    // Save the updated document
    await postDoc.save();

    res.json(postDoc);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'An error occurred while updating the post' });
  }
});

app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .sort({createdAt: -1}))
})

// app.get('/post/:id', async (req,res) => {
//   const {id} = req.params
//   const postDoc = await Post.findById(id)
//   res.json(postDoc)
// })

app.get('/post/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const post = await Post.findOne({ slug });
    if (!post) {
      return res.status(404).send({ message: 'Thoughts not found' });
    }
    res.status(200).send(post);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching blog post', error });
  }
});

app.delete('/post/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!port) return res.status(404).json({ error: 'blog post not found' });
    res.json({ message: 'blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});


// CONTACT FORM
app.post('/contact', async (req, res) => {
  try {
    const { fullName, email, phone, message } = req.body;
    const formEntry = new Contact({
      fullName,
      email,
      phone,
      message,
    });
    await formEntry.save();
    res.status(200).json({ message: 'Form data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/contact', async (req, res) => {
  try {
    const contacts = await Contact.find(); // Assuming ContactForm is your Mongoose model
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ACADEMY FORM
app.post('/academy', async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      phoneNumber, 
      location, 
      gender, 
      photoTraining, 
      photographyFocus, 
      sessionPayment, 
      healthCondition, 
      message,
    } = req.body;
    const newForm = new Academy({
      fullName, 
      email, 
      phoneNumber, 
      location, 
      gender, 
      photoTraining, 
      photographyFocus, 
      sessionPayment, 
      healthCondition, 
      message,
    });
    await newForm.save();
    res.status(201).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/academy', async (req, res) => {
  try {
    const academys = await Academy.find(); // Assuming Academy is your Mongoose model
    res.status(200).json(academys);
  } catch (error) {
    console.error('Error getting academys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SUBSCRIBE
app.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    const formEntry = new Subscribe({
      email,
    });
    await formEntry.save();
    res.status(200).json({ message: 'Form data saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/subscribe', async (req, res) => {
  try {
    const subscribers = await Subscribe.find(); // Assuming Subscribers is your Mongoose model
    res.status(200).json(subscribers);
  } catch (error) {
    console.error('Error getting subscribers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// PORTFOLIO
// Create a new brand
app.post('/brands', async (req, res) => {
  try {
    const brand = new Brand({ name: req.body.name });
    await brand.save();
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find(); // Assuming Brands is your Mongoose model
    res.status(200).json(brands);
  } catch (error) {
    console.error('Error getting brands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/brandsId', async (req, res) => {
  try {
    const brands = await Brand.find({}, 'name _id'); // Fetch only brand name and id
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'An error occurred while fetching brands' });
  }
});

// Edit/Update a brand by ID
app.put('/brands/:id', async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// // Delete a brand by ID
app.delete('/brands/:id', async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// CREATE A NEW SUB FPORTFOLIO(sub-brand) UNDER A PORTFOLIO(brand)
// app.post('/subbrand/:brandId', async (req, res) => {
//   try {
//     const brand = await Brand.findById(req.params.brandId);
//     if (!brand) return res.status(404).json({ error: 'Brand not found' });

//     const subBrand = new SubBrand({ 
//       name: req.body.name, 
//       description: req.body.description,
//       brand: brand._id,
//     });
//     await subBrand.save();
//     res.status(201).json(subBrand);
//   } catch (error) {
//     res.status(500).json({ error: 'An error occurred' });
//   }
// });

app.post('/subbrand/:brandId', async (req, res) => {
    try {
        const { brandId } = req.params;
        const { name, description } = req.body;

        // First verify that the brand exists
        const brand = await Brand.findById(brandId);
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        // Create new subbrand
        const subbrand = new SubBrand({
            name,
            description,
            brand: brandId,
            brandName: brand.name // Store the brand name for easier reference
        });

        // Save the subbrand
        const savedSubbrand = await subbrand.save();

        res.status(201).json(savedSubbrand);
    } catch (error) {
        console.error('Error creating subbrand:', error);
        res.status(500).json({ 
            message: 'Error creating subbrand', 
            error: error.message 
        });
    }
});


app.get('/subbrand/:brandId', async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const brand = await SubBrand.findById(brandId);

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    
    res.json({ subbrands: brand.subbrands });
  } catch (error) {
    console.error('Error fetching brand:', error)
    res.status(500).json({message: 'Internal server error'});
  }
});

app.get('/subbrand', async (req,res) => {
  try {
    const subbrands = await SubBrand.find().populate('brand'); // Populate the brand field with brand information
    const subbrandData = subbrands.map((subbrand) => ({
      _id: subbrand._id,
      name: subbrand.name,
      brand: subbrand.brand._id,
      brandName: subbrand.brand.name,
      description: subbrand.description,
    }));
    res.json(subbrandData);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
})

// Delete a subbrand by ID
app.delete('/subbrand/:id', async (req, res) => {
  try {
    const brand = await SubBrand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Edit/Update a brand by ID
app.put('/subbrand/:id', async (req, res) => {
  try {
    const subbrand = await SubBrand.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if (!subbrand) return res.status(404).json({ error: 'Subbrand not found' });
    res.json(subbrand);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});







// UPLOAD PICTURE TO SUB PORTFOLIO UNDER PORTFOLIO
app.post('/subbrands/:subbrandId', uploadMiddleware.single('image'), async (req, res) => {
  try {
    const subbrandId = req.params.subbrandId;
    const image = req.file.buffer;
    const contentType = req.file.mimetype;
    // const { name, description, amount, quantity } = req.body;
    const name = req.body

    // Ensure the subbrandId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(subbrandId)) {
      return res.status(400).json({ error: 'Invalid subbrand ID format' });
    }



    const b64Image = Buffer.from(image).toString('base64');
    const dataURI = `data:${contentType};base64,${b64Image}`;

    // Ensure the brand exists
    const subbrand = await SubBrand.findById(subbrandId);
    if (!subbrand) {
      return res.status(404).json({ error: 'subBrand not found' });
    }

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'joel sub portfolio',
      resource_type: 'auto',
    });

    // const newId = new Date().getTime();

    // Create a new portfolio entry for the image
    const subBrandPicture = new SubBrandImageUpload({ 
    //const portfolio = new Portfolio({
      _id: new mongoose.Types.ObjectId(),
      image: result.url,
      subbrand: subbrandId,
      contentType,
      name: subbrand.name, // Include required name field
      brand: subbrand.brand,
    });

    const savedSubbrand = await subBrandPicture.save();

    res.json({ 
      success: true,
      message: 'Image uploaded successfully',
      portfolio: savedSubbrand 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/subbrands/:brandId', async (req, res) => {
  try {
    const { brandId } = req.params;
    const subbrands = await SubBrand.find({ brand: brandId });

    if (!subbrands.length) {
      return res.status(404).json({ message: 'No subbrands found' });
    }

    res.json(subbrands);
  } catch (error) {
    console.error('Error fetching subbrands:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/brands/:brandId/subbrands', async (req, res) => {
    try {
        const { brandId } = req.params;

        // Ensure the brand exists
        const brand = await Brand.findById(brandId);
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        // Fetch subbrands linked to this brand (Fix: Change brandId to brand)
        const subbrands = await SubBrand.find({ brand: brand });

        if (subbrands.length === 0) {
            return res.status(404).json({ message: 'No subbrands found for this brand' });
        }

        res.status(200).json(subbrands);
    } catch (error) {
        console.error('Error fetching subbrands:', error);
        res.status(500).json({ message: 'Error fetching subbrands', error: error.message });
    }
});





app.get('/subbrands', async (req, res) => {
  try {
    const subbrands = await SubBrandImageUpload.find()
      .populate('brand') // Populate the brand field with brand information
      .populate('subbrand'); // Optionally populate the subbrand field

    const subbrandData = subbrands.map((subbrand) => ({
      _id: subbrand._id,
      image: subbrand.image,
      contentType: subbrand.contentType,
      name: subbrand.name,
      brand: subbrand.brand ? subbrand.brand._id : null,
      brandName: subbrand.brand ? subbrand.brand.name : null, // Include the brand name if it exists
      subbrand: subbrand.subbrand ? subbrand.subbrand._id : null,
      subbrandName: subbrand.subbrand ? subbrand.subbrand.name : null, // Include the subbrand name if it exists
    }));
    res.json(subbrandData);
  } catch (error) {
    console.error('Error fetching subbrands:', error);
    res.status(500).json({ error: 'An error occurred while fetching subbrands' });
  }
});


// Delete a subbrand by ID
app.delete('/subbrands/:id', async (req, res) => {
  try {
    const brand = await SubBrand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Edit/Update a brand by ID
app.put('/subbrands/:id', async (req, res) => {
  try {
    const subbrand = await SubBrand.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if (!subbrand) return res.status(404).json({ error: 'Subbrand not found' });
    res.json(subbrand);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});




// Upload image to a subbrand by ID
app.post('/uploads/:subbrandId', uploadMiddleware.single('image'), async (req, res) => {
  try {
    const subbrandId = req.params.subbrandId;
    const image = req.file.path;
    const contentType = req.file.mimetype

    console.log(image)

    // Ensure the brand exists
    const subbrand = await SubBrand.findById(subbrandId);
    if (!subbrandId) {
      return res.status(404).json({ error: 'SubBrand not found' });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: 'sub-portfolio'
    });

    // Create a new portfolio entry for the image
    const subportfolio = new SubPortfolio({
      image: result.url,
      subbrand: subbrandId,
      contentType
    });

    const savedPortfolio = await subportfolio.save();

    res.json({ 
      success: true,
      message: 'Image uploaded successfully',
      subportfolio: savedPortfolio 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// GET REQUEST for subbrand images
app.get('/uploads/', async (req, res) => {
  try {
    const subportfolios = await SubPortfolio.find().populate('subbrand'); // Populate the brand field with brand information
    const subportfolioData = subportfolios.map((subportfolio) => ({
      _id: subportfolio._id,
      image: subportfolio.image,
      subbrand: subportfolio.subbrand._id,
      subbrandName: subportfolio.subbrand.name, // Include the brand name
    }));
    res.json(subportfolioData);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.delete('/uploads/:id', async (req, res) => {
  try {
    const subportfolio = await SubPortfolio.findByIdAndDelete(req.params.id);
    if (!subportfolio) return res.status(404).json({ error: 'sub portfolio not found' });
    res.json({ message: 'sub portfolio image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});





// COVER IMAGE ROUTE
app.post('/upload/:brandId', uploadMiddleware.single('image'), async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const image = req.file.buffer;
    const contentType = req.file.mimetype;

    const b64Image = Buffer.from(image).toString('base64');
    const dataURI = `data:${contentType};base64,${b64Image}`;

    // Ensure the brand exists
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'joel cover',
      resource_type: 'auto',
    });

    const productId = new Date().getTime();

    // Create a new portfolio entry for the image
    const portfolio = new Portfolio({
      id: productId,
      image: result.url,
      brand: brandId,
      contentType,
    });

    const savedPortfolio = await portfolio.save();

    res.json({ 
      success: true,
      message: 'Image uploaded successfully',
      portfolio: savedPortfolio 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});



// UPLOAD IMAGE TO PORTFOLIO
app.post('/uploader/:brandId/:subbrandId', uploadMiddleware.single('image'), async (req, res) => {
  try {
    const { brandId, subbrandId } = req.params;
    const image = req.file.buffer;
    const contentType = req.file.mimetype;

    const b64Image = Buffer.from(image).toString('base64');
    const dataURI = `data:${contentType};base64,${b64Image}`;

    // Ensure the brand and subbrand exist
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const subbrand = await SubBrand.findById(subbrandId);
    if (!subbrand) {
      return res.status(404).json({ error: 'Sub-brand not found' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'joel portfolio',
      resource_type: 'auto',
    });

    // Create a new portfolio entry with brand and subbrand references
    const portfolio = new Portfolier({
      image: result.url,
      brand: brandId,
      subbrand: subbrandId,
      contentType,
    });

    const savedPortfolio = await portfolio.save();

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      portfolio: savedPortfolio,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// app.get('/uploader/:brandId/:subbrandId', async (req, res) => {
//   try {
//     const { brandId, subbrandId } = req.params;

//     // Find portfolio entries that match the brand and subbrand
//     const portfolios = await Portfolier.find({ brand: brandId, subbrand: subbrandId });

//     if (portfolios.length === 0) {
//       return res.status(404).json({ message: 'No portfolio entries found for this brand and subbrand' });
//     }

//     res.json({ success: true, portfolios });
//   } catch (error) {
//     console.error('Error fetching portfolio entries:', error);
//     res.status(500).json({ error: 'An error occurred while fetching portfolios' });
//   }
// });


app.get('/uploader/brand/:brandName', async (req, res) => {
  try {
    const { brandName } = req.params;
    console.log(`Fetching images for brand: ${brandName}`);

    const portfoliers = await Portfolier.find({ brandName })
      .populate('brand', 'name')
      .populate('subbrand', 'name');

    // Filter portfolios to match the requested brand name
    const filteredPortfolios = portfoliers.filter(
      (portfolio) => portfolio.brand?.name.toLowerCase() === brandName.toLowerCase()
    );

    if (!portfoliers.length) {
      console.log('No images found for this brand');
      return res.status(404).json({ error: 'No images found for this brand' });
    }

    const portfolioData = portfoliers.map((portfolio) => ({
      id: portfolio._id,
      image: portfolio.image,
      brand: portfolio.brand ? portfolio.brand._id : null,
      brandName: portfolio.brand ? portfolio.brand.name : null,
      subbrand: portfolio.subbrand ? portfolio.subbrand._id : null,
      subbrandName: portfolio.subbrand ? portfolio.subbrand.name : null,
      contentType: portfolio.contentType,
    }));

    res.json(portfolioData);
  } catch (error) {
    console.error('Error fetching brand images:', error);
    res.status(500).json({ error: 'An error occurred while fetching images' });
  }
});


//PORTFOLIER USEPARAMS TEST
app.get("/portfolier/:brandName", async (req, res) => {
  try {
    const { brandName } = req.params;

    console.log("Received brandName:", brandName);

    // 1️⃣ Find the brand by name to get its ID
    const brand = await Brand.findOne({ name: brandName });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    console.log("Found Brand:", brand);

    // 2️⃣ Use the brand ID to find portfolios
    const portfolios = await Portfolier.find({ brand: brand._id })
      .populate("brand", "name") // Populate brand details
      .populate("subbrand", "name"); // Populate subbrand details

    console.log("Fetched Portfolios:", portfolios);

    // 3️⃣ Find all subbrands related to this brand
    const subbrands = await SubBrand.find({ brand: brand._id });

    console.log("Fetched SubBrands:", subbrands);

    // 4️⃣ If no portfolios are found, return a message
    if (!portfolios.length) {
      return res.status(404).json({ message: "No portfolios found for this brand" });
    }

    // 5️⃣ Return both portfolios and subbrands
    res.json({ portfolios, subbrands });

  } catch (error) {
    console.error("Error fetching portfolios:", error);
    res.status(500).json({ error: "An error occurred while fetching portfolios" });
  }
});


// Get all images for a specific subbrand under a brand
app.get('/portfolier/:brandName/subbrand/:subbrandId', async (req, res) => {
  try {
    const { brandName, subbrandId } = req.params;

    // ✅ Check if subbrandId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(subbrandId)) {
      return res.status(400).json({ message: "Invalid subbrand ID" });
    }

    // ✅ Find portfolios that match both brandName and subbrandId
    const portfolios = await Portfolier.find({
      brandName: { $regex: new RegExp(`^${brandName}$`, "i") }, // Case insensitive brandName search
      subbrand: subbrandId, // Directly match the subbrandId field in Portfolier
    }).populate('subbrand', 'name'); // Populate subbrand name

    if (!portfolios.length) {
      return res.status(404).json({ message: "No portfolios found for this subbrand" });
    }

    // ✅ Extract images from the filtered portfolios
    const images = portfolios.flatMap((portfolio) =>
      Array.isArray(portfolio.image) ? portfolio.image : [portfolio.image]
    );

    res.json({ subbrandId, images });
  } catch (error) {
    console.error("Error fetching subbrand details:", error);
    res.status(500).json({ message: "Server error" });
  }
});





app.get('/uploader/:subbrandName', async (req, res) => {
  try {
    const { subbrandName } = req.params;

    const subbrand = await SubBrand.findOne({ name: subbrandName });
    if (!subbrand) return res.status(404).json({ error: 'SubBrand not found' });

    const portfolios = await Portfolier.find({ subbrand: subbrand._id })
      .populate('brand', 'name')
      .populate('subbrand', 'name');

    res.json({
      description: subbrand.description, // Include description
      portfolios: portfolios.map((portfolio) => ({
        id: portfolio._id,
        image: portfolio.image,
        subbrandName: portfolio.subbrand ? portfolio.subbrand.name : null
      }))
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});













// Define a route to handle requests for fetching product details based on product ID
app.get('/products/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    // Find the product with the specified ID
    const product = await Portfolio.findById(productId);

    if (product) {
      // If the product is found, send it as a JSON response
      res.json(product);
    } else {
      // If the product is not found, send a 404 Not Found response
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    // If an error occurs during the database query, send a 500 Internal Server Error response
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// upload to shop
app.post('/product', uploadMiddleware.single('file'), async (req,res) => {
  try {
    const {name,summary,amount} = req.body;
    const cover = req.file.buffer;
    const contentType = req.file.mimetype;

    // Generate a slug from the product name
    const slugify = (name) =>
      name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const slug = slugify(name);

    const b64Image = Buffer.from(cover).toString('base64');
    const dataURI = `data:${contentType};base64,${b64Image}`;
    const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'sope shop'
    });

    const productId = new Date().getTime();

    // Extract sizes and prices from req.body
    const sizes = [];
    let i = 0;
    while (req.body[`size_${i}_name`]) {
      const sizeName = req.body[`size_${i}_name`];
      const sizePrice = req.body[`size_${i}_price`];
      sizes.push({ size: sizeName, price: sizePrice });
      i++;
    }

    const productDoc = await Product.create({
      id: productId,
      name,
      slug,
      summary,
      amount,
      cover: result.url,
      contentType,
      sizes,
    });

    res.json(productDoc);

  } catch (error) {
      console.error('Error posting blog:', error);
      res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/product', async (req,res) => {
  res.json(
    await Product.find()
      .sort({createdAt: -1}))
})

// TEST SLUG
app.get('/product/:slug', async (req, res) => {
  const slug = req.params.slug;

  try {
    const product = await Product.findOne({ slug });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.delete('/product/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!port) return res.status(404).json({ error: 'product not found' });
    res.json({ message: 'product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});





app.get('/upload', async (req,res) => {
  try {
    const portfolios = await Portfolio.find().populate('brand'); // Populate the brand field with brand information
    const portfolioData = portfolios.map((portfolio) => ({
      id: portfolio._id,
      image: portfolio.image,
      brand: portfolio.brand ? portfolio.brand._id : null, // Check if brand is not null before accessing _id
      brandName: portfolio.brand ? portfolio.brand.name : null, // Include the brand name if available
      amount: portfolio.amount,
      name: portfolio.name,
      description: portfolio.description,
      quantity: portfolio.quantity
    }));
    res.json(portfolioData);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
})

app.get('/uploader', async (req, res) => {
  try {
    const portfolios = await Portfolier.find()
      .populate('brand', 'name') // Populate brand and only fetch the name field
      .populate('subbrand', 'name'); // Populate subbrand and only fetch the name field

    const portfolioData = portfolios.map((portfolio) => ({
      id: portfolio._id,
      image: portfolio.image,
      brand: portfolio.brand ? portfolio.brand._id : null,
      subbrand: portfolio.subbrand ? portfolio.subbrand._id : null,
      subbrandName: portfolio.subbrand ? portfolio.subbrand.name : null,
      contentType: portfolio.contentType,
    }));

    res.json(portfolioData);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'An error occurred while fetching portfolios' });
  }
});


app.delete('/upload/:id', async (req, res) => {
  try {
    console.log("Delete request received for ID:", req.params.id);

    const portfolio = await Portfolio.findByIdAndDelete(req.params.id);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    res.json({ message: 'Portfolio image deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.get('/upload/:brandName', async (req, res) => {
  try {
    const brandName = req.params.brandName;
    const brand = await Brand.findOne({ name: brandName });
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const portfolios = await Portfolio.find({ brand: brand._id });
    const portfolioData = portfolios.map((portfolio) => ({
      _id: portfolio._id,
      image: portfolio.image,
      brand: portfolio.brand,
      brandName: brand.name,
    }));
    
    res.json(portfolioData);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// ORDER ROUTE
app.post('/success', async (req, res) => {
  try {
    const { name, address, email, phone, country, reference, cartItem } = req.body;
    
    // Save order details to MongoDB
    const formEntry = new Order({
      name,
      address,
      email,
      phone,
      country,
      reference,
      cartItem,

      // paymentReference,
      // Add any other necessary fields
    });
    await formEntry.save();
    res.status(200).json({ success: true, message: 'Order saved successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred while saving the order.' });
  }
});

app.get('/orders', async (req, res) => {
  try {
    // Fetch all orders from MongoDB
    const orders = await Order.find();

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred while fetching orders.' });
  }
});





// PORT
const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Listening on port ${port}...`))