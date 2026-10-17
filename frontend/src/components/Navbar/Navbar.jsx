import React, { useContext, useState } from "react";
import "./Navbar.css";
import "../../index.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [open, setOpen] = useState(false); // mobile menu
  const [searchTerm, setSearchTerm] = useState("");
  const { getTotalCartAmount, token, logout: signOut, url, setSearchResults } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const logout = () => {
    signOut(); // clears the token and the cart on screen
    navigate("/");
  };

  const go = (name) => {
    setMenu(name);
    setOpen(false);
  };

  // Search the menu, then jump to the results
  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    try {
      if (!query) {
        setSearchResults(null); // empty search shows the whole menu again
      } else {
        const res = await axios.post(url + "/api/food/search", { query });
        if (res.data.success) setSearchResults(res.data.data);
      }
    } catch (error) {
      console.error("Search failed:", error.message);
    }
    setOpen(false);
    navigate("/");
    setTimeout(() => {
      document
        .getElementById("food-display")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 60);
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand" onClick={() => go("home")}>
        <img src={assets.logo2} className="logo" alt="Home" />
      </Link>

      <nav
        id="primary-nav"
        className={open ? "navbar-links open" : "navbar-links"}
        aria-label="Main"
      >
        <ul className="navbar-menu">
          <li>
            <Link
              to="/"
              onClick={() => go("home")}
              className={menu === "home" ? "active" : ""}
            >
              Home
            </Link>
          </li>
          <li>
            <a
              href="#explore-menu"
              onClick={() => go("menu")}
              className={menu === "menu" ? "active" : ""}
            >
              Menu
            </a>
          </li>
          <li>
            <a
              href="#app-download"
              onClick={() => go("mobile-app")}
              className={menu === "mobile-app" ? "active" : ""}
            >
              Mobile app
            </a>
          </li>
          <li>
            <a
              href="#footer"
              onClick={() => go("contact-us")}
              className={menu === "contact-us" ? "active" : ""}
            >
              Contact us
            </a>
          </li>
        </ul>

        <form className="navbar-search" onSubmit={handleSearch} role="search">
          <input
            type="search"
            placeholder="Search for food"
            aria-label="Search for food"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            <img src={assets.search_icon} alt="" />
          </button>
        </form>
      </nav>

      <div className="navbar-actions">
        <Link to="/cart" className="navbar-cart" aria-label="Cart">
          <img src={assets.basket_icon} alt="" />
          {getTotalCartAmount() === 0 ? null : <span className="dot" />}
        </Link>

        {!token ? (
          <button className="login-btn" onClick={() => setShowLogin(true)}>
            Sign in
          </button>
        ) : (
          <div className="navbar-profile">
            <button className="navbar-profile-btn" aria-label="Account menu">
              <img src={assets.profile_icon} alt="" />
            </button>
            <ul className="navbar-profile-dropdown">
              <li>
                <button onClick={() => navigate("/myorders")}>
                  <img src={assets.bag_icon} alt="" />
                  <span>Orders</span>
                </button>
              </li>
              <li>
                <button onClick={logout}>
                  <img src={assets.logout_icon} alt="" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        <button
          className={open ? "navbar-burger is-open" : "navbar-burger"}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
