import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../css/Checkout.css";

import FooterSection from "../components/FooterSection";
import Navbar from "../components/Navbar";

import { CartContext } from "./CartContext";
import api from "../services/api";


function Checkout() {

  const { cart, clearCart } = useContext(CartContext);

  const navigate = useNavigate();


  // ==========================================
  // CUSTOMER DETAILS
  // ==========================================

  const [name, setName] = useState(() => {

    try {

      const stored =
        localStorage.getItem("user");

      return stored
        ? JSON.parse(stored)?.username || ""
        : "";

    } catch {

      return "";

    }

  });


  const [address, setAddress] =
    useState("");


  const [city, setCity] =
    useState("");


  const [pincode, setPincode] =
    useState("");


  const [phone, setPhone] = useState(() => {

    try {

      const stored =
        localStorage.getItem("user");

      return stored
        ? JSON.parse(stored)?.phone || ""
        : "";

    } catch {

      return "";

    }

  });


  const [paymentMethod, setPaymentMethod] =
    useState("");


  const [submitting, setSubmitting] =
    useState(false);


  // ==========================================
  // CALCULATE TOTAL PRICE
  // ==========================================

  const totalPrice = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) *
      item.quantity,
    0
  );


  // ==========================================
  // PLACE ORDER
  // ==========================================

  const handleOrder = async (e) => {

    e.preventDefault();


    // ------------------------------------------
    // CHECK CART
    // ------------------------------------------

    if (cart.length === 0) {

      alert(
        "Your cart is empty."
      );

      return;

    }


    // ------------------------------------------
    // CHECK PAYMENT METHOD
    // ------------------------------------------

    if (!paymentMethod) {

      alert(
        "Please select a payment method."
      );

      return;

    }


    setSubmitting(true);


    try {

      // ========================================
      // 1. CREATE ORDER ITEMS
      // ========================================

      const orderItems = cart.map(
        (item) => ({

          product:
            item.id,

          quantity:
            item.quantity,

          price:
            item.price,

        })
      );


      console.log(
        "Order Items:",
        orderItems
      );


      // ========================================
      // 2. CREATE ORDER
      // ========================================

      const orderResponse =
        await api.post(
          "orders/",
          {

            total_price:
              totalPrice,

            status:
              "pending",

            items:
              orderItems,

          }
        );


      console.log(
        "Order Created:",
        orderResponse.data
      );


      const orderId =
        orderResponse.data.id;


      console.log(
        "Order ID:",
        orderId
      );


      // ========================================
      // 3. CREATE PAYMENT
      // ========================================

      const paymentResponse =
        await api.post(
          "payments/",
          {

            order:
              orderId,

            payment_method:
              paymentMethod,

            transaction_id:
              "",

            amount:
              totalPrice,

            status:
              "pending",

          }
        );


      console.log(
        "Payment Created:",
        paymentResponse.data
      );


      // ========================================
      // 4. CUSTOMER DETAILS
      // ========================================

      console.log(
        "Customer Details:",
        {
          name,
          phone,
          address,
          city,
          pincode,
        }
      );


      console.log(
        "Payment Method:",
        paymentMethod
      );


      console.log(
        "Total Amount:",
        totalPrice
      );


      // ========================================
      // 5. CLEAR CART
      // ========================================
      //
      // IMPORTANT:
      // Wait for the Django cart to be cleared.
      //
      // This prevents the same old products
      // from being included in the next order.
      // ========================================

      await clearCart();


      console.log(
        "Cart cleared successfully."
      );


      // ========================================
      // 6. SUCCESS MESSAGE
      // ========================================

      alert(
        "Your order has been placed successfully!"
      );


      // ========================================
      // 7. GO TO MY ORDERS
      // ========================================

      navigate(
        "/my-orders"
      );


    } catch (error) {

      console.log(
        "CHECKOUT ERROR:",
        error
      );


      console.log(
        "STATUS:",
        error.response?.status
      );


      console.log(
        "DATA:",
        error.response?.data
      );


      // ========================================
      // LOGIN ERROR
      // ========================================

      if (
        error.response?.status === 401
      ) {

        alert(
          "Please login before placing an order."
        );

        navigate(
          "/login"
        );

        return;

      }


      // ========================================
      // OTHER ERROR
      // ========================================

      let errorMsg =
        "Unable to place order.";


      if (
        error.response?.data
      ) {

        const data =
          error.response.data;


        if (
          typeof data === "string"
        ) {

          errorMsg =
            data;

        }

        else if (
          data.detail
        ) {

          errorMsg =
            data.detail;

        }

        else if (
          data.items
        ) {

          errorMsg =
            "Error in order items: " +
            JSON.stringify(
              data.items
            );

        }

        else {

          errorMsg =
            Object.entries(data)
              .map(
                ([key, value]) =>
                  `${key}: ${
                    Array.isArray(value)
                      ? value.join(", ")
                      : value
                  }`
              )
              .join("\n");

        }

      }


      alert(
        errorMsg
      );


    } finally {

      setSubmitting(false);

    }

  };


  // ==========================================
  // UI
  // ==========================================

  return (

    <>

      <Navbar />


      <div className="checkout-page">


        <h1 className="checkout-title">
          Checkout
        </h1>


        <div className="checkout-container">


          {/* ==================================
              DELIVERY FORM
          ================================== */}

          <div className="checkout-form">

            <h2>
              Delivery Details
            </h2>


            <form
              onSubmit={
                handleOrder
              }
            >


              {/* FULL NAME */}

              <div className="checkout-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  required
                />

              </div>


              {/* PHONE */}

              <div className="checkout-group">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  required
                />

              </div>


              {/* ADDRESS */}

              <div className="checkout-group">

                <div className="d-flex justify-content-between align-items-center">

                  <label>
                    Address
                  </label>

                  <small className="text-muted">
                    {
                      address.length
                    }
                    /250
                  </small>

                </div>


                <textarea
                  placeholder="Enter your complete address"
                  value={address}
                  maxLength={250}
                  onChange={(e) =>
                    setAddress(
                      e.target.value
                    )
                  }
                  required
                ></textarea>

              </div>


              {/* CITY */}

              <div className="checkout-group">

                <label>
                  City
                </label>

                <input
                  type="text"
                  placeholder="Enter your city"
                  value={city}
                  onChange={(e) =>
                    setCity(
                      e.target.value
                    )
                  }
                  required
                />

              </div>


              {/* PINCODE */}

              <div className="checkout-group">

                <label>
                  Pincode
                </label>

                <input
                  type="text"
                  placeholder="Enter your pincode"
                  value={pincode}
                  onChange={(e) =>
                    setPincode(
                      e.target.value
                    )
                  }
                  required
                />

              </div>


              {/* PAYMENT METHOD */}

              <div className="checkout-group">

                <label>
                  Payment Method
                </label>

                <select
                  value={
                    paymentMethod
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  required
                >

                  <option value="">
                    Select Payment Method
                  </option>

                  <option value="upi">
                    UPI (Google Pay, PhonePe, Paytm)
                  </option>

                  <option value="card">
                    Credit / Debit Card
                  </option>

                  <option value="cod">
                    Cash on Delivery
                  </option>

                </select>

              </div>


              {/* PLACE ORDER BUTTON */}

              <button
                type="submit"
                className="place-order-button"
                disabled={
                  submitting ||
                  cart.length === 0
                }
              >

                {submitting
                  ? "Placing Order..."
                  : "Place Order"}

              </button>


            </form>

          </div>


          {/* ==================================
              ORDER SUMMARY
          ================================== */}

          <div className="checkout-summary">

            <h2>
              Order Summary
            </h2>


            {cart.length === 0 ? (

              <p>
                Your cart is empty.
              </p>

            ) : (

              cart.map(
                (item) => (

                  <div
                    className="checkout-product"
                    key={
                      item.id
                    }
                  >

                    <span>
                      {item.name} ×{" "}
                      {item.quantity}
                    </span>

                    <span>
                      ₹
                      {
                        Number(
                          item.price
                        ) *
                        item.quantity
                      }
                    </span>

                  </div>

                )
              )

            )}


            <hr />


            {/* SUBTOTAL */}

            <div className="checkout-row">

              <span>
                Subtotal
              </span>

              <span>
                ₹
                {totalPrice}
              </span>

            </div>


            {/* DELIVERY */}

            <div className="checkout-row">

              <span>
                Delivery
              </span>

              <span>
                FREE
              </span>

            </div>


            {/* TOTAL */}

            <div className="checkout-total">

              <span>
                Total
              </span>

              <span>
                ₹
                {totalPrice}
              </span>

            </div>


            {/* BACK TO CART */}

            <Link
              to="/cart"
              className="back-cart"
            >
              ← Back to Cart
            </Link>


          </div>

        </div>

      </div>


      <FooterSection />

    </>
  );
}


export default Checkout;