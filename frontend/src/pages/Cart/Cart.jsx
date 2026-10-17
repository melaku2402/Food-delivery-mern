import React, { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../Context/StoreContext";
import { Link, useNavigate } from "react-router-dom";

const money = (n) => "$" + Number(n).toFixed(2);

const Icon = ({ d, size = 20, sw = 1.8 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const ICONS = {
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  plus: "M12 5v14M5 12h14",
  back: "M19 12H5M11 6l-6 6 6 6",
};

const STEPS = ["Cart", "Details", "Payment"];

const Steps = () => (
  <ol className="cart-steps" aria-label="Checkout progress">
    {STEPS.map((label, i) => (
      <li key={label} className={i === 0 ? "is-current" : ""} aria-current={i === 0 ? "step" : undefined}>
        <span>{i + 1}</span>
        {label}
      </li>
    ))}
  </ol>
);

// A few dishes to add without leaving the page
const Suggestions = ({ title, items, url, onAdd }) =>
  items.length === 0 ? null : (
    <section className="cart-more" aria-label={title}>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item._id} className="more-card card">
            <img src={url + "/images/" + item.image} alt="" loading="lazy" />
            <div>
              <h3>{item.name}</h3>
              <p>{money(item.price)}</p>
            </div>
            <button
              type="button"
              className="more-add"
              aria-label={"Add " + item.name + " to cart"}
              onClick={() => onAdd(item._id)}
            >
              <Icon d={ICONS.plus} size={18} sw={2.4} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );

const Cart = ({ setShowLogin }) => {
  const {
    cartItems,
    food_list,
    addToCart,
    removeFromCart,
    deleteFromCart,
    getTotalCartAmount,
    deliveryFee,
    url,
    token,
    ready,
  } = useContext(StoreContext);
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState([]); // ids animating out
  const [confirmClear, setConfirmClear] = useState(false);

  const lines = food_list.filter((item) => cartItems[item._id] > 0);
  const count = lines.reduce((n, item) => n + cartItems[item._id], 0);
  const subtotal = getTotalCartAmount();
  const total = subtotal === 0 ? 0 : subtotal + deliveryFee;

  // prefer dishes from the categories already in the cart
  const inCart = new Set(lines.map((i) => i._id));
  const cats = new Set(lines.map((i) => i.category));
  const pool = food_list.filter((i) => !inCart.has(i._id));
  const suggestions = [
    ...pool.filter((i) => cats.has(i.category)),
    ...pool.filter((i) => !cats.has(i.category)),
  ].slice(0, 4);

  const checkout = () => {
    if (token) navigate("/order");
    else setShowLogin(true);
  };

  const removeLine = (id) => {
    setLeaving((l) => [...l, id]);
    setTimeout(async () => {
      await deleteFromCart(id);
      setLeaving((l) => l.filter((x) => x !== id));
    }, 260);
  };

  const clearAll = async () => {
    setConfirmClear(false);
    // one at a time so each save reaches the server in order
    for (const item of lines) await deleteFromCart(item._id);
  };

  if (!ready) {
    return (
      <section className="page cart" aria-busy="true" aria-label="Loading cart">
        <Steps />
        <div className="cart-skeleton card" />
        <div className="cart-skeleton card" />
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="page cart">
        <Steps />
        <div className="cart-empty card">
          <div className="cart-empty-art" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="64" height="64">
              <path
                d="M8 24h48l-5 25a5 5 0 0 1-5 4H18a5 5 0 0 1-5-4L8 24Zm12-12 7 12m17-12-7 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1>Your cart is empty</h1>
          <p>Hungry? Pick something from the menu and it will wait for you here.</p>
          <Link to="/" className="btn btn-primary">
            Browse the menu
          </Link>
        </div>
        <Suggestions
          title="Popular right now"
          items={suggestions}
          url={url}
          onAdd={addToCart}
        />
      </section>
    );
  }

  return (
    <section className="page cart">
      <Steps />

      <header className="cart-head">
        <div>
          <h1 className="page-title">Your cart</h1>
          <p className="page-sub">
            {count} {count === 1 ? "item" : "items"} · ready when you are
          </p>
        </div>
        {confirmClear ? (
          <div className="cart-clear-confirm" role="group" aria-label="Confirm clearing the cart">
            <span>Remove everything?</span>
            <button type="button" className="btn-danger-soft" onClick={clearAll}>
              Yes, clear
            </button>
            <button type="button" className="btn-link" onClick={() => setConfirmClear(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="cart-clear" onClick={() => setConfirmClear(true)}>
            <Icon d={ICONS.trash} size={16} />
            Clear cart
          </button>
        )}
      </header>

      <div className="cart-layout">
        <div className="cart-main">
          <ul className="cart-lines">
            {lines.map((item, i) => (
              <li
                key={item._id}
                className={"cart-line card" + (leaving.includes(item._id) ? " is-leaving" : "")}
                style={{ "--i": i }}
              >
                <div className="cart-line-media">
                  <img
                    src={url + "/images/" + item.image}
                    alt={item.name}
                    className="cart-line-img"
                  />
                </div>

                <div className="cart-line-info">
                  <span className="cart-line-cat">{item.category}</span>
                  <h3>{item.name}</h3>
                  <p>{money(item.price)} each</p>
                </div>

                <div
                  className="cart-stepper"
                  role="group"
                  aria-label={"Quantity of " + item.name}
                >
                  <button
                    type="button"
                    aria-label={"Remove one " + item.name}
                    onClick={() => removeFromCart(item._id)}
                  >
                    −
                  </button>
                  <output aria-live="polite">{cartItems[item._id]}</output>
                  <button
                    type="button"
                    aria-label={"Add one more " + item.name}
                    onClick={() => addToCart(item._id)}
                  >
                    +
                  </button>
                </div>

                <p className="cart-line-total">
                  {money(item.price * cartItems[item._id])}
                </p>

                <button
                  type="button"
                  className="cart-line-remove"
                  aria-label={"Remove " + item.name + " from cart"}
                  onClick={() => removeLine(item._id)}
                >
                  <Icon d={ICONS.trash} />
                </button>
              </li>
            ))}
          </ul>

          <Suggestions
            title="Add something more"
            items={suggestions}
            url={url}
            onAdd={addToCart}
          />
        </div>

        <aside className="cart-summary" aria-label="Order summary">
          <h2>Order summary</h2>

          <div className="cart-thumbs" aria-hidden="true">
            {lines.slice(0, 5).map((item) => (
              <img key={item._id} src={url + "/images/" + item.image} alt="" />
            ))}
            {lines.length > 5 && <span>+{lines.length - 5}</span>}
          </div>

          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Delivery fee</dt>
              <dd>{money(deliveryFee)}</dd>
            </div>
            <div className="cart-summary-total">
              <dt>Total</dt>
              <dd>{money(total)}</dd>
            </div>
          </dl>

          <button type="button" className="btn btn-primary cart-go" onClick={checkout}>
            {token ? "Go to checkout" : "Sign in to check out"}
            <Icon d={ICONS.arrow} size={18} sw={2.2} />
          </button>
          {!token && (
            <p className="cart-summary-hint">Your cart is saved when you sign in.</p>
          )}
          <p className="cart-secure">
            <Icon d={ICONS.lock} size={16} />
            Secure payment with Stripe
          </p>
          <Link to="/" className="cart-summary-link">
            <Icon d={ICONS.back} size={16} />
            Keep browsing
          </Link>
        </aside>
      </div>

      {/* phones: checkout stays within thumb reach */}
      <div className="cart-bar">
        <div>
          <small>Total</small>
          <b>{money(total)}</b>
        </div>
        <button type="button" className="btn btn-primary" onClick={checkout}>
          {token ? "Checkout" : "Sign in"}
          <Icon d={ICONS.arrow} size={18} sw={2.2} />
        </button>
      </div>
    </section>
  );
};

export default Cart;
