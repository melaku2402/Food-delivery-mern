import userModel from "../models/userModel.js";

// item ids are Mongo ObjectIds; anything else could be used to write odd keys
const validId = (id) => typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

// add one unit (atomic, so quick repeated clicks never lose a count)
const addToCart = async (req, res) => {
  const { userId, itemId } = req.body;
  if (!validId(itemId)) return res.json({ success: false, message: "Invalid item" });
  try {
    await userModel.findByIdAndUpdate(userId, { $inc: { [`cartData.${itemId}`]: 1 } });
    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error not added" });
  }
};

// remove one unit, or the whole line when `all` is true
const removeFromCart = async (req, res) => {
  const { userId, itemId, all } = req.body;
  if (!validId(itemId)) return res.json({ success: false, message: "Invalid item" });
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
    res.json({ success: true, message: "Removed from Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error not Removed" });
  }
};

// fetch the user's cart
const getCart = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (!userData) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, cartData: userData.cartData || {} });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error not get" });
  }
};

export { addToCart, removeFromCart, getCart };
