const Cart = require("../models/Cart");

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId }).populate("items.product");
    if (!cart) {
      return res.status(200).json({ items: [] });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

exports.syncCart = async (req, res) => {
  try {
    const { items } = req.body; // Expects array of cart items from frontend

    let cart = await Cart.findOne({ userId: req.userId });

    if (!cart) {
      cart = new Cart({ userId: req.userId, items: items || [] });
    } else {
      cart.items = items || [];
    }

    await cart.save();
    
    // Populate the product details to send back a complete cart if needed
    await cart.populate("items.product");

    res.status(200).json({ message: "Cart synced successfully", cart });
  } catch (error) {
    console.error("Sync cart error:", error);
    res.status(500).json({ message: "Failed to sync cart" });
  }
};
