import mongoose from "mongoose";

const ORDER_STATUSES = [
  "Order Placed",
  "Food Processing",
  "Out for delivery",
  "Delivered",
];

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Order Placed",
    },
    date: { type: Date, default: Date.now },
    payment: { type: Boolean, default: false },
  },
  { timestamps: false }
);

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export { ORDER_STATUSES };
export default orderModel;