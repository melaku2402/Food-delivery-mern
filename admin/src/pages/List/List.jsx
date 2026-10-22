import React, { useEffect, useState } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url, token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authHeaders = { headers: { token } };

  const fetchList = async () => {
    try {
      setError("");
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        setError("The server returned an error.");
        toast.error("Error loading food list");
      }
    } catch (err) {
      setError(`Cannot reach the server at ${url}. Is the backend running?`);
      toast.error("Cannot reach the server");
    } finally {
      setLoading(false);
    }
  };

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId }, authHeaders);
      if (response.data.success) {
        toast.success("Food removed");
        await fetchList();
      } else {
        toast.error(response.data.message || "Error");
      }
    } catch (err) {
      toast.error(err.response?.status === 401 ? "Admin session expired. Please log in again." : "Cannot reach the server");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list add flex-col">
      <p>All Food List</p>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "tomato" }}>{error}</p>}
      {!loading && !error && list.length === 0 && (
        <p>No food items yet. Add some on the "Add Items" page.</p>
      )}
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item) => (
          <div key={item._id} className="list-table-format">
            <img src={`${url}/images/${item.image}`} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>${item.price}</p>
            <p onClick={() => removeFood(item._id)} className="cursor">X</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
