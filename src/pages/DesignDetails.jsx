import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import designs from "../data/designs";
import sizeChart from "../data/sizeChart";
import sizeGuideMeasurements from "../data/sizeGuide";

function DesignDetails() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
  const designIndex = designs.findIndex(
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

  if (!user) {
    navigate("/auth?redirect=/cart");
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
        <div className="details-images">
          <figure className="details-image">
            <img
              src={design.image}
              alt={`${design.name} catalogue image`}
            />
            <figcaption>Catalogue design</figcaption>
          </figure>
          <figure className="details-image">
            <img
              src={design.detailImage}
              alt={`${design.name} shirt image`}
            />
            <figcaption>On the shirt</figcaption>
          </figure>
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

      <nav className="details-navigation" aria-label="Design navigation">
        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate(`/design/${designs[designIndex - 1].id}`)}
          disabled={designIndex === 0}
        >
          ← Previous
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate(`/design/${designs[designIndex + 1].id}`)}
          disabled={designIndex === designs.length - 1}
        >
          Next →
        </button>
      </nav>

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

                    <th>Waist / Width</th>
                    <th>Shoulder</th>
                    <th>Length</th>
                  </tr>
                </thead>

                <tbody>
                  {sizeGuideMeasurements.map((size) => (
                    <tr key={size.size}>
                      <td>{size.size}</td>
                      <td>{size.waistWidth}"</td>
                      <td>{size.shoulder}"</td>
                      <td>{size.length}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="size-guide-note">
              <strong>Measurement note</strong>

              <p>
                All measurements are in inches. Waist / Width represents
                the garment's circumference based on its flat width.
                Shoulder is the doubled shoulder measurement supplied for
                this chart. Length is measured vertically and has not been
                doubled.
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
