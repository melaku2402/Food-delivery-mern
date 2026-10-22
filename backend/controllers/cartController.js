import userModel from "../models/userModel.js";

// item ids are Mongo ObjectIds; anything else could be used to write odd keys
const validId = (id) => typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

// add one unit (atomic, so quick repeated clicks never lose a count)
const addToCart = async (req, res) => {
  const { userId, itemId } = req.body;
  if (!validId(itemId)) return fail(res, 400, "Invalid item ID.");
  try {
    await userModel.findByIdAndUpdate(userId, { $inc: { [`cartData.${itemId}`]: 1 } });
    res.json({ success: true, message: "Added to cart." });
  } catch (error) {
    console.error("addToCart error:", error);
    fail(res, 500, "Could not add item to cart.");
  }
};

// remove one unit, or the whole line when `all` is true
const removeFromCart = async (req, res) => {
  const { userId, itemId, all } = req.body;
  if (!validId(itemId)) return fail(res, 400, "Invalid item ID.");
  try {
    if (all) {
      await userModel.findByIdAndUpdate(userId, { $unset: { [`cartData.${itemId}`]: "" } });
    } else {
      // only decrement while the count is above zero, then drop lines that hit zero
      await userModel.updateOne(
        { _id: userId, [`cartData.${itemId}`]: { $gt: 0 } },
        { $inc: { [`cartData.${itemId}`]: -1 } }
      );
      await userModel.updateOne(
        { _id: userId, [`cartData.${itemId}`]: { $lte: 0 } },
        { $unset: { [`cartData.${itemId}`]: "" } }
      );
    }
    res.json({ success: true, message: "Cart updated." });
  } catch (error) {
    console.error("removeFromCart error:", error);
    fail(res, 500, "Could not remove item from cart.");
  }
};

// fetch the user's cart
const getCart = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId).lean();
    if (!userData) return fail(res, 404, "User not found.");
    res.json({ success: true, cartData: userData.cartData || {} });
  } catch (error) {
    console.error("getCart error:", error);
    fail(res, 500, "Could not fetch cart.");
  }
};

export { addToCart, removeFromCart, getCart };
