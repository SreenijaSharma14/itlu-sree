import { useState } from "react";
import designs from "../data/designs";
import ProductCard from "./ProductCard";

function Collection() {
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [characterFilter, setCharacterFilter] = useState("All");

  const characters = [
    "All",
    "Spider-Man",
    "Spider-Gwen",
    "Iron Man",
    "Thor",
    "Doctor Strange",
    "Scarlet Witch",
    "Captain America",
    "Doctor Doom",
    "Avengers",
  ];

  const filteredDesigns = designs.filter((design) => {
    const matchesDifficulty =
      difficultyFilter === "All" ||
      design.complexity === difficultyFilter;

    const matchesCharacter =
      characterFilter === "All" ||
      design.characters.includes(characterFilter);

    return matchesDifficulty && matchesCharacter;
  });

  const filtersActive =
    difficultyFilter !== "All" ||
    characterFilter !== "All";

  const clearFilters = () => {
    setDifficultyFilter("All");
    setCharacterFilter("All");
  };

  return (
    <section className="collection" id="collection">

      {/* SECTION HEADING */}

      <div className="section-heading">

        <div>
          <p className="eyebrow">
            THE COLLECTION
          </p>

          <h2>
            Made to be worn.
          </h2>
        </div>

        <p>
          Browse our hand-painted designs and choose
          the piece that speaks to you.
        </p>

      </div>


      {/* FILTERS */}

      <div className="collection-filters">

        {/* DIFFICULTY */}

        <div className="design-filter-group">

          <div className="design-filter-label">

            <span>
              Browse by difficulty
            </span>

            <strong>
              {filteredDesigns.length}{" "}
              {filteredDesigns.length === 1
                ? "design"
                : "designs"}
            </strong>

          </div>

          <div className="category-row">

            {["All", "Easy", "Medium", "Complex"].map(
              (category) => (

                <button
                  key={category}
                  className={
                    difficultyFilter === category
                      ? "category active"
                      : "category"
                  }
                  onClick={() =>
                    setDifficultyFilter(category)
                  }
                >
                  {category}
                </button>

              )
            )}

          </div>

        </div>


        {/* CHARACTER */}

        <div className="design-filter-group">

          <div className="design-filter-label">

            <span>
              Browse by character
            </span>

          </div>

          <div className="category-row character-filter">

            {characters.map((character) => (

              <button
                key={character}
                className={
                  characterFilter === character
                    ? "category active"
                    : "category"
                }
                onClick={() =>
                  setCharacterFilter(character)
                }
              >
                {character}
              </button>

            ))}

          </div>

        </div>


        {/* CLEAR FILTERS */}

        {filtersActive && (

          <button
            className="clear-filters"
            onClick={clearFilters}
          >
            Clear filters ×
          </button>

        )}

      </div>


      {/* PRODUCTS */}

      <div className="product-grid">

        {filteredDesigns.map((design, index) => (
  <div
    key={design.id}
    className="catalogue-reveal"
    style={{
      "--delay": `${index * 0.06}s`,
    }}
  >
    <ProductCard design={design} />
  </div>
))}

      </div>


      {/* NO RESULTS */}

      {filteredDesigns.length === 0 && (

        <div className="no-results">

          <p>
            No designs found for these filters.
          </p>

          <button
            className="clear-filters"
            onClick={clearFilters}
          >
            Show all designs
          </button>

        </div>

      )}

    </section>
  );
}

export default Collection;