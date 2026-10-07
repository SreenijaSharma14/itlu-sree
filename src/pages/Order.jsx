import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Order() {
  const {
    cart,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  const [advanceAccepted, setAdvanceAccepted] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [orderId, setOrderId] =
    useState("");

  const [submittedOrder, setSubmittedOrder] =
  useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
  event.preventDefault();

  const newOrderId =
    `ITLU-${Date.now().toString().slice(-6)}`;

  const orderSnapshot = {
    items: [...cart],
    totalItems,
    totalPrice,
    advanceAmount: totalPrice * 0.5,
    remainingAmount: totalPrice * 0.5,
  };

  setOrderId(newOrderId);
  setSubmittedOrder(orderSnapshot);
  setSubmitted(true);

  clearCart();
};

  if (submitted) {
    return (
      <main
  className="order-success"
  style={{
    justifyContent: "flex-start",
    paddingTop: "45px",
  }}
>
  <p
  className="eyebrow"
  style={{ color: "#a66f55" }}
>
  ORDER REQUEST RECEIVED
</p>

  <div
  className="success-mark"
  style={{
    background: "#8a6a5a",
    color: "#f7f2e9",
  }}
>
  ✓
</div>

  <h1>Thank you.</h1>

  <p>
    Your order request has been received and
    we'll get in touch with you shortly to
    confirm the details.
  </p>

  <div className="order-reference">
    <span>ORDER ID</span>
    <strong>{orderId}</strong>
  </div>

  {submittedOrder && (
    <div className="success-order-summary">
      <p className="eyebrow">
        YOUR ORDER
      </p>

      <div className="success-order-items">
        {submittedOrder.items.map((item) => (
          <div
            className="success-order-item"
            key={item.cartKey}
          >
            <div>
              <span className="design-id">
                {item.id}
              </span>

              <h3>{item.name}</h3>

              <p>
                Size {item.size} · Qty{" "}
                {item.quantity}
              </p>
            </div>

            <strong>
              ₹{item.price * item.quantity}
            </strong>
          </div>
        ))}
      </div>

      <div className="success-order-total">
        <span>Total</span>

        <strong>
          ₹{submittedOrder.totalPrice}
        </strong>
      </div>

      <div className="success-order-payment">
        <div>
          <span>50% advance</span>
          <strong>
            ₹{submittedOrder.advanceAmount}
          </strong>
        </div>

        <div>
          <span>Remaining</span>
          <strong>
            ₹{submittedOrder.remainingAmount}
          </strong>
        </div>
      </div>
    </div>
  )}

  <p className="success-note">
    Your order request does not require
    payment at this stage. The 50% advance
    will be required once your order is
    confirmed.
  </p>

  <Link
    to="/"
    className="primary-button"
  >
    Back to home
  </Link>
</main>

    );
  }

  if (cart.length === 0) {
    return (
      <main className="order-page">

        <div className="empty-order">

          <p className="eyebrow">
            CHECKOUT
          </p>

          <h1>
            Your cart is empty.
          </h1>

          <p>
            Add a few hand-painted pieces before
            continuing to checkout.
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

  const productTotal = totalPrice;
  const advanceAmount = productTotal * 0.5;
  const remainingAmount = productTotal - advanceAmount;

  return (
    <main className="order-page">

      {/* HEADER */}

      <div className="order-heading">

        <Link
          to="/cart"
          className="back-link"
        >
          ← Back to cart
        </Link>

        <p className="eyebrow">
          CHECKOUT
        </p>

        <h1>
          Let's make it yours.
        </h1>

        <p>
          Tell us where to send your
          hand-painted pieces.
        </p>

      </div>

      <div className="order-layout">

        {/* FORM */}

        <form
          className="order-form"
          onSubmit={handleSubmit}
        >

          <section className="form-section">

            <div className="form-section-heading">

              <span>
                01
              </span>

              <h2>
                Your details
              </h2>

            </div>

            <div className="form-grid">

              <div className="form-field">

                <label htmlFor="name">
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />

              </div>

              <div className="form-field">

                <label htmlFor="phone">
                  Phone number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  required
                />

              </div>

            </div>

            <div className="form-field">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />

            </div>

          </section>

          {/* ADDRESS */}

          <section className="form-section">

            <div className="form-section-heading">

              <span>
                02
              </span>

              <h2>
                Delivery details
              </h2>

            </div>

            <div className="form-field">

              <label htmlFor="address">
                Delivery address
              </label>

              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House / flat, street, area, city, state, PIN code"
                rows="5"
                required
              />

            </div>

            <div className="form-field">

              <label htmlFor="note">
                Special note
                <span>Optional</span>
              </label>

              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Anything you'd like us to know?"
                rows="4"
              />

            </div>

          </section>

          {/* ADVANCE */}

          <section className="form-section">

            <div className="form-section-heading">

              <span>
                03
              </span>

              <h2>
                Before you submit
              </h2>

            </div>

            <label className="advance-checkbox">

              <input
                type="checkbox"
                checked={advanceAccepted}
                onChange={(event) =>
                  setAdvanceAccepted(
                    event.target.checked
                  )
                }
              />

              <span className="custom-checkbox"></span>

              <span>
                I understand that a <strong>50%
                advance</strong> is required once
                my order is confirmed.
              </span>

            </label>

            <p className="advance-note">
              No payment is required while
              submitting this request. We'll
              contact you to confirm the order
              and advance payment details.
            </p>

          </section>

          <button
            type="submit"
            className="primary-button submit-order-button"
            disabled={!advanceAccepted}
          >
            Submit order request
          </button>

        </form>

        {/* ORDER SUMMARY */}

        <aside className="checkout-summary">

          <p className="eyebrow">
            YOUR ORDER
          </p>

          <div className="checkout-items">

            {cart.map((item) => (
  <div
    className="checkout-item"
    key={item.cartKey}
  >

                <div className="checkout-item-image">

                  <img
                    src={item.image}
                    alt={item.name}
                  />

                </div>

                <div className="checkout-item-info">

                  <span className="design-id">
                    {item.id}
                  </span>

                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    Size {item.size} · {item.quantity} × ₹{item.price}
                  </p>

                </div>

                <strong>
                  ₹{item.price * item.quantity}
                </strong>

              </div>

            ))}

          </div>

          <div className="checkout-summary-line">
            <span>
              Items
            </span>

            <span>
              {totalItems}
            </span>
          </div>

          <div className="checkout-summary-line">
            <span>
              Product total
            </span>

            <span>
              ₹{productTotal}
            </span>
          </div>

          <div className="checkout-summary-line">
            <span>
              Delivery
            </span>

            <span>
              To be confirmed
            </span>
          </div>

          <div className="checkout-divider"></div>

          <div className="checkout-total">

            <span>
              Total
            </span>

            <strong>
              ₹{productTotal}
            </strong>

          </div>

          <div className="advance-breakdown">

            <div>
              <span>
                50% advance
              </span>

              <strong>
                ₹{advanceAmount}
              </strong>
            </div>

            <div>
              <span>
                Remaining
              </span>

              <strong>
                ₹{remainingAmount}
              </strong>
            </div>

          </div>

        </aside>

      </div>

    </main>
  );
}

export default Order;