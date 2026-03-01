const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 }
});

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  colorCode: { type: String, required: true },
  sizes: { type: [sizeSchema], required: true }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  image: { type: String },
  variants: { type: [variantSchema], required: true }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);
