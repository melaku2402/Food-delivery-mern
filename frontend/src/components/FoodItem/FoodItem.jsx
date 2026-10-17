import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart, url } =
    useContext(StoreContext);
  const count = cartItems[id] || 0;

  return (
    <article className="food-item">
      <div className="food-item-img-container">
        <img
          src={url + "/images/" + image}
          alt={name}
          className="food-item-image"
          loading="lazy"
        />

        {count === 0 ? (
          <button
            type="button"
            className="food-item-add"
            aria-label={"Add " + name + " to cart"}
            onClick={() => addToCart(id)}
          >
            <img src={assets.add_icon_white} alt="" />
          </button>
        ) : (
          <div className="food-item-counter">
            <button
              type="button"
              aria-label={"Remove one " + name}
              onClick={() => removeFromCart(id)}
            >
              <img src={assets.remove_icon_red} alt="" />
            </button>
            <p aria-live="polite">{count}</p>
            <button
              type="button"
              aria-label={"Add one more " + name}
              onClick={() => addToCart(id)}
            >
              <img src={assets.add_icon_green} alt="" />
            </button>
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <h3>{name}</h3>
          <img src={assets.rating_starts} alt="" />
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">${price}</p>
      </div>
    </article>
  );
};

export default FoodItem;
