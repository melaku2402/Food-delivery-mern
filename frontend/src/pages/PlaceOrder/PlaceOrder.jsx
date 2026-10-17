import React, { useContext, useState, useEffect } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    if (loading) return;

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item };
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 2,
    };

    setLoading(true);
    try {
      const response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
      if (response.data.success) {
        const { session_url } = response.data;
        window.location.replace(session_url);
      } else {
        alert("Error placing order. Please try again.");
      }
    } catch (error) {
      console.error("Network or server error:", error);
      alert("Can't reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token]);

  return (
    <div className="place-order-wrapper">
      <form onSubmit={placeOrder} className="place-order">
        <div className="place-order-left">
          <div className="place-order-header">
            <h2>Delivery Information</h2>
            <p>Please enter your shipping address and contact details.</p>
          </div>

          <div className="multi-fields">
            <input
              name="firstName"
              onChange={onChangeHandler}
              value={data.firstName}
              type="text"
              placeholder="First name"
              required
            />
            <input
              name="lastName"
              onChange={onChangeHandler}
              value={data.lastName}
              type="text"
              placeholder="Last name"
              required
            />
          </div>

          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            required
            placeholder="Email address"
          />
          <input
            name="street"
            onChange={onChangeHandler}
            value={data.street}
            type="text"
            required
            placeholder="Street address"
          />

          <div className="multi-fields">
            <input
              name="city"
              onChange={onChangeHandler}
              value={data.city}
              type="text"
              required
              placeholder="City"
            />
            <input
              name="state"
              onChange={onChangeHandler}
              value={data.state}
              type="text"
              required
              placeholder="State / Province"
            />
          </div>

          <div className="multi-fields">
            <input
              name="zipcode"
              onChange={onChangeHandler}
              value={data.zipcode}
              type="text"
              required
              placeholder="Zip code"
            />
            <input
              name="country"
              onChange={onChangeHandler}
              value={data.country}
              type="text"
              required
              placeholder="Country"
            />
          </div>

          <input
            name="phone"
            onChange={onChangeHandler}
            value={data.phone}
            type="tel"
            required
            placeholder="Phone number"
          />
        </div>

        <div className="place-order-right">
          <div className="cart-total modern-summary">
            <h2>Cart Totals</h2>
            <div className="cart-total-box">
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>${getTotalCartAmount()}.00</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>${getTotalCartAmount() === 0 ? 0 : 2}.00</p>
              </div>
              <hr />
              <div className="cart-total-details total-row">
                <p>Total</p>
                <p>${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}.00</p>
              </div>
            </div>
            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading ? "Processing..." : "PROCEED TO PAYMENT"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;