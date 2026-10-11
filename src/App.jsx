
import "./App.css";
import "./gsap-motion.css";

import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";

import Order from "./pages/Order";
import Collection from "./components/Collection";
import DesignDetails from "./pages/DesignDetails";
import CustomDesign from "./pages/CustomDesign";
import Cart from "./pages/Cart";
import ScrollToTop from "./ScrollToTop";

import AuthProvider, {
  useAuth,
} from "./context/AuthContext";

import Auth from "./pages/Auth";
import MyOrders from "./pages/MyOrders";
import AdminOrders from "./pages/AdminOrders";
import Account from "./pages/Account";

import { useCart } from "./context/CartContext";
import useSiteAnimations from "./useSiteAnimations";

// Protect routes that require login.
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const redirect =
      location.pathname + location.search;

    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(
          redirect
        )}`}
        replace
      />
    );
  }

  return children;
}

function Home() {
  const { totalItems } = useCart();
  const { user, profile, logout } = useAuth();

  const [accountOpen, setAccountOpen] =
    useState(false);

  // Homepage animations.
  useSiteAnimations();

  return (
    <div className="site">
      <header className="navbar">
        <Link to="/" className="logo">
          <img
            src="/images/ItluSreelogo.png"
            alt="itlu sree"
          />
        </Link>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#collection">Collection</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="account-wrapper">
              <button
                type="button"
                className="nav-account"
                onClick={() =>
                  setAccountOpen((current) => !current)
                }
              >
                {profile?.full_name
                  ? `Hi, ${
                      profile.full_name.split(" ")[0]
                    }`
                  : "Account"}

                <span className="account-arrow">
                  {accountOpen ? "⌃" : "⌄"}
                </span>
              </button>

              {accountOpen && (
                <div className="account-menu">
                  <p className="account-menu-greeting">
                    Hi,{" "}
                    {profile?.full_name
                      ? profile.full_name.split(" ")[0]
                      : "there"}{" "}
                    ♡
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
            <Link to="/auth" className="nav-account">
              Login
            </Link>
          )}

          <Link to="/cart" className="nav-button">
            Cart
            {totalItems > 0 && (
              <span className="cart-count">
                · {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">
              HAND-PAINTED • MADE WITH LOVE
            </p>

            <h1>
              Wear a little
              <span> piece of art.</span>
            </h1>

            <p className="hero-description">
              Hand-painted T-shirts and tops,
              created one piece at a time.
              Explore the collection and find
              something that feels like you.
            </p>

            <div className="hero-actions">
              <a
                href="#collection"
                className="primary-button"
              >
                Explore collection
              </a>
            </div>
          </div>

          <div className="hero-art">
            <div className="art-card art-card-main">
              <div className="sun"></div>
              <div className="mountain mountain-one"></div>
              <div className="mountain mountain-two"></div>

              <div className="flower flower-one">
                ✿
              </div>

              <div className="flower flower-two">
                ✿
              </div>
            </div>

            <div className="floating-note">
              <span>✦</span> painted by hand
            </div>
          </div>
        </section>

        <Collection />

        <section
          className="statement reveal"
          id="about"
          data-about-section
        >
          <p className="eyebrow">OUR STORY</p>

          <img
            src="/images/ItluSreeLogoSwan.png"
            alt=""
            className="story-logo"
          />

          <h2>
            Every piece has
            <br />
            <span>a little story.</span>
          </h2>

          <p>
            Itlu Sree is a little space for creativity,
            colour and self-expression. Each T-shirt is
            hand-painted with care, making every piece
            feel personal and unique. No mass production,
            just art made by hand and worn with love.
          </p>
        </section>

        <section className="orders-section reveal">
          <div>
            <p className="eyebrow">
              OCTOBER DROP
            </p>

            <h2>Only 30 pieces.</h2>

            <p>
              Orders are open until October 31,
              or until all 30 available slots
              are filled.
            </p>
          </div>

          <div className="order-counter">
            <strong>30</strong>
            <span>pieces available</span>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-logo">
          <img
            src="/images/ItluSreeLogoSwan.png"
            alt="itlu sree swan logo"
          />
        </div>

        <p>
          Hand-painted pieces, made one at a time.
        </p>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#collection">Collection</a>
          <a href="#about">Our Story</a>
        </div>
      </footer>
    </div>
  );
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/design/:id"
          element={<DesignDetails />}
        />

        <Route
          path="/auth"
          element={<Auth />}
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <Order />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />

        <Route
          path="/custom"
          element={<CustomDesign />}
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
