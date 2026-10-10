import "./App.css";
import "./gsap-motion.css";
import Order from "./pages/Order";
import Collection from "./components/Collection";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useCart } from "./context/CartContext";
import DesignDetails from "./pages/DesignDetails";
import CustomDesign from "./pages/CustomDesign";
import Cart from "./pages/Cart";
import ScrollToTop from "./ScrollToTop";
import AuthProvider, { useAuth } from "./context/AuthContext";
import Auth from "./pages/Auth";
import { useState } from "react";
import MyOrders from "./pages/MyOrders";
import AdminOrders from "./pages/AdminOrders";
import useSiteAnimations from "./useSiteAnimations";
import Account from "./pages/Account";


function Home() {
  const { totalItems } = useCart();
  const { user, profile, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  // GSAP animations for the homepage.
  useSiteAnimations();

  return (
    <div className="site">
      <header className="navbar">
        <div className="logo">itlu sree</div>
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#collection">Collection</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="account-wrapper">
              <button
                className="nav-account"
                onClick={() => setAccountOpen((current) => !current)}
              >
                {profile?.full_name
                  ? `Hi, ${profile.full_name.split(" ")[0]}`
                  : "Account"}
                <span className="account-arrow">
                  {accountOpen ? "⌃" : "⌄"}
                </span>
              </button>

              {accountOpen && (
                <div className="account-menu">
                  <p className="account-menu-greeting">
                    Hi, {profile?.full_name
                      ? profile.full_name.split(" ")[0]
                      : "there"} ♡
                  </p>
                
                  <Link
                    to="/account"
                    className="account-menu-item"
                    onClick={() => setAccountOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    to="/my-orders"
                    className="account-menu-item"
                    onClick={() => setAccountOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    type="button"
                    className="account-menu-item logout-item"
                    onClick={async () => {
                      await logout();
                      setAccountOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="nav-account">Login</Link>
          )}

          <Link to="/cart" className="nav-button">
            Cart
            {totalItems > 0 && <span className="cart-count">· {totalItems}</span>}
          </Link>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">HAND-PAINTED • MADE WITH LOVE</p>
            <h1>Wear a little<span> piece of art.</span></h1>
            <p className="hero-description">
              Hand-painted T-shirts and tops, created one piece at a time.
              Explore the collection and find something that feels like you.
            </p>
            <div className="hero-actions">
              <a href="#collection" className="primary-button">Explore collection</a>
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
            <div className="floating-note"><span>✦</span> painted by hand</div>
          </div>
        </section>

        <Collection />

        <section className="statement reveal" id="about" data-about-section>
          <p className="eyebrow">A LITTLE ABOUT ITLU SREE</p>
          <h2>Not mass produced.<br /><span>Just painted.</span></h2>
          <p>
            Every piece is painted by hand, which means tiny differences,
            little imperfections and a whole lot of personality.
          </p>
        </section>

        <section className="orders-section reveal">
          <div>
            <p className="eyebrow">OCTOBER DROP</p>
            <h2>Only 30 pieces.</h2>
            <p>
              Orders are open until October 31, or until all 30 available
              slots are filled.
            </p>
          </div>
          <div className="order-counter">
            <strong>30</strong>
            <span>pieces available</span>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-logo">itlu sree</div>
        <p>Hand-painted pieces, made one at a time.</p>
        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#collection">Collection</a>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        {/* ScrollReveal is not rendered here; GSAP handles homepage reveals. */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/design/:id" element={<DesignDetails />} />
          <Route path="/order" element={<Order />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/custom" element={<CustomDesign />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
