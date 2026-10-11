import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";
import "../css/SellerDashboard.css";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "canceled",
];

function getErrorMessage(data, fallback) {
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;

  if (data && typeof data === "object") {
    const firstError = Object.values(data).flat().find(
      (value) => typeof value === "string"
    );

    if (firstError) return firstError;
  }

  return fallback;
}

async function readResponse(response) {
  if (response.status === 204) return null;

  return response.json().catch(() => null);
}

function getList(data) {
  // Supports both normal arrays and paginated Django responses.
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;

  return null;
}

function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [productError, setProductError] = useState("");
  const [orderError, setOrderError] = useState("");

  const [deletingProducts, setDeletingProducts] = useState([]);
  const [updatingOrders, setUpdatingOrders] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

  // Read the logged-in user safely.
  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  // ----------------------------------------
  // FETCH SELLER PRODUCTS
  // ----------------------------------------

  const fetchMyProducts = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setProducts([]);
      setProductError("Please log in to view your products.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setProductError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/products/my-products/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to load your products.")
        );
      }

      const productList = getList(data);

      if (!productList) {
        throw new Error("The server returned an invalid product list.");
      }

      setProducts(productList);
    } catch (error) {
      console.error("Seller products error:", error);
      setProductError(
        error.message || "Unable to load your products."
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------------------
  // FETCH SELLER ORDERS
  // ----------------------------------------

  const fetchSellerOrders = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setOrders([]);
      setOrderError("Please log in to view your orders.");
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    setOrderError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/seller-orders/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to load your orders.")
        );
      }

      const orderList = getList(data);

      if (!orderList) {
        throw new Error("The server returned an invalid order list.");
      }

      setOrders(orderList);
    } catch (error) {
      console.error("Seller orders error:", error);
      setOrderError(error.message || "Unable to load your orders.");
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Load products and orders when the dashboard opens.
  useEffect(() => {
    fetchMyProducts();
    fetchSellerOrders();
  }, [fetchMyProducts, fetchSellerOrders]);

  // ----------------------------------------
  // REFRESH DASHBOARD DATA
  // ----------------------------------------

  async function handleRefresh() {
    setRefreshing(true);

    try {
      await Promise.all([
        fetchMyProducts(),
        fetchSellerOrders(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }

  // ----------------------------------------
  // DELETE PRODUCT
  // ----------------------------------------

  async function handleDelete(productId) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please log in first.");
      return;
    }

    if (deletingProducts.includes(productId)) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setDeletingProducts((previous) => [...previous, productId]);

    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to delete this product.")
        );
      }

      setProducts((previous) =>
        previous.filter((product) => product.id !== productId)
      );

      alert("Product deleted successfully.");
    } catch (error) {
      console.error("Delete product error:", error);
      alert(error.message || "Unable to delete this product.");
    } finally {
      setDeletingProducts((previous) =>
        previous.filter((id) => id !== productId)
      );
    }
  }

  // ----------------------------------------
  // UPDATE ORDER STATUS
  // ----------------------------------------

  async function updateOrderStatus(orderId, newStatus) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please log in first.");
      return;
    }

    if (!ORDER_STATUSES.includes(newStatus)) {
      alert("Invalid order status.");
      return;
    }

    if (updatingOrders.includes(orderId)) return;

    const currentOrder = orders.find(
      (order) => order.id === orderId
    );

    if (!currentOrder || currentOrder.status === newStatus) {
      return;
    }

    setUpdatingOrders((previous) => [...previous, orderId]);

    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/seller-status/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to update order status.")
        );
      }

      // Use the status returned by the backend if provided.
      const confirmedStatus = data?.status || newStatus;

      setOrders((previous) =>
        previous.map((order) =>
          order.id === orderId
            ? { ...order, status: confirmedStatus }
            : order
        )
      );
    } catch (error) {
      console.error("Order status update error:", error);
      alert(error.message || "Unable to update order status.");
    } finally {
      setUpdatingOrders((previous) =>
        previous.filter((id) => id !== orderId)
      );
    }
  }

  // ----------------------------------------
  // PRODUCT STATISTICS
  // ----------------------------------------

  const totalProducts = products.length;

  const inStockProducts = products.filter(
    (product) => Number(product.stock) > 0
  ).length;

  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.stock);
    return stock > 0 && stock <= 5;
  }).length;

  const outOfStockProducts = products.filter(
    (product) => Number(product.stock) === 0
  ).length;

  // ----------------------------------------
  // ORDER STATISTICS
  // ----------------------------------------

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const processingOrders = orders.filter(
    (order) => order.status === "processing"
  ).length;

  const shippedOrders = orders.filter(
    (order) => order.status === "shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const canceledOrders = orders.filter(
    (order) => order.status === "canceled"
  ).length;

  // Sum the value of delivered orders only.
  // This is not the same as profit or confirmed payouts.
  const totalSales = orders
    .filter((order) => order.status === "delivered")
    .reduce((total, order) => {
      const amount = Number(order.seller_total);

      return total + (
        Number.isFinite(amount) && amount > 0 ? amount : 0
      );
    }, 0);

  // ----------------------------------------
  // FORMAT HELPERS
  // ----------------------------------------

  function formatPrice(value) {
    const amount = Number(value);

    return Number.isFinite(amount)
      ? amount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "0.00";
  }

  function getStatusClass(status) {
    const safeStatus = ORDER_STATUSES.includes(status)
      ? status
      : "unknown";

    return `sd-status sd-status-${safeStatus}`;
  }

  // ----------------------------------------
  // RENDER
  // ----------------------------------------

  return (
    <div className="seller-dashboard-page">
      <Navbar />

      <main className="sd-container">
        {/* PAGE HEADER */}

        <section className="sd-page-header">
          <div>
            <p className="sd-eyebrow">SELLER CENTER</p>

            <h1>Seller Dashboard</h1>

            <p className="sd-welcome">
              Welcome back,{" "}
              <strong>{user?.username || "Seller"}</strong>.
              Here's how your store is doing.
            </p>
          </div>

          <div className="sd-header-actions">
            <button
              type="button"
              className="sd-btn sd-btn-secondary"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <i className="bi bi-arrow-clockwise"></i>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              to="/seller/add-product"
              className="sd-btn sd-btn-primary"
            >
              <i className="bi bi-plus-lg"></i>
              Add Product
            </Link>
          </div>
        </section>

        {/* PRODUCT OVERVIEW */}

        <section className="sd-section">
          <div className="sd-section-heading">
            <div>
              <h2>Product Overview</h2>
              <p>Keep track of your inventory.</p>
            </div>

            <Link
              to="/seller/add-product"
              className="sd-text-link"
            >
              Add a product <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {productError && (
            <div className="sd-alert sd-alert-error" role="alert">
              <i className="bi bi-exclamation-circle"></i>
              <span>{productError}</span>

              <button
                type="button"
                className="sd-retry-btn"
                onClick={fetchMyProducts}
              >
                Retry
              </button>
            </div>
          )}

          <div className="sd-stats-grid sd-product-stats">
            <article className="sd-stat-card">
              <div className="sd-stat-top">
                <span className="sd-stat-label">Total Products</span>
                <span className="sd-stat-icon sd-icon-purple">
                  <i className="bi bi-box-seam"></i>
                </span>
              </div>

              <h3>{loading ? "—" : totalProducts}</h3>
              <p>Products in your store</p>
            </article>

            <article className="sd-stat-card">
              <div className="sd-stat-top">
                <span className="sd-stat-label">In Stock</span>
                <span className="sd-stat-icon sd-icon-green">
                  <i className="bi bi-check-circle"></i>
                </span>
              </div>

              <h3>{loading ? "—" : inStockProducts}</h3>
              <p>Available for purchase</p>
            </article>

            <article className="sd-stat-card">
              <div className="sd-stat-top">
                <span className="sd-stat-label">Low Stock</span>
                <span className="sd-stat-icon sd-icon-orange">
                  <i className="bi bi-exclamation-triangle"></i>
                </span>
              </div>

              <h3>{loading ? "—" : lowStockProducts}</h3>
              <p>Five or fewer units</p>
            </article>

            <article className="sd-stat-card">
              <div className="sd-stat-top">
                <span className="sd-stat-label">Out of Stock</span>
                <span className="sd-stat-icon sd-icon-red">
                  <i className="bi bi-x-circle"></i>
                </span>
              </div>

              <h3>{loading ? "—" : outOfStockProducts}</h3>
              <p>Needs restocking</p>
            </article>
          </div>
        </section>

        {/* ORDER OVERVIEW */}

        <section className="sd-section">
          <div className="sd-section-heading">
            <div>
              <h2>Order Overview</h2>
              <p>Monitor orders and their delivery status.</p>
            </div>
          </div>

          {orderError && (
            <div className="sd-alert sd-alert-error" role="alert">
              <i className="bi bi-exclamation-circle"></i>
              <span>{orderError}</span>

              <button
                type="button"
                className="sd-retry-btn"
                onClick={fetchSellerOrders}
              >
                Retry
              </button>
            </div>
          )}

          <div className="sd-stats-grid sd-order-stats">
            <article className="sd-stat-card">
              <div className="sd-stat-top">
                <span className="sd-stat-label">Total Orders</span>
                <span className="sd-stat-icon sd-icon-purple">
                  <i className="bi bi-receipt"></i>
                </span>
              </div>

              <h3>{ordersLoading ? "—" : totalOrders}</h3>
              <p>Orders containing your products</p>
            </article>

            <article className="sd-stat-card">
              <div className="sd-stat-top">
                <span className="sd-stat-label">Pending</span>
                <span className="sd-stat-icon sd-icon-orange">
                  <i className="bi bi-clock-history"></i>
                </span>
              </div>

              <h3>{ordersLoading ? "—" : pendingOrders}</h3>
              <p>Awaiting processing</p>
            </article>

            <article className="sd-stat-card">
              <div className="sd-stat-top">
                <span className="sd-stat-label">Processing</span>
                <span className="sd-stat-icon sd-icon-blue">
                  <i className="bi bi-gear"></i>
                </span>
              </div>

              <h3>{ordersLoading ? "—" : processingOrders}</h3>
              <p>Being prepared</p>
            </article>

            <article className="sd-stat-card">
              <div className="sd-stat-top">
                <span className="sd-stat-label">Shipped</span>
                <span className="sd-stat-icon sd-icon-purple">
                  <i className="bi bi-truck"></i>
                </span>
              </div>

              <h3>{ordersLoading ? "—" : shippedOrders}</h3>
              <p>On the way</p>
            </article>

            <article className="sd-stat-card">
              <div className="sd-stat-top">
                <span className="sd-stat-label">Delivered</span>
                <span className="sd-stat-icon sd-icon-green">
                  <i className="bi bi-check2-circle"></i>
                </span>
              </div>

              <h3>{ordersLoading ? "—" : deliveredOrders}</h3>
              <p>Successfully delivered</p>
            </article>

            <article className="sd-stat-card">
              <div className="sd-stat-top">
                <span className="sd-stat-label">Canceled</span>
                <span className="sd-stat-icon sd-icon-red">
                  <i className="bi bi-x-circle"></i>
                </span>
              </div>

              <h3>{ordersLoading ? "—" : canceledOrders}</h3>
              <p>Canceled orders</p>
            </article>

            <article className="sd-stat-card sd-sales-card">
              <div className="sd-stat-top">
                <span className="sd-stat-label">Delivered Sales</span>
                <span className="sd-stat-icon sd-icon-pink">
                  <i className="bi bi-currency-rupee"></i>
                </span>
              </div>

              <h3 className="sd-sales-amount">
                {ordersLoading ? "—" : `₹${formatPrice(totalSales)}`}
              </h3>

              <p>Value of delivered orders</p>
            </article>
          </div>
        </section>

        {/* MY PRODUCTS */}

        <section className="sd-section">
          <div className="sd-section-heading">
            <div>
              <h2>My Products</h2>
              <p>Manage your listings, prices, and stock.</p>
            </div>

            <span className="sd-count-pill">
              {loading ? "Loading..." : `${totalProducts} products`}
            </span>
          </div>

          {loading ? (
            <div className="sd-state-card">
              <div className="sd-spinner"></div>
              <h3>Loading your products</h3>
              <p>Please wait while we fetch your inventory.</p>
            </div>
          ) : productError ? (
            <div className="sd-state-card">
              <i className="bi bi-exclamation-circle sd-state-icon"></i>
              <h3>Products could not be loaded</h3>
              <p>{productError}</p>

              <button
                type="button"
                className="sd-btn sd-btn-primary"
                onClick={fetchMyProducts}
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="sd-state-card">
              <i className="bi bi-box-seam sd-state-icon"></i>
              <h3>No products yet</h3>
              <p>
                Your store is ready. Add your first product to get started.
              </p>

              <Link
                to="/seller/add-product"
                className="sd-btn sd-btn-primary"
              >
                <i className="bi bi-plus-lg"></i>
                Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="sd-products-grid">
              {products.map((product) => {
                const stock = Number(product.stock);
                const isDeleting = deletingProducts.includes(product.id);

                let stockLabel = "In Stock";
                let stockClass = "sd-stock-good";

                if (stock === 0) {
                  stockLabel = "Out of Stock";
                  stockClass = "sd-stock-out";
                } else if (stock > 0 && stock <= 5) {
                  stockLabel = "Low Stock";
                  stockClass = "sd-stock-low";
                }

                return (
                  <article className="sd-product-card" key={product.id}>
                    <div className="sd-product-image-wrap">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name || "Product"}
                          className="sd-product-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="sd-product-no-image">
                          <i className="bi bi-image"></i>
                          <span>No image</span>
                        </div>
                      )}

                      <span className={`sd-stock-badge ${stockClass}`}>
                        {stockLabel}
                      </span>
                    </div>

                    <div className="sd-product-body">
                      <p className="sd-product-category">
                        {product.category_name || "Uncategorized"}
                      </p>

                      <h3 className="sd-product-name">
                        {product.name}
                      </h3>

                      <p className="sd-product-price">
                        ₹{formatPrice(product.price)}
                      </p>

                      <div className="sd-product-stock">
                        <span>Available stock</span>
                        <strong>
                          {Number.isFinite(stock) ? stock : "—"}
                        </strong>
                      </div>

                      <div className="sd-product-actions">
                        <Link
                          to={`/seller/edit-product/${product.id}`}
                          className="sd-btn sd-btn-edit"
                        >
                          <i className="bi bi-pencil"></i>
                          Edit
                        </Link>

                        <button
                          type="button"
                          className="sd-btn sd-btn-delete"
                          onClick={() => handleDelete(product.id)}
                          disabled={isDeleting}
                        >
                          <i className="bi bi-trash3"></i>
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* MY ORDERS */}

        <section className="sd-section sd-orders-section">
          <div className="sd-section-heading">
            <div>
              <h2>My Orders</h2>
              <p>Review customer orders and update their status.</p>
            </div>

            <span className="sd-count-pill">
              {ordersLoading ? "Loading..." : `${totalOrders} orders`}
            </span>
          </div>

          {ordersLoading ? (
            <div className="sd-state-card">
              <div className="sd-spinner"></div>
              <h3>Loading your orders</h3>
              <p>Please wait while we fetch your orders.</p>
            </div>
          ) : orderError ? (
            <div className="sd-state-card">
              <i className="bi bi-exclamation-circle sd-state-icon"></i>
              <h3>Orders could not be loaded</h3>
              <p>{orderError}</p>

              <button
                type="button"
                className="sd-btn sd-btn-primary"
                onClick={fetchSellerOrders}
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="sd-state-card">
              <i className="bi bi-receipt sd-state-icon"></i>
              <h3>No orders yet</h3>
              <p>
                Orders containing your products will appear here when
                customers place them.
              </p>
            </div>
          ) : (
            <div className="sd-orders-list">
              {orders.map((order) => {
                const orderItems = Array.isArray(order.items)
                  ? order.items
                  : [];

                const isUpdating = updatingOrders.includes(order.id);

                return (
                  <article className="sd-order-card" key={order.id}>
                    <div className="sd-order-header">
                      <div className="sd-order-info">
                        <span className="sd-order-label">ORDER ID</span>
                        <h3>#{order.id}</h3>

                        <p>
                          Customer:{" "}
                          <strong>
                            {order.customer_name || "Customer"}
                          </strong>
                        </p>
                      </div>

                      <div className="sd-order-total">
                        <span>Order Total</span>
                        <strong>
                          ₹{formatPrice(order.seller_total)}
                        </strong>
                      </div>
                    </div>

                    <div className="sd-order-management">
                      <div className="sd-order-status-current">
                        <span>Current status</span>

                        <span className={getStatusClass(order.status)}>
                          {order.status || "Unknown"}
                        </span>
                      </div>

                      <div className="sd-status-control">
                        <label htmlFor={`status-${order.id}`}>
                          Update status
                        </label>

                        <select
                          id={`status-${order.id}`}
                          className="sd-status-select"
                          value={order.status || "pending"}
                          disabled={isUpdating}
                          onChange={(event) =>
                            updateOrderStatus(order.id, event.target.value)
                          }
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() +
                                status.slice(1)}
                            </option>
                          ))}
                        </select>

                        {isUpdating && (
                          <span className="sd-updating-text">
                            Saving status...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="sd-order-items">
                      <h4>
                        Items in this order
                        <span>{orderItems.length}</span>
                      </h4>

                      {orderItems.length === 0 ? (
                        <p className="sd-no-items">
                          No item details are available for this order.
                        </p>
                      ) : (
                        orderItems.map((item) => (
                          <div
                            className="sd-order-item"
                            key={item.id}
                          >
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name || "Product"}
                                className="sd-order-item-image"
                                loading="lazy"
                              />
                            ) : (
                              <div className="sd-order-item-placeholder">
                                <i className="bi bi-image"></i>
                              </div>
                            )}

                            <div className="sd-order-item-details">
                              <h5>
                                {item.product_name || "Product"}
                              </h5>

                              <p>Quantity: {item.quantity ?? 0}</p>
                            </div>

                            <strong className="sd-order-item-price">
                              ₹{formatPrice(item.price)}
                            </strong>
                          </div>
                        ))
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <FooterSection />
    </div>
  );
}

export default SellerDashboard;
