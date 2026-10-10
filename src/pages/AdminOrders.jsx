import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

function AdminOrders() {
  const {
    user,
    profile,
    loading: authLoading,
  } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [selectedStatuses, setSelectedStatuses] =
    useState({});

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  /*
    ==========================================
    STATUS FLOW
    ==========================================

    pending
      ↓
    accepted
      ↓
    payment
      ↓
    confirmation
      ↓
    ready
      ↓
    out_for_delivery
      ↓
    delivered

    cancelled is a terminal status.
  */

  const statusFlow = [
    {
      value: "pending",
      label: "Pending",
      description:
        "Waiting for the order to be reviewed.",
    },
    {
      value: "accepted",
      label: "Accepted",
      description:
        "Order has been reviewed and accepted.",
    },
    {
      value: "payment",
      label: "Payment",
      description:
        "Waiting for the 50% advance payment.",
    },
    {
      value: "confirmation",
      label: "Confirmation",
      description:
        "Advance payment has been verified.",
    },
    {
      value: "ready",
      label: "Ready",
      description:
        "The hand-painted T-shirt is ready.",
    },
    {
      value: "out_for_delivery",
      label: "Out for delivery",
      description:
        "The order is on its way to the customer.",
    },
    {
      value: "delivered",
      label: "Delivered",
      description:
        "The order has been delivered.",
    },
  ];

  const statusLabels = {
    pending: "Pending",
    accepted: "Accepted",
    payment: "Payment",
    confirmation: "Confirmation",
    ready: "Ready",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  /*
    ==========================================
    FETCH ORDERS
    ==========================================
  */

  const fetchOrders = async () => {
    if (!user || profile?.role !== "admin") {
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
        customer_name,
        customer_phone,
        customer_email,
        delivery_address,
        note,
        total_amount,
        advance_amount,
        remaining_amount,
        advance_accepted,
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
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Admin orders fetch error:",
        error
      );

      setError(
        "We couldn't load the orders. Please try again."
      );

      setLoading(false);
      return;
    }

    setOrders(data || []);

    const initialStatuses = {};

    (data || []).forEach((order) => {
      initialStatuses[order.id] = order.status;
    });

    setSelectedStatuses(initialStatuses);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [user, profile, authLoading]);

  /*
    ==========================================
    HELPERS
    ==========================================
  */

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusLabel = (status) => {
    return (
      statusLabels[status] ||
      status
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
          letter.toUpperCase()
        ) ||
      "Pending"
    );
  };

  /*
    ==========================================
    GET NEXT VALID STATUS
    ==========================================
  */

  const getNextStatus = (currentStatus) => {
    const currentIndex = statusFlow.findIndex(
      (status) => status.value === currentStatus
    );

    if (
      currentIndex === -1 ||
      currentIndex >= statusFlow.length - 1
    ) {
      return null;
    }

    return statusFlow[currentIndex + 1];
  };

  /*
    ==========================================
    STATUS SELECT
    ==========================================
  */

  const handleStatusChange = (
    orderId,
    newStatus
  ) => {
    setSelectedStatuses((previous) => ({
      ...previous,
      [orderId]: newStatus,
    }));

    setError("");
    setSuccessMessage("");
  };

  /*
    ==========================================
    UPDATE ORDER STATUS
    ==========================================
  */

  const updateOrderStatus = async (order) => {
    const newStatus =
      selectedStatuses[order.id];

    if (
      !newStatus ||
      newStatus === order.status
    ) {
      return;
    }

    /*
      Safety check:
      Only allow the immediate next status.
    */

    const nextStatus = getNextStatus(
      order.status
    );

    if (
      !nextStatus ||
      newStatus !== nextStatus.value
    ) {
      setError(
        `This order can only move from ${getStatusLabel(
          order.status
        )} to ${getStatusLabel(
          nextStatus?.value
        )}.`
      );

      setSelectedStatuses((previous) => ({
        ...previous,
        [order.id]: order.status,
      }));

      return;
    }

    setUpdatingOrderId(order.id);
    setError("");
    setSuccessMessage("");

    const { data, error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
      })
      .eq("id", order.id)
      .select()
      .single();

    if (error) {
      console.error(
        "Order status update error:",
        error
      );

      setError(
        "We couldn't update this order. Please try again."
      );

      setSelectedStatuses((previous) => ({
        ...previous,
        [order.id]: order.status,
      }));

      setUpdatingOrderId(null);
      return;
    }

    setOrders((previousOrders) =>
      previousOrders.map((currentOrder) =>
        currentOrder.id === order.id
          ? {
              ...currentOrder,
              status: data.status,
            }
          : currentOrder
      )
    );

    setSelectedStatuses((previous) => ({
      ...previous,
      [order.id]: data.status,
    }));

    setSuccessMessage(
      `${order.order_number} updated to ${getStatusLabel(
        data.status
      )}.`
    );

    setUpdatingOrderId(null);
  };

  /*
    ==========================================
    LOADING
    ==========================================
  */

  if (authLoading || loading) {
    return (
      <main className="admin-orders-page">
        <div className="admin-orders-loading">
          <p className="section-eyebrow">
            ADMIN
          </p>

          <h1>Orders</h1>

          <p>Loading orders...</p>
        </div>
      </main>
    );
  }

  /*
    ==========================================
    NOT LOGGED IN
    ==========================================
  */

  if (!user) {
    return (
      <main className="admin-orders-page">
        <div className="admin-orders-empty">
          <p className="section-eyebrow">
            ADMIN
          </p>

          <h1>Please log in</h1>

          <p>
            You need to be logged in to access
            the admin dashboard.
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

  /*
    ==========================================
    ACCESS DENIED
    ==========================================
  */

  if (profile?.role !== "admin") {
    return (
      <main className="admin-orders-page">
        <div className="admin-orders-empty">
          <p className="section-eyebrow">
            ADMIN
          </p>

          <h1>Access denied</h1>

          <p>
            This area is only available to the
            itlu sree admin.
          </p>

          <Link
            to="/"
            className="primary-button"
          >
            Back to store
          </Link>
        </div>
      </main>
    );
  }

  /*
    ==========================================
    ADMIN PAGE
    ==========================================
  */

  return (
    <main className="admin-orders-page">
      <div className="admin-orders-heading">
        <div>
          <p className="section-eyebrow">
            ITLU SREE · ADMIN
          </p>

          <h1>Orders</h1>

          <p>
            Manage customer orders and keep track
            of every purchase.
          </p>
        </div>

        <div className="admin-order-count">
          <strong>{orders.length}</strong>

          <span>
            {orders.length === 1
              ? "order"
              : "orders"}
          </span>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="admin-orders-error">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {successMessage && (
        <div className="admin-orders-success">
          {successMessage}
        </div>
      )}

      {/* NO ORDERS */}

      {orders.length === 0 ? (
        <div className="admin-orders-empty">
          <h2>No orders yet</h2>

          <p>
            Customer orders will appear here once
            someone places an order.
          </p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {orders.map((order) => {
            const selectedStatus =
              selectedStatuses[order.id] ||
              order.status;

            const hasChanged =
              selectedStatus !== order.status;

            const isUpdating =
              updatingOrderId === order.id;

            const isCancelled =
              order.status === "cancelled";

            const isDelivered =
              order.status === "delivered";

            const nextStatus = getNextStatus(
              order.status
            );

            return (
              <article
                key={order.id}
                className="admin-order-card"
              >
                {/* ==================================
                    HEADER
                ================================== */}

                <div className="admin-order-header">
                  <div>
                    <p className="admin-order-number">
                      {order.order_number}
                    </p>

                    <p className="admin-order-date">
                      {formatDate(
                        order.created_at
                      )}
                    </p>
                  </div>

                  <span
                    className={`order-status status-${order.status}`}
                  >
                    {getStatusLabel(
                      order.status
                    )}
                  </span>
                </div>

                {/* ==================================
                    STATUS CONTROL
                ================================== */}

                <section className="admin-status-section">
                  <div>
                    <div className="admin-section-title">
                      Update status
                    </div>

                    <p className="admin-status-help">
                      {isCancelled
                        ? "This order has been cancelled and cannot be modified."
                        : isDelivered
                        ? "This order has been delivered and cannot be modified."
                        : nextStatus
                        ? `Next step: ${nextStatus.label}.`
                        : "No further status changes are available."}
                    </p>
                  </div>

                  {!isCancelled &&
                    !isDelivered && (
                      <div className="admin-status-controls">
                        <select
                          value={selectedStatus}
                          onChange={(event) =>
                            handleStatusChange(
                              order.id,
                              event.target.value
                            )
                          }
                          disabled={isUpdating}
                        >
                          <option
                            value={order.status}
                          >
                            {getStatusLabel(
                              order.status
                            )}
                          </option>

                          {nextStatus && (
                            <option
                              value={
                                nextStatus.value
                              }
                            >
                              →{" "}
                              {nextStatus.label}
                            </option>
                          )}
                        </select>

                        <button
                          type="button"
                          className="primary-button admin-update-button"
                          disabled={
                            !hasChanged ||
                            isUpdating
                          }
                          onClick={() =>
                            updateOrderStatus(
                              order
                            )
                          }
                        >
                          {isUpdating
                            ? "Updating..."
                            : "Update status"}
                        </button>
                      </div>
                    )}
                </section>

                {/* ==================================
                    CANCELLED ORDER INFO
                ================================== */}

                {isCancelled && (
                  <section className="admin-cancelled-section">
                    <div className="admin-section-title">
                      Cancellation
                    </div>

                    <div className="admin-cancelled-box">
                      <strong>
                        Order cancelled
                      </strong>

                      {order.cancellation_reason && (
                        <p>
                          <strong>
                            Reason:
                          </strong>{" "}
                          {order.cancellation_reason}
                        </p>
                      )}

                      {order.cancelled_at && (
                        <p>
                          Cancelled on{" "}
                          {formatDate(
                            order.cancelled_at
                          )}
                        </p>
                      )}
                    </div>
                  </section>
                )}

                {/* ==================================
                    CUSTOMER
                ================================== */}

                <section className="admin-order-section">
                  <div className="admin-section-title">
                    Customer
                  </div>

                  <div className="admin-customer-grid">
                    <div>
                      <span>Name</span>

                      <strong>
                        {order.customer_name ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>Phone</span>

                      <strong>
                        {order.customer_phone ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>Email</span>

                      <strong>
                        {order.customer_email ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Delivery address
                      </span>

                      <strong>
                        {order.delivery_address ||
                          "—"}
                      </strong>
                    </div>
                  </div>

                  {order.note && (
                    <div className="admin-customer-note">
                      <span>
                        Customer note
                      </span>

                      <p>{order.note}</p>
                    </div>
                  )}
                </section>

                {/* ==================================
                    ITEMS
                ================================== */}

                <section className="admin-order-section">
                  <div className="admin-section-title">
                    Order items
                  </div>

                  <div className="admin-order-items">
                    {order.order_items?.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="admin-order-item"
                        >
                          <div>
                            <strong>
                              {item.design_name}
                            </strong>

                            <p>
                              {item.design_id} ·
                              Size{" "}
                              {item.size} · Qty{" "}
                              {item.quantity}
                            </p>
                          </div>

                          <strong>
                            ₹
                            {(
                              Number(
                                item.unit_price
                              ) *
                              item.quantity
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                </section>

                {/* ==================================
                    PAYMENT
                ================================== */}

                <section className="admin-order-section">
                  <div className="admin-section-title">
                    Payment
                  </div>

                  <div className="admin-payment-grid">
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

                    <div>
                      <span>
                        Advance accepted
                      </span>

                      <strong>
                        {order.advance_accepted
                          ? "Yes"
                          : "No"}
                      </strong>
                    </div>
                  </div>
                </section>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default AdminOrders;