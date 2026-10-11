import { useContext } from "react";
import { Link } from "react-router-dom";
import "../css/Cart.css";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";
import { CartContext } from "./CartContext";
import emptyCartImg from "../assets/emptyCart.png";

function Cart() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } =
    useContext(CartContext);

  const totalPrice = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const totalCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <Navbar />

      <div className="cart-page">
        <h1 className="cart-title">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <img
              src={emptyCartImg}
              alt="Empty Cart"
              className="empty-cart-image"
            />
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="shop-button">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-container">
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-image"
                  />

                  <div className="cart-details">
                    <h3>{item.name}</h3>
                    <p className="cart-price">₹{item.price}</p>

                    <div className="quantity-box">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.id)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.id)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="item-total">
                    ₹{Number(item.price) * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal ({totalCount} items)</span>
                <span>₹{totalPrice}</span>
              </div>

              <div className="summary-row">
                <span>Delivery</span>
                <span>FREE</span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>

              <Link to="/checkout" className="checkout-button">
                Proceed to Checkout
              </Link>

              <Link to="/products" className="continue-shopping">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      <FooterSection />
    </>
  );
}

export default Cart;
