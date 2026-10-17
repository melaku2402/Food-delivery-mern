import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../Context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list, searchResults, setSearchResults } = useContext(StoreContext);
  const searching = searchResults !== null;
  const visible = (searching ? searchResults : food_list).filter(
    (item) => category === "All" || category === item.category
  );

  return (
    <section className="food-display" id="food-display">
      <h2>{searching ? "Search results" : "Top dishes near you"}</h2>
      {searching && (
        <button
          type="button"
          className="food-display-clear"
          onClick={() => setSearchResults(null)}
        >
          Clear search ✕
        </button>
      )}

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
