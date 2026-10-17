import React from "react";
import "./Header.css";
import { assets } from "../../assets/assets";

const Header = () => {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-media">
        <img
          className="hero-img"
          src={assets.header_img}
          alt="Roasted salmon with broccoli and quinoa on a white plate"
          width="1534"
          height="650"
          fetchPriority="high"
        />
      </div>

      <div className="hero-panel">
        <h1 id="hero-title" className="hero-title">
          <span className="hero-line" style={{ "--n": 0 }}>
            <span>Order your</span>
          </span>
          <span className="hero-line" style={{ "--n": 1 }}>
            <span>favourite</span>
          </span>
          <span className="hero-line" style={{ "--n": 2 }}>
            <span>food here</span>
          </span>
        </h1>

        <p className="hero-copy">
          Fresh dishes from our menu, cooked to order and delivered to your
          door.
        </p>

        <a className="hero-cta" href="#explore-menu">
          View menu
        </a>
      </div>
    </section>
  );
};

export default Header;
