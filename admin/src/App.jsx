import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Order from './pages/Order/Order'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLogin from './components/AdminLogin/AdminLogin'

const App = () => {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [adminToken, setAdminToken] = useState(
    () => localStorage.getItem("adminToken") || ""
  );

  const handleLogin = (token) => setAdminToken(token);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setAdminToken("");
  };

  if (!adminToken) {
    return (
      <>
        <ToastContainer />
        <AdminLogin url={url} onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div>
      <ToastContainer />
      <Navbar onLogout={handleLogout} />
      <hr />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/add" element={<Add url={url} token={adminToken} />} />
          <Route path="/list" element={<List url={url} token={adminToken} />} />
          <Route path="/order" element={<Order url={url} token={adminToken} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App