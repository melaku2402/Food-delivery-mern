import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

// Created only if a key exists, so the server still starts without Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

//placing user for frontend
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
  if (!stripe) {
    return res.json({ success: false, message: "Payments are not configured (STRIPE_SECRET_KEY missing)" });
  }
  try {
    console.log("Backend received items:", req.body.items);
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    console.log("Mongoose object before save:", newOrder);
    
    await newOrder.save();

    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "inr", //dollar
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "inr", //dollar
        product_data: { name: "Delivery Charges" },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
    });
    console.log(session);
    
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error from session" });
  }
};

// verify
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body
  console.log(req.body);

  try {
    if (success == "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: " Payment Failed" });
    }
  } catch (error) {
    console.log(error);

    res.json({ success: false, message: "error in verifyOrder" });
  }
};


// const userOrders = async (req, res) => {
//     const userId = req.userId;
//     try {
//         const orders = await orderModel.find({userId:userId });
//         res.json({ success: true, data: orders });
//         console.log("the order value" + orders);
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: "Error fetching orders" });
//     }
// };
// File: orderController.js

const userOrders = async (req, res) => {
    // Add this line to confirm the userId is being received
    console.log("Received userId:", req.userId);

    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching orders" });
    }
     console.log("UserID from token:", req.userId);
    console.log("Type of UserID:", typeof req.userId);
};

//Listing orders for panel
const listOrders = async (req,res)=>{
try {
  const orders = await orderModel.find({});
  res.json({success:true,data:orders})
  console.log(orders);
  
} catch (error) {
  console.log(error);
    res.json({ success: false, message: "Error from list order" });

}

}

//api for updating order status
const updateStatus = async (req, res)=>{
 try {
  await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
  res.json({success:true,message:"Status Updated"})
 } catch (error) {
  console.log(error);
    res.json({ success: false, message: "Error Status Updated part" });

 }
}

export { placeOrder, verifyOrder, userOrders, listOrders,updateStatus };
