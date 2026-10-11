import { Link, useNavigate, useLocation } from "react-router-dom";

import { useEffect, useState, useContext } from "react";

import "../css/Navbar.css";

import { CartContext } from "../pages/CartContext";

function Navbar() {
  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState([]);

  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("access_token");

      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        return JSON.parse(storedUser);
      }

      return null;
    } catch {
      return null;
    }
  });

  const { cartCount } = useContext(CartContext) || {
    cartCount: 0,
  };

  const navigate = useNavigate();

  const location = useLocation();

  // --------------------------------
  // LOAD USER FROM LOCAL STORAGE
  // --------------------------------

  function loadUser() {
    try {
      const token = localStorage.getItem("access_token");

      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        const currentUser = JSON.parse(storedUser);

        console.log("Navbar user:", currentUser);

        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }

  // --------------------------------
  // UPDATE USER WHEN PAGE CHANGES
  // --------------------------------

  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  // --------------------------------
  // LISTEN FOR USER UPDATE EVENT
  // --------------------------------

  useEffect(() => {
    window.addEventListener("userUpdated", loadUser);

    return () => {
      window.removeEventListener("userUpdated", loadUser);
    };
  }, []);

  // --------------------------------
  // LOGOUT
  // --------------------------------
  const handleLogout = () => {
    // Remove login data
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    // Clear React user state
    setUser(null);

    // Show logout message
    alert("Successfully logged out!");

  };

  // --------------------------------
  // GET CATEGORIES
  // --------------------------------

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/categories/")
      .then((response) => response.json())

      .then((data) => {
        console.log("Categories:", data);

        setCategories(data);
      })

      .catch((error) => {
        console.log("Category error:", error);
      });
  }, []);

  // --------------------------------
  // SEARCH
  // --------------------------------

  function handleSearch(e) {
    e.preventDefault();

    if (search.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <>

      <nav className="navbar navbar-expand-lg bg-white border-bottom py-3 w-100">
        <div className="container-fluid px-5">
          {/* LOGO */}

          <Link
            className="navbar-brand fw-bold fs-1"
            to="/"
            style={{
              color: "#5a1763",
            }}
          >
            Trend Cart
          </Link>

          {/* SEARCH */}

          <form className="tc-search" onSubmit={handleSearch}>  <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search"></i>
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Try Saree, Kurti or Search Product"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          {/* =========================
              RIGHT MENU
          ========================= */}

          <div className="d-flex align-items-center gap-4">
            {/* LOGIN / LOGOUT */}

            {user ? (
              <button
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm"
                title={`Logged in as ${user.username || "User"}`}
              >
                Logout ({user.username || "User"})
              </button>
            ) : (
              <Link
                className="text-dark text-decoration-none fw-semibold"
                to="/login"
              >
                Login
              </Link>
            )}

            {/* =========================
                BECOME SELLER / DASHBOARD
            ========================= */}

            {!user ? (
              <Link
                className="text-dark text-decoration-none fw-semibold"
                to="/login"
              >
                Become a Seller
              </Link>
            ) : user.user_type === "seller" ? (
              <Link
                className="text-dark text-decoration-none fw-semibold"
                to="/seller/dashboard"
              >
                Seller Dashboard
              </Link>
            ) : (
              <Link
                className="text-dark text-decoration-none fw-semibold"
                to="/become-seller"
              >
                Become a Seller
              </Link>
            )}

            {/* PROFILE */}

            <Link
              className="text-dark text-decoration-none text-center"
              to="/profile"
            >
              <i className="bi bi-person fs-4 d-block"></i>
              Profile
            </Link>

            {/* WISHLIST */}

            <Link
              className="text-dark text-decoration-none text-center"
              to="/wishlist"
            >
              <i className="bi bi-heart fs-4 d-block"></i>
              Wishlist
            </Link>

            {/* MY ORDERS */}

            {user && (
              <Link
                className="text-dark text-decoration-none text-center"
                to="/my-orders"
              >
                <i className="bi bi-box-seam fs-4 d-block"></i>
                My Orders
              </Link>
            )}

            {/* CART */}

            <Link
              className="text-dark text-decoration-none text-center position-relative"
              to="/cart"
            >
              <i className="bi bi-cart3 fs-4 d-block"></i>
              {cartCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{
                    fontSize: "0.7rem",
                  }}
                >
                  {cartCount}
                </span>
              )}
              Cart
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================
          CATEGORY NAVBAR
      ========================= */}

      <div className="category-navbar border-top border-bottom bg-white">
        <div className="category-scroll">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="category-link"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default Navbar;
