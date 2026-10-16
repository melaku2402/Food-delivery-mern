import React, { useContext } from 'react'
import  './Navbar.css'
import '../../index.css'
import {assets} from '../../assets/assets'
import { useState } from 'react'
import { Link, useNavigate,  } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import logo from '../../assets/logo.png'
import  axios  from 'axios'
const Navbar = ({setShowLogin}) => {
  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, token, setToken,url,setFoodList } = useContext(StoreContext);
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };
 
  // // search part
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = async (e) => {
    e.preventDefault();
   
  };
  return (
    <div className="navbar">
      <Link to="/">
        <img src={logo} className="logo" />
      </Link>
      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => {
            setMenu("home");
          }}
          className={menu === "home" ? "active" : ""}
        >
          home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => {
            setMenu("menu");
          }}
          className={menu === "menu" ? "active" : ""}
        >
          menu
        </a>
        <a
          href="#app-download"
          onClick={() => {
            setMenu("mobile-app");
          }}
          className={menu === "mobile-app" ? "active" : ""}
        >
          mobile-app
        </a>
        <a
          href="#footer"
          onClick={() => {
            setMenu("contact-us");
          }}
          className={menu === "contact-us" ? "active" : ""}
        >
          contact us
        </a>
      </ul>
      <div className="navbar-right">
        <img  src={assets.search_icon} alt="" /> 

     
         <form onSubmit={handleSearch}>
           <input
             type="text"
             placeholder="Search for food..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <button type="submit" className='search-btn'>
                   <img src={assets.search_icon} alt="" /></button>
         </form>

        <div className="navbar-search-icon">


          <Link to="/cart">
            <img src={assets.basket_icon} alt="" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {!token ? (
          <button className='login-btn' onClick={() => setShowLogin(true)}>Sign in</button>
        ) : (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="" />
            <ul className="navbar-profile-dropdown">
              <li onClick={() => navigate("/myorders")}>
                <img src={assets.bag_icon} />
                <p>Order</p>
              </li>
              {/* <hr /> */}
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
      
    </div>
    
  );
}

export default Navbar
