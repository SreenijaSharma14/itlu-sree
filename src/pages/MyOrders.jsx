import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

function MyOrders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cancellation states
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [showCancelWarning, setShowCancelWarning] =
    useState(false);
  const [cancellationReason, setCancellationReason] =
    useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
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
          cancelled_at,
          cancellation_reason,
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
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Orders fetch error:", error);

        setError(
          "We couldn't load your orders right now. Please try again."
        );

        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const getStatusLabel = (status) => {
    if (!status) return "Pending";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const orderSteps = [
    {
      key: "pending",
      label: "Order placed",
      description:
        "Your order request has been received.",
    },
    {
      key: "accepted",
      label: "Accepted",
      description:
        "Your order has been reviewed and accepted.",
    },
    {
      key: "payment",
      label: "Payment",
      description:
        "Your 50% advance payment is being processed.",
    },
    {
      key: "confirmation",
      label: "Confirmation",
      description:
        "Your advance payment has been verified.",
    },
    {
      key: "ready",
      label: "Ready",
      description:
        "Your hand-painted T-shirt is ready.",
    },
    {
      key: "out_for_delivery",
      label: "Out for delivery",
      description:
        "Your order is on its way to you.",
    },
    {
      key: "delivered",
      label: "Delivered",
      description:
        "Your order has been delivered. ♡",
    },
  ];

  const getCurrentStep = (status) => {
    const stepIndex = orderSteps.findIndex(
      (step) => step.key === status
    );

    return stepIndex === -1 ? 0 : stepIndex;
  };

  // ==========================================
  // CANCELLATION
  // ==========================================

  const openCancellation = (order) => {
    setCancellingOrder(order);
    setShowCancelWarning(true);
    setCancellationReason("");
    setCancelError("");
  };

  const continueCancellation = () => {
    setShowCancelWarning(false);
  };

  const closeCancellation = () => {
    if (cancelling) return;

    setCancellingOrder(null);
    setShowCancelWarning(false);
    setCancellationReason("");
    setCancelError("");
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;

    if (cancellingOrder.status !== "pending") {
      setCancelError(
        "This order can no longer be cancelled."
      );
      return;
    }

    if (!cancellationReason.trim()) {
      setCancelError(
        "Please tell us why you would like to cancel this order."
      );
      return;
    }

    setCancelling(true);
    setCancelError("");

    const { data, error } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        cancellation_reason:
          cancellationReason.trim(),
      })
      .eq("id", cancellingOrder.id)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .select(`
        id,
        order_number,
        total_amount,
        advance_amount,
        remaining_amount,
        status,
        created_at,
        cancelled_at,
        cancellation_reason,
        order_items (
          id,
          design_id,
          design_name,
          size,
          quantity,
          unit_price
        )
      `)
      .single();

    if (error) {
      console.error(
        "Order cancellation error:",
        error
      );

      setCancelError(
        "We couldn't cancel this order. It may have already been accepted. Please refresh and try again."
      );

      setCancelling(false);
      return;
    }

    setOrders((previousOrders) =>
      previousOrders.map((order) =>
        order.id === data.id ? data : order
      )
    );

    setCancellingOrder(null);
    setShowCancelWarning(false);
    setCancellationReason("");
    setCancelError("");
    setCancelling(false);
  };

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!user) {
    return (
      <main className="my-orders-page">
        <div className="my-orders-empty">
          <p className="section-eyebrow">
            MY ORDERS
          </p>

          <h1>Please log in</h1>

          <p>
            Log in to your account to view your orders
            and order history.
          </p>

          <Link
            to="/auth"
            className="primary-button"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="my-orders-page">
        <div className="my-orders-heading">
          <p className="section-eyebrow">
            MY ORDERS
          </p>

          <h1>Your orders</h1>

          <p>
            Loading your order history...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="my-orders-page">
        <div className="my-orders-empty">
          <p className="section-eyebrow">
            MY ORDERS
          </p>

          <h1>Something went wrong</h1>

          <p>{error}</p>

          <Link
            to="/"
            className="primary-button"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="my-orders-page">
      <div className="my-orders-heading">
        <p className="section-eyebrow">
          MY ORDERS
        </p>

        <h1>Your orders</h1>

        <p>
          Keep track of your itlu sree orders and
          their current status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="my-orders-empty">
          <h2>No orders yet</h2>

          <p>
            You haven't placed an order yet. Your
            hand-painted T-shirt journey starts here. ♡
          </p>

          <Link
            to="/"
            className="primary-button"
          >
            Explore designs
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const isCancelled =
              order.status === "cancelled";

            const currentStep = getCurrentStep(
              order.status
            );

            return (
              <article
                key={order.id}
                className="order-history-card"
              >
                {/* ORDER HEADER */}

                <div className="order-history-header">
                  <div>
                    <p className="order-number">
                      {order.order_number}
                    </p>

                    <p className="order-date">
                      Placed on{" "}
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <span
                    className={`order-status status-${order.status}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {/* CANCELLED ORDER */}

                {isCancelled ? (
                  <div className="cancelled-order-box">
                    <div className="cancelled-order-icon">
                      ×
                    </div>

                    <div>
                      <strong>
                        Order cancelled
                      </strong>

                      <p>
                        This order was cancelled before
                        it was accepted.
                      </p>

                      {order.cancellation_reason && (
                        <p className="cancellation-reason">
                          <strong>
                            Reason:
                          </strong>{" "}
                          {order.cancellation_reason}
                        </p>
                      )}

                      {order.cancelled_at && (
                        <p className="cancellation-date">
                          Cancelled on{" "}
                          {formatDate(
                            order.cancelled_at
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* STATUS TIMELINE */}

                    <div className="order-timeline">
                      {orderSteps.map(
                        (step, index) => {
                          const isCompleted =
                            index <= currentStep;

                          const isCurrent =
                            index === currentStep;

                          return (
                            <div
                              key={step.key}
                              className={`timeline-step ${
                                isCompleted
                                  ? "timeline-completed"
                                  : ""
                              } ${
                                isCurrent
                                  ? "timeline-current"
                                  : ""
                              }`}
                            >
                              <div className="timeline-marker">
                                {isCompleted
                                  ? "✓"
                                  : ""}
                              </div>

                              <div className="timeline-content">
                                <strong>
                                  {step.label}
                                </strong>

                                <p>
                                  {step.description}
                                </p>
                              </div>

                              {index <
                                orderSteps.length -
                                  1 && (
                                <div
                                  className={`timeline-line ${
                                    index <
                                    currentStep
                                      ? "timeline-line-completed"
                                      : ""
                                  }`}
                                />
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                )}

                {/* ORDER ITEMS */}

                <div className="order-history-items">
                  {order.order_items?.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="order-history-item"
                      >
                        <div>
                          <strong>
                            {item.design_name}
                          </strong>

                          <p>
                            {item.design_id} · Size{" "}
                            {item.size} · Qty{" "}
                            {item.quantity}
                          </p>
                        </div>

                        <span>
                          ₹
                          {(
                            Number(
                              item.unit_price
                            ) *
                            item.quantity
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* PRICE SUMMARY */}

                <div className="order-history-footer">
                  <div>
                    <span>Total</span>

                    <strong>
                      ₹
                      {Number(
                        order.total_amount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Advance</span>

                    <strong>
                      ₹
                      {Number(
                        order.advance_amount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Remaining</span>

                    <strong>
                      ₹
                      {Number(
                        order.remaining_amount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                </div>

                {/* CUSTOMER CANCELLATION */}

                {order.status === "pending" && (
                  <div className="order-cancel-section">
                    <div>
                      <strong>
                        Changed your mind?
                      </strong>

                      <p>
                        You can cancel this order
                        while it is still pending.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="cancel-order-button"
                      onClick={() =>
                        openCancellation(order)
                      }
                    >
                      Cancel order
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <div className="my-orders-back">
        <Link to="/">
          ← Continue shopping
        </Link>
      </div>

      {/* ==========================================
          CANCELLATION POPUPS
      ========================================== */}

      {cancellingOrder && (
        <div
          className="cancellation-modal-overlay"
          onClick={closeCancellation}
        >
          {/* ======================================
              STEP 1 — WARNING
          ====================================== */}

          {showCancelWarning ? (
            <div
              className="cancellation-modal cancellation-warning-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="cancellation-warning-icon">
                !
              </div>

              <p className="section-eyebrow">
                CANCEL ORDER
              </p>

              <h2>
                Are you sure?
              </h2>

              <p className="cancellation-warning-text">
                You're about to cancel{" "}
                <strong>
                  {cancellingOrder.order_number}
                </strong>
                .
              </p>

              {/* PAYMENT WARNING */}

              <div className="payment-warning-box">
                <strong>
                  ⚠ Payment & refund policy
                </strong>

                <p>
                  If you have already made any payment
                  for this order,{" "}
                  <strong>
                    no refund will be issued
                  </strong>{" "}
                  after cancellation.
                </p>
              </div>

              <p className="cancellation-final-question">
                Do you really want to cancel this
                order?
              </p>

              <div className="cancellation-modal-actions">
                <button
                  type="button"
                  className="secondary-cancel-button"
                  onClick={closeCancellation}
                >
                  No, keep my order
                </button>

                <button
                  type="button"
                  className="danger-cancel-button"
                  onClick={continueCancellation}
                >
                  Yes, continue
                </button>
              </div>
            </div>
          ) : (
            /* ======================================
               STEP 2 — CANCELLATION REASON
            ====================================== */

            <div
              className="cancellation-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="cancellation-modal-header">
                <div>
                  <p className="section-eyebrow">
                    CANCEL ORDER
                  </p>

                  <h2>
                    Cancel{" "}
                    {cancellingOrder.order_number}?
                  </h2>
                </div>

                <button
                  type="button"
                  className="cancellation-close"
                  onClick={closeCancellation}
                  disabled={cancelling}
                >
                  ×
                </button>
              </div>

              <p className="cancellation-modal-description">
                This order has not been accepted yet,
                so you can cancel it now. Once
                cancelled, the order cannot be
                restored.
              </p>

              <div className="form-field">
                <label htmlFor="cancellationReason">
                  Why are you cancelling?
                </label>

                <textarea
                  id="cancellationReason"
                  value={cancellationReason}
                  onChange={(event) => {
                    setCancellationReason(
                      event.target.value
                    );
                    setCancelError("");
                  }}
                  placeholder="Tell us why you'd like to cancel this order..."
                  rows="4"
                  disabled={cancelling}
                />
              </div>

              {cancelError && (
                <p className="auth-message auth-error">
                  {cancelError}
                </p>
              )}

              <div className="cancellation-modal-actions">
                <button
                  type="button"
                  className="secondary-cancel-button"
                  onClick={closeCancellation}
                  disabled={cancelling}
                >
                  Keep order
                </button>

                <button
                  type="button"
                  className="danger-cancel-button"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling
                    ? "Cancelling..."
                    : "Yes, cancel order"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default MyOrders;