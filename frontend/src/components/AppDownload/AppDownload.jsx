import React from "react";
import "./AppDownload.css";
import { assets } from "../../assets/assets";

const AppDownload = () => {
  return (
    <section className="app-download" id="app-download">
      <h2>
        For a better experience, <br />
        download the Tomato app
      </h2>
      <div className="app-download-platforms">
        <img src={assets.play_store} alt="Get it on Google Play" />
        <img src={assets.app_store} alt="Download on the App Store" />
      </div>
    </section>
  );
};

export default AppDownload;
