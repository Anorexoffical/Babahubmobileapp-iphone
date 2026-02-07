const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const Order = require("../Models/OrderModel.js");
const env = require('../config/env');

// PayFast Payment Integration
const generateSignature = (data, passPhrase = env.PAYFAST_PASSPHRASE) => {
  const getString = Object.keys(data)
    .filter((key) => data[key] !== undefined && data[key] !== null && String(data[key]).trim() !== "")
    .map((key) => `${key}=${encodeURIComponent(String(data[key]).trim()).replace(/%20/g, "+")}`)
    .join("&") + (passPhrase ? `&passphrase=${encodeURIComponent(String(passPhrase).trim()).replace(/%20/g, "+")}` : "");
  return crypto.createHash("md5").update(getString).digest("hex");
};

router.post("/payfast/initiate-payment", async (req, res) => {
  try {
    const { name, email, phone, address, items, subtotal, tax, total } = req.body;
    const orderID = `OID-${Date.now()}-${crypto.randomBytes(2).toString("hex")}`;

    const merchant_id = env.PAYFAST_MERCHANT_ID;
    const merchant_key = env.PAYFAST_MERCHANT_KEY;
    const addQueryParam = (url, key, value) => {
      if (!url) return url;
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    };

    const return_url = addQueryParam(env.PAYFAST_RETURN_URL, "m_payment_id", orderID);
    const cancel_url = addQueryParam(env.PAYFAST_CANCEL_URL, "m_payment_id", orderID);
    const notify_url = env.PAYFAST_NOTIFY_URL;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Persist the full order details on our side.
    // PayFast custom_str fields are limited to 255 chars, so we only pass the short order reference.
    const formattedItems = items.map((item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      return {
        title: item.title,
        price,
        quantity,
        size: item.size,
        color: item.color,
        subTotal: price * quantity,
      };
    });

    await Order.create({
      orderID,
      name,
      email,
      phoneNO: phone,
      address,
      totalAmount: Number(total),
      payFastTax: String(tax ?? ""),
      totalAmountAfterTax: String(total ?? ""),
      items: formattedItems,
      paymentStatus: "PENDING",
    });

    const paymentData = {
      merchant_id, 
      merchant_key, 
      return_url, 
      cancel_url, 
      notify_url,
      name_first: name, 
      email_address: email,
      m_payment_id: orderID, 
      amount: total, 
      item_name: orderID,
      custom_str1: orderID,
      custom_str2: email,
      custom_str3: phone,
    };
    
    console.log(paymentData);
    paymentData.signature = generateSignature(paymentData);
    
    const processBase = `https://${env.PAYFAST_PROCESS_HOST}/eng/process`;
    res.json({
      orderID,
      paymentUrl: `${processBase}?${Object.keys(paymentData)
        .map((key) => `${key}=${encodeURIComponent(String(paymentData[key]))}`)
        .join("&")}`,
    });

  } catch (err) {
    console.error("Error initiating PayFast payment:", err);
    res.status(500).json({ error: "Error initiating payment" });
  }
});

// Fetch all orders
router.get("/get", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// Update the delivery status
router.put("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Processing", "Shipped", "Completed"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderID: req.params.id },
      { deliveryStatus: status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: "Failed to update delivery status" });
  }
});

// For sale Report
router.get("/searchByDate", async (req, res) => {
  try {
    const { fromDate, toDate, status } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: "From and To dates are required" });
    }

    // Build filter
    const filter = {
      createdAt: {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      },
    };

    if (status && status !== "all") {
      filter.deliveryStatus = status;
    }

    const orders = await Order.find(filter);

    res.json(orders);
  } catch (error) {
    console.error("Error in /searchByDate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get orders for a specific user by email
router.get("/myorder", async (req, res) => {
  try {
    const { userEmail } = req.query;
    console.log("Fetching orders for email:", userEmail);

    const filter = {};
    if (userEmail) {
      filter.email = userEmail; // Changed from userName to email
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    console.log(`Found ${orders.length} orders for email: ${userEmail}`);
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Error fetching orders" });
  }
});

module.exports = router;