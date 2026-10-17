import React, { useEffect, useState } from "react";
import "./index.css";
import Navbar from "./components/Navbar/Navbar";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Cart from "./pages/Cart/Cart";
import Home from "./pages/Home/Home";
import Footer from "./components/Footer/Footer";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import Verify from "./pages/Verify/Verify";
import MyOrder from "./pages/MyOrder/MyOrder";

// Start every page at the top when the route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null}
      <ScrollToTop />
      <div className="App">
        <Navbar setShowLogin={setShowLogin} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart setShowLogin={setShowLogin} />} />
            <Route path="/order" element={<PlaceOrder />} />
            <Route path="/verify" element={<Verify />} />
            <Route
              path="/myorders"
              element={<MyOrder setShowLogin={setShowLogin} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default App;
