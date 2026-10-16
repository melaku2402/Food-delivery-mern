import React from "react";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { assets } from "../../assets/assets";
import "./Order.css";

const Order = ({ url }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/list");
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Error loading orders");
      }
    } catch (error) {
      toast.error("Cannot reach the server");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const statusHandler = async (event, orderId) => {
    // console.log(event,orderId);
    try {
      const response = await axios.post(url + "/api/order/status", {
        orderId,
        status: event.target.value,
      });
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      toast.error("Could not update status");
    }
  };

  return (
    <div className="order add">
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={order._id} className="order-item">
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className="order-item-food">
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity;
                  } else {
                    return item.name + " x " + item.quantity + ",";
                  }
                })}
              </p>
              <p className="order-item-name">
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <div className="order-item-address">
                <p>{order.address.street + ", "}</p>
                <p>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.country}
                </p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
            </div>
            <p>Item :{order.items.length}</p>
            <p>💲{order.amount}</p>
            <select
              onChange={(event) => statusHandler(event, order._id)}
              value={order.status}
              id=""
            >
              <option value="Food Processing">Food Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Order;
