import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

// Created only if a key exists, so the server still starts without Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Use the currency set in env; fall back to "usd" so the $ signs in the UI are correct.
const CURRENCY = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();
// Delivery fee in the smallest currency unit (cents / paise / etc.)
const DELIVERY_FEE_UNITS = 200; // $2.00

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

// Place a new order and create a Stripe checkout session
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";

  if (!stripe) {
    return fail(res, 503, "Payments are not configured (STRIPE_SECRET_KEY missing).");
  }

  const { items, amount, address, userId } = req.body;

  // --- Input validation ---
  if (!Array.isArray(items) || items.length === 0) {
    return fail(res, 400, "Your cart is empty.");
  }
  if (typeof amount !== "number" || amount <= 0) {
    return fail(res, 400, "Invalid order amount.");
  }
  if (!address || typeof address !== "object") {
    return fail(res, 400, "Delivery address is required.");
  }

  try {
    const newOrder = await orderModel.create({
      userId,
      items,
      amount,
      address,
    });

    // Clear cart in the background — don't await so the user isn't blocked
    userModel.findByIdAndUpdate(userId, { cartData: {} }).catch(() => {});

    const line_items = items.map((item) => ({
      price_data: {
        currency: CURRENCY,
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: CURRENCY,
        product_data: { name: "Delivery Charges" },
        unit_amount: DELIVERY_FEE_UNITS,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("placeOrder error:", error);
    fail(res, 500, "Could not create your order. Please try again.");
  }
};

// Verify Stripe payment result (called from the /verify redirect page)
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  if (!orderId) {
    return fail(res, 400, "Order ID is required.");
  }

  try {
    if (success === "true" || success === true) {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Payment confirmed." });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment cancelled." });
    }
  } catch (error) {
    console.error("verifyOrder error:", error);
    fail(res, 500, "Could not verify payment. Please contact support.");
  }
};

// Fetch all orders for the logged-in customer
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userId: req.body.userId })
      .sort({ date: -1 }); // newest first
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("userOrders error:", error);
    fail(res, 500, "Error fetching orders.");
  }
};

// List all orders for the admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("listOrders error:", error);
    fail(res, 500, "Error fetching orders.");
  }
};

// Update an order's status (admin only)
const updateStatus = async (req, res) => {
  const { orderId, status } = req.body;
  if (!orderId || !status) {
    return fail(res, 400, "orderId and status are required.");
  }
  try {
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status updated." });
  } catch (error) {
    console.error("updateStatus error:", error);
    fail(res, 500, "Could not update status.");
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
