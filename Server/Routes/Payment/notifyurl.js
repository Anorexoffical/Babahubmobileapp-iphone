const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require('axios');
// const mongoose = require("mongoose");
const Order = require("../../Models/OrderModel");
const env = require('../../config/env');


const passPhrase = env.PAYFAST_PASSPHRASE;
const pfHost = env.PAYFAST_PROCESS_HOST;


const pfValidSignature = (pfData, pfParamString, pfPassphrase = null) => {
    let tempParamString = pfParamString;
    if (pfPassphrase) {
        tempParamString += `&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, "+")}`;
    }
    const signature = crypto.createHash('md5').update(tempParamString).digest('hex');
    console.log("Generated Signature:", signature);
    console.log("PayFast Sent Signature:", pfData["signature"]);
    return pfData['signature'] === signature;
};

const pfValidServerConfirmation = async (pfHost, pfParamString) => {
    try {
        const response = await axios.post(`https://${pfHost}/eng/query/validate`, pfParamString, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        console.log("server response:", response.data);
        return response.data === 'VALID';
    } catch (error) {
        console.error('Error confirming with server:', error);
        return false;
    }
};


router.post("/payfast/notifyurl", async (req, res) => {
    
    try {
        console.log("inside the notifyurl route")

        // const pfData = req.body

        const pfData = JSON.parse(JSON.stringify(req.body));

        let pfParamString = "";
        for (const key in pfData) {
            if (key !== 'signature') {
                pfParamString += `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`;
            }
        }
        pfParamString = pfParamString.slice(0, -1);


        const check1 = pfValidSignature(pfData, pfParamString, passPhrase);
        const check4 = await pfValidServerConfirmation(pfHost, pfParamString);

        if (check1 && check4) {
            console.log("Payment verified and successful");
            console.log(pfData);
            if (pfData['payment_status'] === "COMPLETE") {

                console.log("Saving order to database...");

                const items = JSON.parse(pfData["custom_str1"]); 
                const addressData = JSON.parse(pfData["custom_str2"]); 
                const totalAmount = parseFloat(pfData["amount_gross"]); 
                const payFastTax = parseFloat(pfData["amount_fee"]); 
                const totalAmountAfterTax = parseFloat(pfData["amount_net"]); 
        
                const formattedItems = items.map((item) => ({
                //   productID: new mongoose.Types.ObjectId(), 
                  title: item.title,
                  price: item.price,
                  quantity: item.quantity,
                  size: item.size,
                  color: item.color,
                  subTotal: item.price * item.quantity, 
                }));
        
                const newOrder = new Order({
                  
                  orderID: pfData["item_name"],
                  name: pfData["name_first"],
                  email: pfData["email_address"],
                  phoneNO: pfData["custom_str3"],
                  address: addressData.address,
                  totalAmount,
                  payFastTax: payFastTax,
                  totalAmountAfterTax: totalAmountAfterTax,
                  pf_payment_id: pfData["pf_payment_id"],
                  items: formattedItems,
                });
        
                await newOrder.save();
                console.log("Order saved successfully:", newOrder);
                res.status(200).send("OK");

            }

        } else {
            console.log("Payment verification failed");
            res.status(400).send("Verification Failed");
        }

    } catch (error) {
        console.error("Error saving order:", error);
        res.status(500).send("Internal Server Error");
    }


});

// Handle payment success and later have to make a complete page
router.get("/payfast/success", (req, res) => {
    console.log("Payment was successful from sucees route");
    res.send("Payment Successful! Thank you for your order.");
});

//  payment cancellation later have to make complete page
router.get("/payfast/cancel", (req, res) => {
    console.log("Payment was cancelled by the user");
    res.send("Payment Cancelled. Please try again if needed.");
});

module.exports = router;
