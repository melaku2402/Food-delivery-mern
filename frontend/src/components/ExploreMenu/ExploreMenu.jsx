import React from "react";
import "./ExploreMenu.css";
import { menu_list } from "../../assets/assets";

const ExploreMenu = ({ category, setCategory }) => {
  return (
    <section className="explore-menu" id="explore-menu">
      <h2>Explore our menu</h2>
      <p className="explore-menu-text">
        Pick a category to see what's cooking. Tap it again to show everything.
      </p>

      <div className="explore-menu-list">
        {menu_list.map((item) => {
          const selected = category === item.menu_name;
          return (
            <button
              type="button"
              key={item.menu_name}
              className={
                selected
                  ? "explore-menu-list-item is-selected"
                  : "explore-menu-list-item"
              }
              aria-pressed={selected}
              onClick={() =>
                setCategory((prev) =>
                  prev === item.menu_name ? "All" : item.menu_name
                )
              }
            >
              <img src={item.menu_image} alt="" />
              <span>{item.menu_name}</span>
            </button>
          );
        })}
      </div>
      <hr />
    </section>
  );
};

export default ExploreMenu;
