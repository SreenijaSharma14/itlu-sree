
import { useState } from "react";
import designs from "../data/designs";
import ProductCard from "./ProductCard";

function Collection() {
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const filteredDesigns = designs.filter(
    (design) =>
      difficultyFilter === "All" ||
      design.complexity === difficultyFilter
  );

  const filtersActive = difficultyFilter !== "All";

  const clearFilters = () => {
    setDifficultyFilter("All");
  };

  return (
    <section className="collection" id="collection">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE COLLECTION</p>
          <h2>Made to be worn.</h2>
        </div>

        <p>
          Browse our hand-painted designs and choose
          the piece that speaks to you.
        </p>
      </div>

      <div className="collection-filters">
        <div className="design-filter-group">
          <div className="design-filter-label">
            <span>Browse by difficulty</span>

            <strong>
              {filteredDesigns.length}{" "}
              {filteredDesigns.length === 1 ? "design" : "designs"}
            </strong>
          </div>

          <div className="category-row">
            {["All", "Easy", "Medium", "Complex"].map((category) => (
              <button
                key={category}
                className={
                  difficultyFilter === category
                    ? "category active"
                    : "category"
                }
                onClick={() => setDifficultyFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filtersActive && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear filters ×
          </button>
        )}
      </div>

      <div className="product-grid">
        {filteredDesigns.map((design, index) => (
          <div
            key={design.id}
            className="catalogue-reveal"
            style={{ "--delay": `${index * 0.025}s` }}
          >
            <ProductCard design={design} />
          </div>
        ))}
      </div>

      {filteredDesigns.length === 0 && (
        <div className="no-results">
          <p>No designs found for this filter.</p>

          <button className="clear-filters" onClick={clearFilters}>
            Show all designs
          </button>
        </div>
      )}
    </section>
  );
}

export default Collection;
