
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/BecomeSeller.css";

function BecomeSeller() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    business_name: "",
    store_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle form inputs
  function handleChange(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  // Submit seller registration form
  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/become-seller/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      console.log("Become Seller Response:", data);

      if (response.ok) {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const user = JSON.parse(storedUser);

          user.user_type = data.user_type || "seller";

          localStorage.setItem("user", JSON.stringify(user));

          console.log("Updated User:", user);
        }

        // Notify Navbar that user data has changed
        window.dispatchEvent(new Event("userUpdated"));

        alert("You are now a seller!");

        navigate("/seller/dashboard");
      } else {
        console.log("Become Seller Error:", data);

        alert(
          data.detail ||
            data.message ||
            "Failed to become a seller."
        );
      }
    } catch (error) {
      console.log("Become Seller Error:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bs-page">
      <div className="bs-background-shape bs-shape-one" />
      <div className="bs-background-shape bs-shape-two" />

      <div className="bs-wrapper">
        {/* Introduction panel */}
        <aside className="bs-intro">
          <div className="bs-brand">
            <span className="bs-brand-icon">T</span>
            <span>Trend Cart</span>
          </div>

          <span className="bs-intro-label">SELLER PARTNER PROGRAM</span>

          <h1>
            Turn your passion
            <br />
            into a <span>business.</span>
          </h1>

          <p className="bs-intro-description">
            Bring your products to Trend Cart and connect with customers
            looking for their next favorite find.
          </p>

          <div className="bs-benefits">
            <div className="bs-benefit">
              <span className="bs-benefit-icon">✓</span>
              <div>
                <h3>Your own store</h3>
                <p>Build your unique store identity.</p>
              </div>
            </div>

            <div className="bs-benefit">
              <span className="bs-benefit-icon">↗</span>
              <div>
                <h3>Grow your business</h3>
                <p>Manage products and customer orders.</p>
              </div>
            </div>

            <div className="bs-benefit">
              <span className="bs-benefit-icon">◇</span>
              <div>
                <h3>One simple dashboard</h3>
                <p>Keep your selling activities organized.</p>
              </div>
            </div>
          </div>

          <div className="bs-intro-footer">
            Your business journey starts here.
          </div>
        </aside>

        {/* Seller registration form */}
        <section className="bs-form-panel">
          <div className="bs-form-heading">
            <span className="bs-step-label">LET'S GET STARTED</span>
            <h2>Become a Seller</h2>
            <p>
              Enter your store details to start selling on Trend Cart.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bs-form-section-title">
              <span className="bs-section-number">01</span>
              <div>
                <h3>Business Information</h3>
                <p>Tell us about your business and store.</p>
              </div>
            </div>

            <div className="bs-field-grid">
              <div className="bs-field">
                <label htmlFor="business_name">Business Name *</label>
                <input
                  id="business_name"
                  type="text"
                  name="business_name"
                  placeholder="Enter your business name"
                  className="bs-input"
                  value={form.business_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="bs-field">
                <label htmlFor="store_name">Store Name *</label>
                <input
                  id="store_name"
                  type="text"
                  name="store_name"
                  placeholder="Choose a name for your store"
                  className="bs-input"
                  value={form.store_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="bs-field bs-full-width">
                <label htmlFor="phone">Phone Number *</label>
                <div className="bs-input-with-icon">
                  <span className="bs-input-icon">☎</span>
                  <input
                    id="phone"
                    type="text"
                    name="phone"
                    placeholder="Enter your contact number"
                    className="bs-input"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bs-form-divider" />

            <div className="bs-form-section-title">
              <span className="bs-section-number">02</span>
              <div>
                <h3>Store Location</h3>
                <p>Where is your business located?</p>
              </div>
            </div>

            <div className="bs-field-grid">
              <div className="bs-field bs-full-width">
                <label htmlFor="address">Full Address *</label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="Enter your shop or business address"
                  className="bs-input bs-textarea"
                  value={form.address}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>

              <div className="bs-field">
                <label htmlFor="city">City *</label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  className="bs-input"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="bs-field">
                <label htmlFor="state">State *</label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  placeholder="Enter state"
                  className="bs-input"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="bs-field">
                <label htmlFor="pincode">Pincode *</label>
                <input
                  id="pincode"
                  type="text"
                  name="pincode"
                  placeholder="Postal code"
                  className="bs-input"
                  value={form.pincode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="bs-form-divider" />

            <div className="bs-form-section-title">
              <span className="bs-section-number">03</span>
              <div>
                <h3>About Your Store</h3>
                <p>Give customers an idea of what you sell.</p>
              </div>
            </div>

            <div className="bs-field">
              <label htmlFor="description">
                Store Description <span className="bs-optional">(Optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your products, style, or business..."
                className="bs-input bs-textarea bs-description"
                value={form.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="bs-form-actions">
              <button
                type="submit"
                className="bs-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="bs-button-spinner" />
                    Creating your store...
                  </>
                ) : (
                  <>
                    Become a Seller
                    <span className="bs-button-arrow">→</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="bs-cancel-btn"
                onClick={() => navigate("/")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>

            <p className="bs-form-note">
              Please ensure your business details are accurate before
              submitting.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}

export default BecomeSeller;
