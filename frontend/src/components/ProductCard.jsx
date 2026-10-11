import { Link } from "react-router-dom";

function ProductCard({ product }) {

  const addToWishlist = async () => {

    const token = localStorage.getItem("access_token");

    // Check if user is logged in
    if (!token) {
      alert("Please login first to add products to wishlist.");
      return;
    }

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/wishlist/",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            product: product.id,
          }),
        }
      );

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

      alert("Cannot connect to wishlist API.");

    }
  };


  return (
    <div className="card h-100 shadow-sm border-0">

      {/* Product Image */}

      <Link to={`/products/${product.id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="card-img-top"
          style={{
            height: "250px",
            objectFit: "cover",
            cursor: "pointer",
          }}
        />
      </Link>


      <div className="card-body">

        {/* Product Name */}

        <h6 className="fw-bold">
          {product.name}
        </h6>


        {/* Category */}

        <p className="text-muted mb-1">
          {product.category_name}
        </p>


        {/* Price */}

        <h5 className="text-success">
          ₹{product.price}
        </h5>


        


        {/* View Product */}

        <Link
          to={`/products/${product.id}`}
          className="btn btn-primary w-100 mb-2"
        >
          View Product
        </Link>


        {/* Wishlist */}

        <button
          className="btn btn-outline-danger w-100"
          onClick={addToWishlist}
        >
          ❤️Add to Wishlist
        </button>

      </div>

    </div>
  );
}

export default ProductCard;