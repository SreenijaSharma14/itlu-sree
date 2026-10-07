import "./App.css";
import Order from "./pages/Order";
import Collection from "./components/Collection";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useCart } from "./context/CartContext";
import DesignDetails from "./pages/DesignDetails";
import CustomDesign from "./pages/CustomDesign";
import Cart from "./pages/Cart";
import ScrollToTop from "./ScrollToTop";

function Home() {
  const { totalItems } = useCart();
  return (
    <div className="site">

      {/* Navbar */}
      <header className="navbar">
        <div className="logo">itlu sree</div>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#collection">Collection</a>
          <a href="#about">About</a>
          <Link to="/custom">Custom</Link>
        </nav>

        <Link
          to="/cart"
          className="nav-button"
        >
          Cart
          {totalItems > 0 && (
            <span className="cart-count">
              · {totalItems}
            </span>
          )}
        </Link>
      </header>


      {/* Hero */}
      <main>

        <section className="hero" id="home">
          <div className="hero-content">

            <p className="eyebrow">HAND-PAINTED • MADE WITH LOVE</p>

            <h1>
              Wear a little
              <span> piece of art.</span>
            </h1>

            <p className="hero-description">
              Hand-painted T-shirts and tops, created one piece at a time.
              Explore the collection and find something that feels like you.
            </p>

            <div className="hero-actions">
              <a href="#collection" className="primary-button">
                Explore collection
              </a>

              <Link to="/custom" className="secondary-button">
  Have your own idea?
</Link>
            </div>

          </div>

          <div className="hero-art">
            <div className="art-card art-card-main">
              <div className="sun"></div>
              <div className="mountain mountain-one"></div>
              <div className="mountain mountain-two"></div>
              <div className="flower flower-one">✿</div>
              <div className="flower flower-two">✿</div>
            </div>

            <div className="floating-note">
              <span>✦</span>
              painted by hand
            </div>
          </div>
        </section>

        <Collection />


        {/* Brand statement */}
        <section className="statement" id="about">
          <p className="eyebrow">A LITTLE ABOUT ITLU SREE</p>

          <h2>
            Not mass produced.
            <br />
            <span>Just painted.</span>
          </h2>

          <p>
            Every piece is painted by hand, which means tiny differences,
            little imperfections and a whole lot of personality.
          </p>
        </section>


        {/* Custom */}
        <section className="custom-section" id="custom">

          <div className="custom-content">
            <p className="eyebrow">SOMETHING IN MIND?</p>

            <h2>Bring your own idea to life.</h2>

            <p>
              Have an inspiration image, a favourite character, a memory,
              or simply an idea you've been carrying around?
              Tell us about it.
            </p>

            <Link
              to="/custom"
              className="primary-button"
            >
              Request a custom design
            </Link>
          </div>

          <div className="custom-mark">
            <span>itlu</span>
            <span>sree</span>
          </div>

        </section>


        {/* Limited orders */}
        <section className="orders-section">

          <div>
            <p className="eyebrow">OCTOBER DROP</p>

            <h2>
              Only 30 pieces.
            </h2>

            <p>
              Orders are open until October 31, or until all
              30 available slots are filled.
            </p>
          </div>

          <div className="order-counter">
            <strong>30</strong>
            <span>pieces available</span>
          </div>

        </section>

      </main>


      {/* Footer */}
      <footer className="footer">

        <div className="footer-logo">
          itlu sree
        </div>

        <p>
          Hand-painted pieces, made one at a time.
        </p>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#collection">Collection</a>
          <a href="#custom">Custom</a>
        </div>

      </footer>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      
      <ScrollToTop />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/design/:id"
          element={<DesignDetails />}
        />

        <Route
          path="/order"
          element={<Order />}
        />

        <Route
        path="/custom"
        element={<CustomDesign />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;