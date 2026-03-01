const express = require('express');
const router = express.Router();
const Product = require('../Models/ProductModel'); 

const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage });

// ADD product with image
router.post('/', upload.single('mainImage'), async (req, res) => {
  try {
    const { name, description, brand, category, isFeatured, isTrending, variants } = req.body;

    const product = new Product({
      name,
      description,
      brand,
      category,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isTrending: isTrending === 'true' || isTrending === true,
      variants: JSON.parse(variants), 
      image: req.file ? `/uploads/products/${req.file.filename}` : null
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id', upload.single('mainImage'), async (req, res) => {
  try {
    const { name, description, brand, category, isFeatured, isTrending, variants } = req.body;

    // Handle variants safely
    let parsedVariants = variants;
    if (typeof variants === 'string') {
      try {
        parsedVariants = JSON.parse(variants);
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON format for variants" });
      }
    }

    const updateData = {
      name,
      description,
      brand,
      category,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      variants: parsedVariants
    };

    // Only update isTrending if explicitly provided (avoids clearing it from older clients)
    if (typeof isTrending !== 'undefined') {
      updateData.isTrending = isTrending === 'true' || isTrending === true;
    }

    // If a new image is uploaded, update it
    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: err.message });
  }
});




router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// for featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured products', error });
  }
});

// for trending products
router.get('/trending', async (req, res) => {
  try {
    const products = await Product.find({ isTrending: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trending products', error });
  }
});

//for product detail page
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
