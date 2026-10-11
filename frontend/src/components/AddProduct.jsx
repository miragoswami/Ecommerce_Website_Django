
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AddProduct.css";
import FooterSection from "./FooterSection";
const API_URL = "http://127.0.0.1:8000/api";
import Navbar from "./Navbar";
function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Fetch categories from Django
  useEffect(() => {
    let isMounted = true;

    async function fetchCategories() {
      try {
        const response = await fetch(`${API_URL}/categories/`);

        if (!response.ok) {
          throw new Error("Unable to load categories.");
        }

        const data = await response.json();

        if (isMounted) {
          setCategories(
            Array.isArray(data) ? data : data.results || []
          );
        }
      } catch (error) {
        console.error("Category error:", error);

        if (isMounted) {
          setMessage(
            "Could not load categories. Please check your backend."
          );
          setMessageType("error");
        }
      } finally {
        if (isMounted) {
          setCategoryLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Preview selected product image
  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      setMessageType("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage("");
    setMessageType("");
  }

  // Submit product to Django
  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    if (!category) {
      setMessage("Please select a product category.");
      setMessageType("error");
      return;
    }

    if (!image) {
      setMessage("Please upload a product image.");
      setMessageType("error");
      return;
    }

    if (Number(price) <= 0 || Number(stock) < 0) {
      setMessage("Enter a valid price and stock quantity.");
      setMessageType("error");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("category", category);
    formData.append("image", image);

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/products/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          setMessage("Your session has expired. Please log in again.");
        } else if (response.status === 403) {
          setMessage("You do not have permission to add products.");
        } else {
          const errors = Object.entries(data)
            .map(([key, value]) => {
              const detail = Array.isArray(value)
                ? value.join(", ")
                : typeof value === "string"
                  ? value
                  : JSON.stringify(value);

              return `${key}: ${detail}`;
            })
            .join(" | ");

          setMessage(errors || "Unable to add product.");
        }

        setMessageType("error");
        return;
      }

      setMessage("Product added successfully!");
      setMessageType("success");

      // Give the seller a moment to see the success message.
      setTimeout(() => {
        navigate("/seller/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Add product error:", error);
      setMessage(
        "Cannot connect to the server. Please check your Django backend."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <Navbar />
    <div className="add-product-page">
      <div className="add-product-container">
        <div className="add-product-heading">
          

          <div className="heading-content">
            <div>
              <span className="heading-eyebrow">
                TREND CART SELLER PANEL
              </span>
              <h1>Add New Product</h1>
              <p>
                Bring your products to life and make them available
                to Trend Cart customers.
              </p>
            </div>

          </div>
        </div>

        {/* Product form */}
        <form onSubmit={handleSubmit} className="add-product-form">
          {message && (
            <div
              className={`form-message ${messageType}`}
              role="alert"
            >
              <span>
                {messageType === "success" ? "✓" : "!"}
              </span>
              {message}
            </div>
          )}

          <div className="product-form-grid">
            {/* Left column */}
            <div className="product-form-main">
              <section className="product-form-card">
                <div className="section-heading">
                  <div className="section-icon">01</div>
                  <div>
                    <h2>Product Information</h2>
                    <p>Tell customers about your product.</p>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="product-name">
                    Product Name <span>*</span>
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elegant Pink Kurti"
                    maxLength={200}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="product-description">
                    Product Description <span>*</span>
                  </label>
                  <textarea
                    id="product-description"
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the material, style, features, size, and other product details..."
                    required
                  />
                  <div className="field-helper">
                    Write a clear description to help customers.
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="product-category">
                    Product Category <span>*</span>
                  </label>
                  <select
                    id="product-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    disabled={categoryLoading}
                  >
                    <option value="">
                      {categoryLoading
                        ? "Loading categories..."
                        : "Choose a category"}
                    </option>

                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>

                  {!categoryLoading && categories.length === 0 && (
                    <div className="field-helper">
                      No categories found. Check your Django categories API.
                    </div>
                  )}
                </div>
              </section>

              <section className="product-form-card">
                <div className="section-heading">
                  <div className="section-icon">02</div>
                  <div>
                    <h2>Pricing & Inventory</h2>
                    <p>Set your selling price and available stock.</p>
                  </div>
                </div>

                <div className="pricing-grid">
                  <div className="form-field">
                    <label htmlFor="product-price">
                      Selling Price (₹) <span>*</span>
                    </label>
                    <div className="price-input">
                      <span>₹</span>
                      <input
                        id="product-price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="599.00"
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="product-stock">
                      Stock Quantity <span>*</span>
                    </label>
                    <input
                      id="product-stock"
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="e.g. 25"
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                </div>

                <div className="inventory-note">
                  <span>ⓘ</span>
                  Keep your stock quantity updated to manage product
                  availability.
                </div>
              </section>
            </div>

            {/* Right column */}
            <aside className="product-form-sidebar">
              <section className="product-form-card image-card">
                <div className="section-heading">
                  <div className="section-icon">03</div>
                  <div>
                    <h2>Product Image</h2>
                    <p>Show your product to customers.</p>
                  </div>
                </div>

                <label
                  htmlFor="product-image"
                  className={`image-upload-area ${
                    imagePreview ? "has-image" : ""
                  }`}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Selected product preview"
                      className="product-image-preview"
                    />
                  ) : (
                    <div className="upload-placeholder">
                      <div className="upload-icon">↑</div>
                      <strong>Upload product image</strong>
                      <span>Click here to browse files</span>
                      <small>JPG, PNG, WEBP · Max 5 MB</small>
                    </div>
                  )}
                </label>

                <input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="visually-hidden-input"
                  onChange={handleImageChange}
                  required
                />

                {image && (
                  <div className="selected-image-info">
                    <span className="image-check">✓</span>
                    <div>
                      <strong>{image.name}</strong>
                      <small>
                        {(image.size / (1024 * 1024)).toFixed(2)} MB
                      </small>
                    </div>
                    <button
                      type="button"
                      className="remove-image"
                      aria-label="Remove selected image"
                      onClick={() => {
                        setImage(null);
                        setImagePreview("");
                        const input = document.getElementById(
                          "product-image"
                        );
                        if (input) input.value = "";
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="image-tip">
                  <span>✦</span>
                  <p>
                    <strong>Styling tip</strong>
                    Use a clear, well-lit product photo with a
                    simple background.
                  </p>
                </div>
              </section>

              <section className="seller-tip-card">
                <div className="seller-tip-icon">♡</div>
                <h3>Make it stand out!</h3>
                <p>
                  Add a descriptive title, accurate pricing, and
                  a great photo to help customers discover your product.
                </p>
              </section>
            </aside>
          </div>

          {/* Form actions */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-product-button"
              onClick={() => navigate("/seller/dashboard")}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-product-button"
              disabled={loading || categoryLoading}
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Adding Product...
                </>
              ) : (
                <>＋ Add Product</>
              )}
            </button>
          </div>
        </form>
         </div>
      
    </div>
    
      <FooterSection />
    </>
  );
}

export default AddProduct;