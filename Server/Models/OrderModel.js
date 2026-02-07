const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderID: String,
  name: String,
  email: String,
  phoneNO: String,
  address: String,
  totalAmount: Number,
  payFastTax: String,
  totalAmountAfterTax: String,
  pf_payment_id: String,
  paymentStatus: {
    type: String,
    enum: ["PENDING", "COMPLETE", "CANCELLED"],
    default: "PENDING",
  },
  items: [
    {
      productID: mongoose.Schema.Types.ObjectId, 
      title: String,
      price: Number,
      quantity: Number,
      subTotal: Number,
      size: String,
      color: String
    },
  ],
  deliveryStatus: {
    type: String,
    enum: ["Processing", "Shipped", "Completed"],
    default: "Processing",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);

