import { useEffect, useState, useContext } from "react";

import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

import { CartContext } from "./CartContext";
import FooterSection from "../components/FooterSection";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  // Get selected product
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/products/${id}/`)
      .then((response) => response.json())

      .then((data) => {
        console.log("Product Details:", data);

        setProduct(data);
      })

      .catch((error) => {
        console.log("Product error:", error);
      });
  }, [id]);

  // Get all products for recommendations
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products/")
      .then((response) => response.json())

      .then((data) => {
        setProducts(data);
      })

      .catch((error) => {
        console.log("Products error:", error);
      });
  }, []);

  // Loading
  if (!product) {
    return (
      <>
        <Navbar />

        <div className="container mt-5">
          <p>Loading product...</p>
        </div>
      </>
    );
  }

  // Add to cart
  const handleAddToCart = () => {
    const token = localStorage.getItem("access_token");

    // User is not logged in
    if (!token) {
      alert("Please login first to add this product to cart.");
      navigate("/login");
      return;
    }

    // User is logged in
    addToCart(product, 1);

    alert(`${product.name} added to cart!`);
  };

  // Buy now
  const handleBuyNow = () => {
    const token = localStorage.getItem("access_token");

    // User is not logged in
    if (!token) {
      alert("Please login first to buy this product.");
      navigate("/login");
      return;
    }

    // User is logged in
    addToCart(product, 1);

    navigate("/checkout");
  };

  // Add to wishlist
  const handleAddToWishlist = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first to add products to wishlist.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/wishlist/", {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          product: product.id,
        }),
      });

      const data = await response.json();

      console.log("Wishlist response:", data);

      if (response.ok) {
        alert(`${product.name} added to wishlist ❤️`);
      } else {
        console.log("Wishlist error:", data);

        if (data.non_field_errors) {
          alert("This product is already in your wishlist ❤️");
        } else {
          alert("Could not add product to wishlist.");
        }
      }
    } catch (error) {
      console.log("Wishlist error:", error);

      alert("Cannot connect to wishlist.");
    }
  };

  // Recommended products
  const recommendedProducts = products

    .filter(
      (item) =>
        item.id !== product.id &&
        (item.category === product.category ||
          (item.category_name &&
            product.category_name &&
            item.category_name.toLowerCase() ===
              product.category_name.toLowerCase())),
    )

    .slice(0, 4);

  return (
    <>
      <Navbar />

      {/* Popup */}

      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "#198754",
            color: "white",
            padding: "15px 25px",
            borderRadius: "8px",
            zIndex: 9999,
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          Product added to cart!
        </div>
      )}

      <div className="container mt-5">
        {/* Product Details */}

        <div className="row">
          {/* Big Image */}

          <div className="col-md-6 text-center">
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "500px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>

          {/* Product Information */}

          <div className="col-md-6">
            <h1 className="fw-bold">{product.name}</h1>

            <p className="text-muted">{product.category_name}</p>

            <h2 className="text-success">₹{product.price}</h2>

            <p className="mt-4">{product.description}</p>

            <p>
              <strong>Stock:</strong> {product.stock}
            </p>

            {/* Add to Cart */}

            <button
              className="btn btn-primary btn-lg me-2"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>

            {/* Buy Now */}

            <button
              className="btn btn-success btn-lg me-2"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>

            {/* Add to Wishlist */}

            <button
              className="btn btn-outline-danger btn-lg"
              onClick={handleAddToWishlist}
            >
              ❤️ Add to Wishlist
            </button>
          </div>
        </div>

        {/* Recommended Products */}

        <div className="mt-5">
          <h2 className="mb-4">Recommended Products</h2>

          <div className="row">
            {recommendedProducts.length > 0 ? (
              recommendedProducts.map((item) => (
                <div className="col-md-3 mb-4" key={item.id}>
                  <ProductCard product={item} />
                </div>
              ))
            ) : (
              <p>No recommended products available.</p>
            )}
          </div>
        </div>
      </div>

      <FooterSection />
    </>
  );
}

export default ProductDetails;
