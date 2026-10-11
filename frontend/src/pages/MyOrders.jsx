import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";

import api from "../services/api";

import "../css/MyOrders.css";

const orderSteps = ["pending", "processing", "shipped", "delivered"];

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH BUYER ORDERS

  useEffect(() => {
    fetchOrders();
  }, []);

 async function handleCancelOrder(orderId) {

    const confirmCancel = window.confirm(
        "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) {
        return;
    }

    try {

        const response = await api.post(
            `orders/${orderId}/cancel/`
        );

        console.log("Cancel Order:", response.data);

        alert("Order canceled successfully.");

        // Remove only this order from the screen
        setOrders((previousOrders) =>
            previousOrders.filter(
                (order) => order.id !== orderId
            )
        );

    } catch (error) {

        console.log("Cancel order error:", error);

        alert(
            error.response?.data?.detail ||
            "Unable to cancel this order."
        );

    }
}

  async function fetchOrders() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);

      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/orders/", {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("My Orders:", data);

      if (response.ok) {
        setOrders(data);
      } else {
        console.log("Order error:", data);
      }
    } catch (error) {
      console.log("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  }

  // GET STEP NUMBER

  function getStepNumber(status) {
    return orderSteps.indexOf(status);
  }

  // GET STATUS TEXT

  function getStatusText(status) {
    switch (status) {
      case "pending":
        return "Order Placed";

      case "processing":
        return "Processing";

      case "shipped":
        return "Shipped";

      case "delivered":
        return "Delivered";

      case "canceled":
        return "Canceled";

      default:
        return status;
    }
  }

  // STATUS CLASS

  function getStatusClass(status) {
    switch (status) {
      case "pending":
        return "order-status pending";

      case "processing":
        return "order-status processing";

      case "shipped":
        return "order-status shipped";

      case "delivered":
        return "order-status delivered";

      case "canceled":
        return "order-status canceled";

      default:
        return "order-status";
    }
  }

  // LOADING

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="orders-page">
          <div className="orders-loading">
            <div className="spinner-border"></div>

            <h5>Loading your orders...</h5>
          </div>
        </div>

        <FooterSection />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="orders-page">
        <div className="orders-wrapper">
          {/* PAGE HEADER */}

          <div className="orders-header">
            <div>
              <h1>My Orders</h1>

              <p>Track your orders and view your purchase details.</p>
            </div>

            <div className="orders-count">
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </div>
          </div>

          {/* EMPTY ORDERS */}

          {orders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-order-icon">📦</div>

              <h2>No orders yet</h2>

              <p>Your purchased products will appear here.</p>

              <Link to="/products" className="btn btn-primary px-4">
                Start Shopping
              </Link>
            </div>
          ) : (
            /* ORDER LIST */

            <div className="orders-list">
              {orders.map((order) => {
                const currentStep = getStepNumber(order.status);

                return (
                  <div className="order-card" key={order.id}>
                    {/* =========================
                        ORDER HEADER
                    ========================= */}

                    <div className="order-card-header">
                      <div>
                        <div className="order-date">
                          Order Placed on{" "}
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </div>
                      </div>

                      <div className="order-header-right">
                        <span className={getStatusClass(order.status)}>
                          {getStatusText(order.status)}
                        </span>

                        <div className="order-total">
                          ₹{Number(order.total_price).toFixed(2)}
                        </div>

                        {/* CANCEL ORDER */}

                        <div className="order-cancel-section">
                          <button
                            type="button"
                            className="cancel-order-button"
                            disabled={
                              order.status !== "pending" &&
                              order.status !== "processing"
                            }
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            {order.status === "canceled"
                              ? "Order Canceled"
                              : order.status === "shipped"
                                ? "Cannot Cancel"
                                : order.status === "delivered"
                                  ? "Order Delivered"
                                  : "Cancel Order"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* =========================
                        TRACKING
                    ========================= */}

                    {order.status === "canceled" ? (
                      <div className="cancelled-box">
                        <div className="cancelled-icon">✕</div>

                        <div>
                          <strong>Order Canceled</strong>

                          <p>This order has been canceled.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="tracking-section">
                        <div className="tracking-line"></div>

                        <div className="tracking-steps">
                          {orderSteps.map((step, index) => {
                            const completed = index <= currentStep;

                            const active = index === currentStep;

                            return (
                              <div className="tracking-step" key={step}>
                                <div
                                  className={
                                    completed
                                      ? "tracking-dot completed"
                                      : "tracking-dot"
                                  }
                                >
                                  {completed ? "✓" : index + 1}
                                </div>

                                <div
                                  className={
                                    active
                                      ? "tracking-label active"
                                      : "tracking-label"
                                  }
                                >
                                  {getStatusText(step)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* =========================
                        ORDER ITEMS
                    ========================= */}

                    <div className="order-items-section">
                      <h5>Ordered Items</h5>

                      {order.items &&
                        order.items.map((item) => (
                          <div className="order-item" key={item.id}>
                            {/* IMAGE */}

                            <div className="order-item-image-box">
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="order-item-image"
                              />
                            </div>

                            {/* DETAILS */}

                            <div className="order-item-details">
                              <h6>{item.product_name}</h6>

                              <p>Quantity: {item.quantity}</p>

                              <p>
                                Price per item: ₹{Number(item.price).toFixed(2)}
                              </p>
                            </div>

                            {/* ITEM TOTAL */}

                            <div className="order-item-total">
                              <span>Item Total</span>

                              <strong>
                                ₹
                                {(Number(item.price) * item.quantity).toFixed(
                                  2,
                                )}
                              </strong>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* =========================
                        ORDER FOOTER
                    ========================= */}

                    <div className="order-card-footer">
                      <span>Order Total</span>

                      <strong>₹{Number(order.total_price).toFixed(2)}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <FooterSection />
    </>
  );
}

export default MyOrders;
