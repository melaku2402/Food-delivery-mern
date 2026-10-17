import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

// Flat delivery fee added at checkout (the backend adds the same amount to Stripe)
export const DELIVERY_FEE = 2;

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]); // always the FULL menu (the cart relies on it)
  const [searchResults, setSearchResults] = useState(null); // null = not searching
  // true once the menu and (if signed in) the saved cart have been loaded
  const [ready, setReady] = useState(false);

  const authHeaders = (t) => ({ headers: { token: t } });

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    if (token) {
      try {
        await axios.post(url + "/api/cart/add", { itemId }, authHeaders(token));
      } catch (error) {
        console.error("Could not save cart:", error.message);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));
    if (token) {
      try {
        await axios.post(url + "/api/cart/remove", { itemId }, authHeaders(token));
      } catch (error) {
        console.error("Could not save cart:", error.message);
      }
    }
  };

  // remove every unit of an item at once
  const deleteFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: 0 }));
    if (token) {
      try {
        await axios.post(
          url + "/api/cart/remove",
          { itemId, all: true },
          authHeaders(token)
        );
      } catch (error) {
        console.error("Could not save cart:", error.message);
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const id in cartItems) {
      if (cartItems[id] > 0) {
        const itemInfo = food_list.find((product) => product._id === id);
        if (itemInfo) totalAmount += itemInfo.price * cartItems[id];
      }
    }
    return totalAmount;
  };

  const getCartCount = () =>
    Object.values(cartItems).reduce((n, q) => n + (q > 0 ? q : 0), 0);

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      if (response.data.success) setFoodList(response.data.data);
    } catch (error) {
      console.error("Could not load food list:", error.message);
    }
  };

  // sign out: forget the token and the cart on screen
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
  };

  const loadCardData = async (savedToken) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        authHeaders(savedToken)
      );
      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      } else {
        logout(); // token no longer valid
      }
    } catch (error) {
      // the server answers 401 for an expired or invalid token
      if (error.response?.status === 401) logout();
      else console.error("Could not load cart:", error.message);
    }
  };

  // called by the sign-in popup after the server accepted the login / sign-up
  const login = async (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    // items added while signed out are saved to the account, then the saved cart is loaded
    const guest = Object.entries(cartItems).filter(([, qty]) => qty > 0);
    for (const [itemId, qty] of guest) {
      for (let i = 0; i < qty; i++) {
        try {
          await axios.post(url + "/api/cart/add", { itemId }, authHeaders(newToken));
        } catch (error) {
          console.error("Could not save cart item:", error.message);
          break;
        }
      }
    }
    await loadCardData(newToken);
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      const saved = localStorage.getItem("token");
      if (saved) {
        setToken(saved);
        await loadCardData(saved);
      }
      setReady(true);
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    deleteFromCart,
    getTotalCartAmount,
    getCartCount,
    deliveryFee: DELIVERY_FEE,
    url,
    token,
    setToken,
    login,
    logout,
    setFoodList,
    searchResults,
    setSearchResults,
    ready,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
