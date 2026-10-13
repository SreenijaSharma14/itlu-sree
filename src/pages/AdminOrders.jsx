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
  const [queryCounts, setQueryCounts] = useState({
    orders: 0,
    items: 0,
    unmatchedItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [selectedStatuses, setSelectedStatuses] =
    useState({});

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);
  const [overviewFilters, setOverviewFilters] = useState({
    customer: "",
    size: "",
  });

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
    setQueryCounts({ orders: 0, items: 0, unmatchedItems: 0 });

    const pageSize = 500;
    const allOrders = [];
    let expectedOrderCount = 0;

    do {
      const from = allOrders.length;
      const { data: orderPage, error: orderError, count } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          customer_name,
          customer_phone,
          customer_email,
          total_amount,
          status
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .order("id", { ascending: true })
        .range(from, from + pageSize - 1);

      if (orderError || count === null) {
        console.error("Admin orders fetch error:", orderError);
        setError("We couldn't load the orders. Please try again.");
        setLoading(false);
        return;
      }

      expectedOrderCount = count;
      allOrders.push(...(orderPage || []));

      if (!orderPage?.length && allOrders.length < expectedOrderCount) {
        setError("The complete order list could not be loaded. Please try again.");
        setLoading(false);
        return;
      }
    } while (allOrders.length < expectedOrderCount);

    const orderIds = allOrders.map((order) => order.id);
    const allItems = [];
    let expectedItemCount = 0;

    if (orderIds.length > 0) {
      do {
        const from = allItems.length;
        const { data: itemPage, error: itemError, count } = await supabase
          .from("order_items")
          .select(`
            id,
            order_id,
            design_id,
            design_name,
            size,
            quantity,
            unit_price
          `, { count: "exact" })
          .in("order_id", orderIds)
          .order("order_id", { ascending: true })
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1);

        if (itemError || count === null) {
          console.error("Admin order items fetch error:", itemError);
          setError("We couldn't load all order products. Please try again.");
          setLoading(false);
          return;
        }

        expectedItemCount = count;
        allItems.push(...(itemPage || []));

        if (!itemPage?.length && allItems.length < expectedItemCount) {
          setError("The complete order product list could not be loaded. Please try again.");
          setLoading(false);
          return;
        }
      } while (allItems.length < expectedItemCount);
    }

    const getOrderKey = (id) => String(id ?? "");
    const itemsByOrderId = new Map();
    const fetchedOrderIds = new Set(allOrders.map((order) => getOrderKey(order.id)));
    const unmatchedItems = allItems.filter(
      (item) => !fetchedOrderIds.has(getOrderKey(item.order_id))
    ).length;

    allItems.forEach((item) => {
      const orderKey = getOrderKey(item.order_id);
      const items = itemsByOrderId.get(orderKey) || [];
      items.push(item);
      itemsByOrderId.set(orderKey, items);
    });

    const data = allOrders.map((order) => ({
      ...order,
      order_items: itemsByOrderId.get(getOrderKey(order.id)) || [],
    }));

    setOrders(data);
    setQueryCounts({
      orders: allOrders.length,
      items: allItems.length,
      unmatchedItems,
    });

    const initialStatuses = {};

    data.forEach((order) => {
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

  const formatPrice = (amount) => {
    if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) {
      return "Price unavailable";
    }

    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const filteredOrders = orders.filter((order) => {
    const customerMatches = String(order.customer_name || "")
      .toLowerCase()
      .includes(overviewFilters.customer.trim().toLowerCase());
    const itemMatches = !overviewFilters.size ||
      (order.order_items || []).some((item) =>
        String(item.size) === overviewFilters.size
      );

    return customerMatches && itemMatches;
  });

  const overviewRows = filteredOrders
    .map((order) => ({
      ...order,
      matchingItems: order.order_items || [],
    }));
  const clearOverviewFilters = () =>
    setOverviewFilters({
      customer: "",
      size: "",
    });

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
        error.code === "42501"
          ? "Your admin access could not update this order. Refresh the page and try again."
          : error.code === "PGRST116"
          ? "This order could not be found for updating. Refresh the page and try again."
          : "The status update failed. Check your connection and try again."
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
          <strong>{filteredOrders.length}</strong>

          <span>
            {filteredOrders.length === 1 ? "order in view" : "orders in view"}
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

      <section className="admin-overview" aria-labelledby="admin-overview-title">
        <div className="admin-overview-heading">
          <div>
            <p className="section-eyebrow">ORDER MANAGEMENT</p>
            <h2 id="admin-overview-title">All orders</h2>
            <p>One row per order, with its products and sizes grouped together.</p>
          </div>
          <p className="admin-overview-result-count" aria-live="polite">
            {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
          </p>
        </div>

        <p className="admin-query-counts">
          Loaded {queryCounts.orders} authorised orders and {queryCounts.items} authorised product items.
        </p>

        {queryCounts.unmatchedItems > 0 && (
          <p className="admin-data-warning" role="status">
            {queryCounts.unmatchedItems} product {queryCounts.unmatchedItems === 1 ? "record does" : "records do"}
            {" "}not match a fetched order and could not be placed in the product table.
          </p>
        )}

        <div className="admin-overview-panel">
          <div className="admin-overview-panel-heading">
            <div>
              <h3>Orders</h3>
              <p>All available statuses are included, including cancelled orders.</p>
            </div>
            <button
              type="button"
              className="admin-clear-filters"
              onClick={clearOverviewFilters}
              disabled={!Object.values(overviewFilters).some(Boolean)}
            >
              Clear filters
            </button>
          </div>

          <div className="admin-overview-filters">
            <label>
              <span>Customer</span>
              <input
                type="search"
                value={overviewFilters.customer}
                onChange={(event) =>
                  setOverviewFilters((current) => ({
                    ...current,
                    customer: event.target.value,
                  }))
                }
                placeholder="Search customer name"
              />
            </label>

            <label>
              <span>T-shirt size</span>
              <select
                value={overviewFilters.size}
                onChange={(event) =>
                  setOverviewFilters((current) => ({
                    ...current,
                    size: event.target.value,
                  }))
                }
              >
                <option value="">All sizes</option>
                {availableSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>

          </div>

          {overviewRows.length === 0 ? (
            <div className="admin-overview-empty">
              <strong>No matching orders</strong>
              <p>Try changing or clearing your filters.</p>
            </div>
          ) : (
            <div className="admin-overview-table-wrap">
              <table className="admin-overview-table">
                <thead>
                  <tr>
                    <th>Order ID / number</th>
                    <th>Customer name</th>
                    <th>Design / product and ID</th>
                    <th>T-shirt size</th>
                    <th>Total price</th>
                    <th>Order status</th>
                  </tr>
                </thead>
                <tbody>
                  {overviewRows.map((order) => (
                    <tr key={order.id}>
                      <td data-label="Order ID / number">{order.order_number || order.id}</td>
                      <td data-label="Customer name">
  <div className="admin-customer-contact">
    <strong>
      {order.customer_name || "Customer name unavailable"}
    </strong>

    <div>
      <strong>Phone:</strong>{" "}
      {order.customer_phone || "Not provided"}
    </div>

    <div>
      <strong>Email:</strong>{" "}
      {order.customer_email || "Not provided"}
    </div>
  </div>
</td>
                      <td data-label="Design / product and ID">
                        <ul className="admin-overview-products">
                          {order.matchingItems.length ? order.matchingItems.map((item, index) => (
                            <li key={item.id ?? `${item.design_id ?? "item"}-${index}`}>
                              <span>{item.design_name || "Product name unavailable"}</span>
                              <small>{item.design_id || "Design ID unavailable"} · Qty {item.quantity ?? "Quantity unavailable"}</small>
                              {item.unit_price !== null && item.unit_price !== undefined &&
                                item.quantity !== null && item.quantity !== undefined &&
                                Number.isFinite(Number(item.unit_price)) &&
                                Number.isFinite(Number(item.quantity)) ? (
                                  <small>
                                    {formatPrice(item.unit_price)} × {item.quantity} = {formatPrice(
                                      Number(item.unit_price) * Number(item.quantity)
                                    )}
                                  </small>
                                ) : (
                                  <small>Item price unavailable</small>
                                )}
                            </li>
                          )) : <li><span>No visible product items</span></li>}
                        </ul>
                      </td>
                      <td data-label="T-shirt size">
                        <ul className="admin-overview-products">
                          {order.matchingItems.length ? order.matchingItems.map((item, index) => (
                            <li key={item.id ?? `${item.design_id ?? "size"}-${index}`}>
                              <span>{item.size || "Size unavailable"}</span>
                            </li>
                          )) : <li><span>—</span></li>}
                        </ul>
                      </td>
                      <td data-label="Total price">
                        {formatPrice(order.total_amount)}
                      </td>
                      <td data-label="Order status">
                        {order.status === "cancelled" || order.status === "delivered" ? (
                          <span className={`admin-overview-status status-${order.status}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        ) : (
                          <div className="admin-status-controls">
                            <select
                              value={selectedStatuses[order.id] || order.status}
                              onChange={(event) => handleStatusChange(order.id, event.target.value)}
                              disabled={updatingOrderId === order.id}
                              aria-label={`Update status for ${order.order_number || "order"}`}
                            >
                              <option value={order.status}>{getStatusLabel(order.status)}</option>
                              {getNextStatus(order.status) && (
                                <option value={getNextStatus(order.status).value}>
                                  {getNextStatus(order.status).label}
                                </option>
                              )}
                            </select>
                            <button
                              type="button"
                              className="primary-button admin-update-button"
                              disabled={
                                !selectedStatuses[order.id] ||
                                selectedStatuses[order.id] === order.status ||
                                updatingOrderId === order.id
                              }
                              onClick={() => updateOrderStatus(order)}
                            >
                              {updatingOrderId === order.id ? "Updating..." : "Save"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </section>

    </main>
  );
}

export default AdminOrders;
