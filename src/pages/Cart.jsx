import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    totalItems,
    totalPrice,
  } = useCart();

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <div className="empty-cart">
          <p className="eyebrow">YOUR CART</p>

          <h1>Your cart is empty.</h1>

          <p>
            Looks like you haven't picked a
            hand-painted piece yet.
          </p>

          <Link
            to="/#collection"
            className="primary-button"
          >
            Explore the collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <p className="eyebrow">YOUR CART</p>

          <h1>Pieces you've picked.</h1>
        </div>

        <p>
          {totalItems}{" "}
          {totalItems === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <div
              className="cart-item"
              key={item.cartKey}
            >
              <Link
                to={`/design/${item.id}`}
                className="cart-item-image"
              >
                <img
                  src={item.image}
                  alt={item.name}
                />
              </Link>

              <div className="cart-item-info">
                <div className="cart-item-main">
                  <p className="design-id">
                    {item.id}
                  </p>

                  <Link to={`/design/${item.id}`}>
                    <h2>{item.name}</h2>
                  </Link>

                  <p className="cart-item-meta">
                    {item.complexity} · Size{" "}
                    {item.size} · Hand-painted
                  </p>
                </div>

                <div className="cart-item-bottom">
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(
                          item.cartKey
                        )
                      }
                      aria-label={`Decrease quantity of ${item.name}, size ${item.size}`}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(
                          item.cartKey
                        )
                      }
                      aria-label={`Increase quantity of ${item.name}, size ${item.size}`}
                    >
                      +
                    </button>
                  </div>

                  <strong>
                    ₹{item.price * item.quantity}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="remove-item"
                onClick={() =>
                  removeFromCart(item.cartKey)
                }
                aria-label={`Remove ${item.name}, size ${item.size}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <p className="eyebrow">
            ORDER SUMMARY
          </p>

          <div className="summary-row">
            <span>Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{totalPrice}</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>
            <strong>₹{totalPrice}</strong>
          </div>

          <Link
            to="/order"
            className="primary-button checkout-button"
          >
            Proceed to checkout
          </Link>

          <Link
            to="/#collection"
            className="continue-shopping"
          >
            ← Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}

export default Cart;