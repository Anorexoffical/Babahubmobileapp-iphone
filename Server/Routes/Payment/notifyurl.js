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

        const pfData = JSON.parse(JSON.stringify(req.body));

        let pfParamString = "";
        for (const key in pfData) {
            if (key !== 'signature') {
                pfParamString += `${key}=${encodeURIComponent(String(pfData[key]).trim()).replace(/%20/g, "+")}&`;
            }
        }
        pfParamString = pfParamString.slice(0, -1);


        const check1 = pfValidSignature(pfData, pfParamString, passPhrase);
        const check4 = await pfValidServerConfirmation(pfHost, pfParamString);

        if (check1 && check4) {
            console.log("Payment verified and successful");
            console.log(pfData);
            if (pfData['payment_status'] === "COMPLETE") {

                const orderRef = pfData["m_payment_id"] || pfData["custom_str1"] || pfData["item_name"];
                if (!orderRef) {
                    console.error("Missing order reference in ITN payload");
                    return res.status(400).send("Missing order reference");
                }

                const totalAmount = parseFloat(pfData["amount_gross"]);
                const payFastTax = parseFloat(pfData["amount_fee"]);
                const totalAmountAfterTax = parseFloat(pfData["amount_net"]);

                console.log("Updating order in database...", orderRef);

                const updated = await Order.findOneAndUpdate(
                    { orderID: orderRef },
                    {
                        $set: {
                            pf_payment_id: pfData["pf_payment_id"],
                            totalAmount: Number.isFinite(totalAmount) ? totalAmount : undefined,
                            payFastTax: Number.isFinite(payFastTax) ? String(payFastTax) : undefined,
                            totalAmountAfterTax: Number.isFinite(totalAmountAfterTax) ? String(totalAmountAfterTax) : undefined,
                            paymentStatus: "COMPLETE",
                        },
                    },
                    { new: true }
                );

                if (!updated) {
                    console.error("Order not found for ITN:", orderRef);
                    return res.status(404).send("Order not found");
                }

                console.log("Order updated successfully:", updated.orderID);
                return res.status(200).send("OK");

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
router.get("/payfast/cancel", async (req, res) => {
    try {
        const orderRef = req.query?.m_payment_id || req.query?.orderID;
        console.log("Payment was cancelled by the user", { orderRef });

        if (orderRef) {
            await Order.findOneAndUpdate(
                { orderID: String(orderRef), paymentStatus: "PENDING" },
                { $set: { paymentStatus: "CANCELLED" } },
                { new: true }
            );
        }

        res.send("Payment Cancelled. Please try again if needed.");
    } catch (err) {
        console.error("Error handling PayFast cancel:", err);
        res.status(500).send("Payment Cancelled. Please try again if needed.");
    }
});

module.exports = router;
