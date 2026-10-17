import axios from "axios";
import { createContext, useCallback, useEffect, useState } from "react";

export const StoreContext = createContext(null);

// localStorage can throw (private mode, blocked storage), so it is wrapped.
const readStoredToken = () => {
  try {
    return localStorage.getItem("token") || "";
  } catch {
    return "";
  }
};
const saveToken = (token) => {
  try {
    localStorage.setItem("token", token);
  } catch {
    /* the login still works until the page is closed */
  }
};
const clearToken = () => {
  try {
    localStorage.removeItem("token");
  } catch {
    /* nothing to clear */
  }
};

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  // Read the saved token straight away, so a logged-in visitor never sees the
  // "Sign in" button flash on every page load.
  const [token, setToken] = useState(readStoredToken);
  const [food_list, setFoodList] = useState([]);

  const logout = useCallback(() => {
    clearToken();
    setToken("");
  }, []);

  // When the login ends (Logout button, or an expired session) empty the cart on
  // screen, so the next person on this browser never sees someone else's cart.
  useEffect(() => {
    if (!token) setCartItems({});
  }, [token]);

  // If the server says the saved login is no longer valid, log out.
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const sentToken =
          error.config?.headers?.get?.("token") ||
          error.config?.headers?.get?.("Authorization");
        if (error.response?.status === 401 && sentToken) logout();
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, [logout]);

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    if (token) {
      try {
        await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
      } catch (error) {
        console.error("Could not save the cart:", error.message);
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
        await axios.post(
          url + "/api/cart/remove",
          { itemId },
          { headers: { token } }
        );
      } catch (error) {
        console.error("Could not save the cart:", error.message);
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      if (response.data.success) setFoodList(response.data.data);
    } catch (error) {
      console.error("Could not load food list:", error.message);
    }
  };

  // Returns the saved cart, or null if it could not be loaded.
  // (An expired token is handled by the interceptor above.)
  const loadCartData = async (activeToken) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        { headers: { token: activeToken } }
      );
      if (response.data.success) return response.data.cartData || {};
    } catch (error) {
      console.error("Could not load cart:", error.message);
    }
    return null;
  };

  // Called by the login / sign-up popup once the server accepted the visitor.
  // Saves the token, then loads the account's cart and merges in anything the
  // visitor added before logging in, so nothing is lost.
  const login = async (newToken) => {
    const guestCart = cartItems;
    saveToken(newToken);
    setToken(newToken);

    const savedCart = await loadCartData(newToken);
    if (savedCart === null) return; // keep what is on screen

    const merged = { ...savedCart };
    const guestItems = Object.entries(guestCart).filter(([, qty]) => qty > 0);
    for (const [id, qty] of guestItems) merged[id] = (merged[id] || 0) + qty;
    setCartItems(merged);

    // The server can only "add one", so send the guest items one at a time.
    for (const [itemId, qty] of guestItems) {
      for (let i = 0; i < qty; i++) {
        try {
          await axios.post(
            url + "/api/cart/add",
            { itemId },
            { headers: { token: newToken } }
          );
        } catch (error) {
          console.error("Could not save the cart:", error.message);
          return;
        }
      }
    }
  };

  useEffect(() => {
    async function restoreCart() {
      const saved = readStoredToken();
      if (!saved) return;
      const savedCart = await loadCartData(saved);
      if (savedCart) setCartItems(savedCart);
    }
    // the menu and the saved cart don't depend on each other, so load both at once
    Promise.all([fetchFoodList(), restoreCart()]);
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    login,
    logout,
    setFoodList,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;