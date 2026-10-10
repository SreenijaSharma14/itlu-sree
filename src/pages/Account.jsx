
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

function Account() {
  const { user, profile, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      if (!user) {
        setOrders([]);
        setLoadingOrders(false);
        return;
      }

      setLoadingOrders(true);
      setError("");

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          total_amount,
          advance_amount,
          remaining_amount,
          status,
          created_at,
          order_items (
            id,
            design_id,
            design_name,
            size,
            quantity,
            unit_price
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("Account orders error:", error);
        setError("We couldn't load your orders. Please try again.");
      } else {
        setOrders(data || []);
      }

      setLoadingOrders(false);
    };

    fetchOrders();

    return () => {
      active = false;
    };
  }, [user]);

  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));

  const formatPrice = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const formatStatus = (status) =>
    (status || "pending")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  if (authLoading) {
    return (
      <main className="account-page">
        <h1>Loading your account...</h1>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="account-page">
        <h1>Please log in</h1>
        <Link to="/auth" className="primary-button">
          Login
        </Link>
      </main>
    );
  }

  return (
    <main className="account-page">
      <header className="account-heading">
        <p className="section-eyebrow">MY ACCOUNT</p>
        <h1>Your little corner. ♡</h1>
        <p>Your details and everything you've booked.</p>
      </header>

      <section className="account-details-card">
        <h2>Personal details</h2>

        <div className="account-detail-row">
          <span>Name</span>
          <strong>{profile?.full_name || "Not provided"}</strong>
        </div>

        <div className="account-detail-row">
          <span>Email</span>
          <strong>{user.email || "Not available"}</strong>
        </div>

        <div className="account-detail-row">
          <span>Phone</span>
          <strong>{profile?.phone || "Not provided"}</strong>
        </div>
      </section>

      <section className="account-orders-section">
        <div className="account-orders-heading">
          <div>
            <p className="section-eyebrow">YOUR PURCHASES</p>
            <h2>Your orders</h2>
          </div>
          <span className="account-order-count">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {loadingOrders ? (
          <p className="account-message">Loading your orders...</p>
        ) : error ? (
          <p className="account-message account-error">{error}</p>
        ) : orders.length === 0 ? (
          <div className="account-empty">
            <h3>No orders yet ♡</h3>
            <p>Your booked designs will appear here.</p>
            <Link to="/#collection" className="primary-button">
              Explore designs
            </Link>
          </div>
        ) : (
          <div className="account-orders-list">
            {orders.map((order) => (
              <article className="account-order-card" key={order.id}>
                <div className="account-order-top">
                  <div>
                    <p className="account-order-number">
                      {order.order_number}
                    </p>
                    <p className="account-order-date">
                      Booked on {formatDate(order.created_at)}
                    </p>
                  </div>

                  <span
                    className={`account-order-status status-${order.status}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="account-booked-items">
                  {order.order_items?.map((item) => (
                    <div className="account-booked-item" key={item.id}>
                      <div>
                        <h3>{item.design_name}</h3>
                        <p>
                          {item.design_id} · Size {item.size} · Qty{" "}
                          {item.quantity}
                        </p>
                      </div>

                      <strong>
                        {formatPrice(
                          Number(item.unit_price) * Number(item.quantity)
                        )}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="account-order-payment">
                  <div>
                    <span>Total</span>
                    <strong>{formatPrice(order.total_amount)}</strong>
                  </div>

                  <div>
                    <span>Advance (50%)</span>
                    <strong>{formatPrice(order.advance_amount)}</strong>
                  </div>

                  <div>
                    <span>Remaining</span>
                    <strong>{formatPrice(order.remaining_amount)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="account-back-link">
        <Link to="/">← Continue shopping</Link>
      </div>
    </main>
  );
}

export default Account;
