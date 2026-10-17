import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../Context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);
  const visible = food_list.filter(
    (item) => category === "All" || category === item.category
  );

  return (
    <section className="food-display" id="food-display">
      <h2>Top dishes near you</h2>

      {visible.length === 0 ? (
        <p className="food-display-empty">
          No dishes to show. Try another category or search.
        </p>
      ) : (
        <div className="food-display-list">
          {visible.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              price={item.price}
              description={item.description}
              image={item.image}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FoodDisplay;
