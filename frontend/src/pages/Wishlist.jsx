import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import "../css/Wishlist.css";
import Navbar from "../components/Navbar";
import FooterSection from "../components/FooterSection";

import { CartContext } from "./CartContext";


function Wishlist() {

  const { addToCart } = useContext(CartContext);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);


  // Get wishlist from Django
  useEffect(() => {

    const fetchWishlist = async () => {

      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {

        const response = await fetch(
          "http://127.0.0.1:8000/api/wishlist/",
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        console.log("Wishlist from Django:", data);

        if (response.ok) {
          setWishlistItems(data);
        } else {
          console.log("Wishlist Error:", data);
        }

      } catch (error) {

        console.log("Error fetching wishlist:", error);

      } finally {

        setLoading(false);

      }
    };


    fetchWishlist();

  }, []);


  // Remove wishlist item
  async function removeFromWishlist(wishlistId) {

    const token = localStorage.getItem("access_token");

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/api/wishlist/${wishlistId}/`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {

        setWishlistItems(
          wishlistItems.filter(
            (item) => item.id !== wishlistId
          )
        );

        alert("Removed from wishlist");

      } else {

        const data = await response.json();

        console.log("Remove Error:", data);

      }

    } catch (error) {

      console.log("Error removing wishlist:", error);

    }
  }


  // Loading screen
  if (loading) {

    return (
      <>
        <Navbar />

        <div className="wishlist-page">
          <h2>Loading Wishlist...</h2>
        </div>

        <FooterSection />
      </>
    );

  }


  return (
    <>

      <Navbar />

      <div className="wishlist-page">

        <h1 className="wishlist-title">
          My Wishlist ❤️
        </h1>


        {wishlistItems.length === 0 ? (

          <div className="empty-wishlist">

            <h2>Your Wishlist is Empty</h2>

            <p>
              Save your favorite products here.
            </p>

            <Link
              to="/products"
              className="wishlist-shop-button"
            >
              Explore Products
            </Link>

          </div>

        ) : (

          <div className="wishlist-container">

            {wishlistItems.map((item) => (

              <div
                className="wishlist-card"
                key={item.id}
              >

                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="wishlist-image"
                />


                <div className="wishlist-details">

                  <h3>
                    {item.product_name}
                  </h3>


                  <h4>
                    ₹{item.product_price}
                  </h4>


                  <div className="wishlist-buttons">


                    {/* Add to Cart */}

                    <button
                      className="btn btn-sm btn-primary"

                      onClick={() => {

                        addToCart({
                          id: item.product,
                          name: item.product_name,
                          price: item.product_price,
                          image: item.product_image,
                        });

                        alert(
                          `${item.product_name} added to cart!`
                        );

                      }}

                    >
                      Add to Cart
                    </button>


                    {/* View Product */}

                    <Link
                      to={`/products/${item.product}`}
                      className="view-product-button"
                    >
                      View
                    </Link>


                    {/* Remove */}

                    <button
                      className="remove-wishlist-button"

                      onClick={() =>
                        removeFromWishlist(item.id)
                      }

                    >
                      Remove
                    </button>


                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      <FooterSection />

    </>
  );
}


export default Wishlist;