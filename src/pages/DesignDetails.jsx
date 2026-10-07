import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import designs from "../data/designs";
import sizeChart from "../data/sizeChart";

function DesignDetails() {
  const { id } = useParams();

  const { cart, addToCart } = useCart();

  const [selectedSize, setSelectedSize] =
    useState("");

  const [sizeGuideOpen, setSizeGuideOpen] =
    useState(false);

  const [cartMessage, setCartMessage] =
  useState("");

  const design = designs.find(
    (item) => item.id === id
  );

  if (!design) {
    return (
      <div className="not-found">
        <h1>Design not found</h1>
        <Link to="/#collection">
          Back to collection
        </Link>
      </div>
    );
  }

  const relatedDesigns = designs
    .filter((item) => {
      if (item.id === design.id) {
        return false;
      }

      return item.characters.some((character) =>
        design.characters.includes(character)
      );
    })
    .slice(0, 3);

  const selectedCartItem = cart.find(
    (item) =>
      item.id === design.id &&
      item.size === selectedSize
  );

  const selectedSizeQuantity =
    selectedCartItem?.quantity || 0;

  const handleAddToCart = () => {
  if (!selectedSize) {
    return;
  }

  addToCart(design, selectedSize);

  setCartMessage(
    `${design.name} · Size ${selectedSize} added to cart`
  );

  setTimeout(() => {
    setCartMessage("");
  }, 2500);
};

  return (
    <main className="design-details">
        {cartMessage && (
  <div className="cart-toast">
    <span className="cart-toast-check">✓</span>

    <div className="cart-toast-content">
      <strong>Added to cart</strong>

      <p>{cartMessage}</p>

      <Link
        to="/cart"
        className="cart-toast-link"
      >
        Go to cart →
      </Link>
    </div>
  </div>
)}
      <Link
        to="/#collection"
        className="back-link"
      >
        ← Back to collection
      </Link>

      <div className="details-container">
        <div className="details-image">
          <img
            src={design.image}
            alt={design.name}
          />
        </div>

        <div className="details-info">
          <p className="eyebrow">
            {design.complexity.toUpperCase()} DESIGN
          </p>

          <p className="design-id">
            DESIGN ID · {design.id}
          </p>

          <h1>{design.name}</h1>

          <p className="details-price">
            ₹{design.price}
          </p>

          <p className="details-description">
            A hand-painted piece created with care,
            patience and a little bit of personality.
            Each piece is painted individually, so
            tiny variations make every one unique.
          </p>

          <div className="details-meta">
            <div>
              <span>Characters</span>
              <strong>
                {design.characters.join(" · ")}
              </strong>
            </div>

            <div>
              <span>Complexity</span>
              <strong>{design.complexity}</strong>
            </div>

            <div>
              <span>Type</span>
              <strong>Hand-painted</strong>
            </div>
          </div>

          {/* SIZE SELECTION */}
          {/* SIZE SELECTION */}
<div className="size-selection">
  <div className="size-selection-row">
    <span className="size-selection-label">
      Size
    </span>

    <div className="size-options">
      {sizeChart.map((size) => (
        <button
          key={size.name}
          type="button"
          className={
            selectedSize === size.name
              ? "size-option active"
              : "size-option"
          }
          onClick={() =>
            setSelectedSize(size.name)
          }
        >
          {size.name}
        </button>
      ))}
    </div>

    <button
      type="button"
      className="size-guide-button"
      onClick={() =>
        setSizeGuideOpen(true)
      }
    >
      Size guide →
    </button>
  </div>

  {!selectedSize && (
    <p className="size-required">
      Please select a size before adding this design
      to your cart.
    </p>
  )}
</div>

          {/* ADD TO CART */}
          <div className="details-actions">
  <button
    className={
      selectedSize
        ? "primary-button order-button"
        : "primary-button order-button disabled"
    }
    onClick={handleAddToCart}
    disabled={!selectedSize}
  >
    {selectedSizeQuantity > 0
      ? `Added to cart · ${selectedSizeQuantity}`
      : "Add to cart"}
  </button>

  {selectedSizeQuantity > 0 && (
    <Link
      to="/cart"
      className="go-to-cart-button"
    >
      Go to cart →
    </Link>
  )}
</div>

<p className="details-note">
  Multiple sizes can be added separately.
</p>
        </div>
      </div>

      {/* SIZE GUIDE */}
      {sizeGuideOpen && (
        <div
          className="size-guide-overlay"
          onClick={() =>
            setSizeGuideOpen(false)
          }
        >
          <div
            className="size-guide-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="size-guide-header">
              <div>
                <p className="eyebrow">
                  SIZE GUIDE
                </p>

                <h2>Find your fit.</h2>
              </div>

              <button
                type="button"
                className="size-guide-close"
                onClick={() =>
                  setSizeGuideOpen(false)
                }
                aria-label="Close size guide"
              >
                ×
              </button>
            </div>

            <div className="size-guide-table-wrapper">
              <table className="size-guide-table">
                <thead>
                  <tr>
                    <th>Size</th>

                    <th>
                      Chest
                      <small>in / cm</small>
                    </th>

                    <th>
                      Length
                      <small>in / cm</small>
                    </th>

                    <th>
                      Shoulder
                      <small>in / cm</small>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sizeChart.map((size) => (
                    <tr key={size.name}>
                      <td>{size.name}</td>

                      <td>
                        {size.chest.inches}" /{" "}
                        {size.chest.cm}
                      </td>

                      <td>
                        {size.length.inches}" /{" "}
                        {size.length.cm}
                      </td>

                      <td>
                        {size.shoulder.inches}" /{" "}
                        {size.shoulder.cm}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="size-guide-note">
              <strong>How to choose your size</strong>

              <p>
                Measure a T-shirt you already own
                that fits you well. Lay it flat and
                compare its chest, length and
                shoulder measurements with the chart
                above.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RELATED DESIGNS */}
      {relatedDesigns.length > 0 && (
        <section className="related-designs">
          <div className="related-heading">
            <p className="eyebrow">
              KEEP EXPLORING
            </p>

            <h2>You may also like.</h2>
          </div>

          <div className="related-grid">
            {relatedDesigns.map((related) => (
              <Link
                key={related.id}
                to={`/design/${related.id}`}
                className="related-card"
              >
                <div className="related-image">
                  <img
                    src={related.image}
                    alt={related.name}
                  />
                </div>

                <div className="related-info">
                  <div>
                    <p className="design-id">
                      {related.id}
                    </p>

                    <h3>{related.name}</h3>
                  </div>

                  <strong>
                    ₹{related.price}
                  </strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default DesignDetails;