import { Link } from "react-router-dom";

function ProductCard({ design }) {
  return (
    <Link
      to={`/design/${design.id}`}
      className="product-card"
    >
      {/* Artwork */}

      <div className="product-image">
        <img
          src={design.image}
          alt={design.name}
        />
      </div>

      {/* Information */}

      <div className="product-info">

        <div className="product-info-main">

          <p className="design-id">
            {design.id}
          </p>

          <h3>
            {design.name}
          </h3>

        </div>

        <div className="product-price">

          <small>
            {design.complexity.toUpperCase()}
          </small>

          <strong>
            ₹{design.price}
          </strong>

        </div>

      </div>

    </Link>
  );
}

export default ProductCard;