const express = require('express');
const cors = require('cors');
const mongoose= require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const Contact = require('./models/Contact');
const Academy = require('./models/Academy');
const Subscribe = require('./models/Subscribe');
const Brand = require('./models/Brand');
const SubBrand = require('./models/SubBrand');
const Portfolio = require('./models/Portfolio');
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

const allowedOrigins = process.env.ALLOWED_ORIGIN

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
// app.use('/uploads', express.static(__dirname + '/uploads'))

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


app.post('/register', async (req,res) => {
  const {username,password} = req.body
  try {
    const userDoc = await User.create({
      username, 
      password:bcrypt.hashSync(password,salt)
    })
    res.json(userDoc)
  } catch(e) {
    res.status(400).json(e)
  }
})

app.post('/login', async (req,res) => {
  const {username,password} = req.body;
  const userDoc = await User.findOne({username});
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
      if (err) throw err;
      res.cookie('token', token).json('ok')
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});

app.get('/profile', (req,res) => {
  const {token} = req.cookies;
  console.log('Received token:', token);
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      res.status(401).json('Unauthorized'); // Handle unauthorized error
    } else {
      res.json(info);
    }
  });
})



app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
  try {
    const {name,summary,amount} = req.body;
    const cover = req.file.buffer;
    const contentType = req.file.mimetype

    const b64Image = Buffer.from(cover).toString('base64');
    const dataURI = `data:${contentType};base64,${b64Image}`;

    const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'blog'
    });

    const productId = new Date().getTime();

    const postDoc = await Post.create({
      id: productId,
      name,
      summary,
      amount,
      cover: result.url,
      contentType
    });

    res.json(postDoc);

  } catch (error) {
      console.error('Error posting blog:', error);
      res.status(500).json({ error: 'An error occurred' });
  }
});


app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
  let newPath = null;
  if (req.file) {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }
  
    const {id,name,summary,content} = req.body;
    const postDoc = await Post.findById(id);

    postDoc.update({
      name,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.json(postDoc);

});

app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .sort({createdAt: -1}))
})

app.get('/post/:id', async (req,res) => {
  const {id} = req.params
  const postDoc = await Post.findById(id)
  res.json(postDoc)
})

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
    const { fullName, email, message } = req.body;
    const formEntry = new Contact({
      fullName,
      email,
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
      brandName: subbrand.brand.name, // Include the brand name
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





// POST REQUEST FOR UPLOADING IMAGE to a brand by ID
app.post('/upload/:brandId', uploadMiddleware.single('image'), async (req, res) => {
  try {
    const brandId = req.params.brandId;
    const image = req.file.buffer;
    const contentType = req.file.mimetype;
    const { name, description, amount, quantity } = req.body;

    const b64Image = Buffer.from(image).toString('base64');
    const dataURI = `data:${contentType};base64,${b64Image}`;

    // Ensure the brand exists
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'joel portfolio',
      resource_type: 'auto',
    });

    const productId = new Date().getTime();

    // Create a new portfolio entry for the image
    const portfolio = new Portfolio({
      id: productId,
      image: result.url,
      brand: brandId,
      contentType,
      name,
      description,
      amount,
      quantity
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


// app.get('/upload', async (req,res) => {
//   try {
//     const portfolios = await Portfolio.find().populate('brand'); // Populate the brand field with brand information
//     const portfolioData = portfolios.map((portfolio) => ({
//       id: portfolio._id,
//       image: portfolio.image,
//       brand: portfolio.brand._id,
//       brandName: portfolio.brand.name, // Include the brand name
//       amount: portfolio.amount,
//       name: portfolio.name,
//       description: portfolio.description,
//       quantity: portfolio.quantity
//     }));
//     res.json(portfolioData);
//   } catch (error) {
//     console.error('Error fetching images:', error);
//     res.status(500).json({ error: 'An error occurred' });
//   }
// })

app.delete('/upload/:id', async (req, res) => {
  try {
    const portfolio = await Portfolio.findByIdAndDelete(req.params.id);
    if (!portfolio) return res.status(404).json({ error: 'portfolio not found' });
    res.json({ message: 'portfolio image deleted successfully' });
  } catch (error) {
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