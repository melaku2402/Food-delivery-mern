import React, { useContext, useEffect, useState } from 'react';
import "./MyOrder.css";
import { StoreContext } from '../../Context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';

const MyOrder = () => {
    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
            setData(response.data.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token]);

    return (
        <div className='my-orders'>
            <div className="my-orders-header">
                <h2>My Orders</h2>
                <p>Track your active and past food deliveries in real time.</p>
            </div>

            {loading ? (
                <div className="orders-skeleton-container">
                    <div className="orders-skeleton"></div>
                    <div className="orders-skeleton"></div>
                </div>
            ) : data.length === 0 ? (
                <div className="orders-empty">
                    <div className="orders-empty-art">📦</div>
                    <h3>No orders found</h3>
                    <p>You haven't placed any food orders yet. Explore our menu and satisfy your cravings!</p>
                </div>
            ) : (
                <div className="orders-container">
                    {data.map((order, index) => {
                        return (
                            <div key={index} className="order-card" style={{ "--i": index }}>
                                <div className="order-card-left">
                                    <div className="order-media">
                                        <img src={assets.parcel_icon} alt="Parcel" />
                                    </div>
                                    <div className="order-info">
                                        <span className="order-id">Order #{index + 1}</span>
                                        <p className="order-items-list">
                                            {order.items.map((item, idx) => {
                                                if (idx === order.items.length - 1) {
                                                    return item.name + " × " + item.quantity;
                                                } else {
                                                    return item.name + " × " + item.quantity + ", ";
                                                }
                                            })}
                                        </p>
                                        <span className="order-count">Total Items: <b>{order.items.length}</b></span>
                                    </div>
                                </div>

                                <div className="order-card-right">
                                    <div className="order-price">
                                        <small>Amount</small>
                                        <b>${order.amount}.00</b>
                                    </div>
                                    
                                    <div className={`order-status status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                        <span className="status-dot"></span>
                                        <b>{order.status}</b>
                                    </div>

                                    <button className="order-track-btn" onClick={fetchOrders}>
                                        Track Order
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyOrder;