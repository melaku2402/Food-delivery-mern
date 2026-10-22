import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./AdminLogin.css";

const AdminLogin = ({ url, onLogin }) => {
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.post(`${url}/api/user/admin-login`, data);
      if (res.data.success && res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
        onLogin(res.data.token);
      } else {
        toast.error(res.data.message || "Login failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-overlay">
      <form className="admin-login-box" onSubmit={onSubmit}>
        <h2>Admin Login</h2>
        <p>Enter your admin credentials to continue.</p>
        <input
          type="email"
          name="email"
          value={data.email}
          onChange={onChange}
          placeholder="Admin email"
          required
          autoComplete="email"
        />
        <input
          type="password"
          name="password"
          value={data.password}
          onChange={onChange}
          placeholder="Password"
          required
          autoComplete="current-password"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;

