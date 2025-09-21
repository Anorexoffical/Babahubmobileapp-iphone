const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const Order = require("../Models/OrderModel.js");


// PayFast Payment Integration
const generateSignature = (data, passPhrase = "") => {
  const getString = Object.keys(data)
    .filter(key => data[key])
    .map(key => `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}`)
    .join("&") + (passPhrase ? `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}` : "");
  return crypto.createHash("md5").update(getString).digest("hex");
};

router.post("/payfast/initiate-payment", async (req, res) => {
  try {
    const { name, email, phone, address, items, subtotal, tax, total, } = req.body;
    const orderID = `${Date.now()}-${crypto.randomBytes(2).toString("hex")}`;

    //for sandbox test
    const merchant_id = "10036171";
    const merchant_key = "731ry9o3bmz2d";
    const return_url = "https://account.babahub.co/payment/payfast/success";
    const cancel_url = "https://account.babahub.co/payment/payfast/cancel";
    const notify_url = "https://account.babahub.co/payment/payfast/notifyurl";
    // const notify_url = "https://3a31-103-137-24-132.ngrok-free.app/payfast/notifyurl";

    console.log(items);
    
    const paymentData = {
      merchant_id, merchant_key, return_url, cancel_url, notify_url,
      name_first: name, email_address: email,
      m_payment_id: orderID, amount: total, item_name: `OID-${orderID}`,
      
      custom_str1: JSON.stringify(items.map(({ id, image, ...rest }) => rest)),
      custom_str2: JSON.stringify({ address }),
      custom_str3: phone, 
    };
    console.log(paymentData);
    paymentData.signature = generateSignature(paymentData);
    //for sandbox testing  	https://sandbox.payfast.co.za/eng/process 
    res.json({ paymentUrl: `https://sandbox.payfast.co.za/eng/process?${Object.keys(paymentData).map(key => `${key}=${encodeURIComponent(paymentData[key])}`).join("&")}` });
    // res.json({ paymentUrl: `https://www.payfast.co.za/eng/process?${Object.keys(paymentData).map(key => `${key}=${encodeURIComponent(paymentData[key])}`).join("&")}` });

  } catch (err) {
    res.status(500).json({ error: "Error initiating payment" });
  }
});

//fetch order data
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

// for sale Report
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

// Get orders for a specific user
router.get("/myorder", async (req, res) => {
  try {
    const { userName } = req.query;
    console.log("the login user", userName);

    const filter = {};
    if (userName) {
      filter.userName = userName; 
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Error fetching orders" });
  }
});


module.exports = router;
