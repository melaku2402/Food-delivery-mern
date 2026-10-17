// File: Search.jsx

import React, { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { StoreContext } from "../../Context/StoreContext";
import { assets } from "../../assets/assets";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { url, setSearchResults } = useContext(StoreContext);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(url + "/api/food/search", {
        query: searchTerm,
      });
      console.log(response.data);
      
      if (response.data.success) {
        setSearchResults(response.data.data);
      }
      console.log(searchTerm);
      
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        placeholder="Search for food..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button type="submit">
              <img src={assets.search_icon} alt="" /></button>
    </form>
  );
};

export default Search;
