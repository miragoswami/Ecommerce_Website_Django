import { BrowserRouter, Routes, Route } from "react-router-dom";

import CartProvider from "./pages/CartContext";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile"
import SellerDashboard from "./pages/SellerDashboard";
import AddProduct from "./components/AddProduct";
import BecomeSeller from "./pages/BecomeSeller";
import EditProduct from "./components/EditProduct";
import MyOrders from "./pages/MyOrders";

function App() {
  return (
    <BrowserRouter>

      <CartProvider>

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          {/* Login appears over Home */}
          <Route
            path="/login"
            element={
              <>
                <Home />
                <Login />
              </>
            }
          />

          {/* Register page appear over Home */}
          <Route
            path="/register"
            element={
              <>
                <Home />
                <Register />
              </>
            }
          />


          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/wishlist"
            element={<Wishlist />}
          />

          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />
          <Route path="/profile" element={<Profile />} />

          <Route
            path="/become-seller"
            element={<BecomeSeller />}
          />

          <Route
            path="/seller/dashboard"
            element={<SellerDashboard />}
          />

          <Route
            path="/seller/add-product"
            element={<AddProduct />}
          />
          <Route
            path="/seller/edit-product/:id"
            element={<EditProduct />}
          />
          <Route
  path="/my-orders"
  element={<MyOrders />}
/>



        </Routes>

      </CartProvider>

    </BrowserRouter>
  );
}

export default App;