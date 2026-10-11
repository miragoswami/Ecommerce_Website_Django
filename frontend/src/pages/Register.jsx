import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Register.css";
import api from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert("Please enter a valid email address (e.g., user@example.com).");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Create username from name or email
      const username = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .slice(0, 30);

      const response = await api.post("register/", {
        username: username,
        email: email.trim(),
        phone: phone.trim(),
        password: password,
      });

      console.log("Registration successful:", response.data);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.log("REGISTER ERROR:", error);
      console.log("BACKEND ERROR:", error.response?.data);

      let errorMsg = "Registration failed. Please check your information.";
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === "string") {
          errorMsg = data;
        } else if (data.username) {
          errorMsg = Array.isArray(data.username) ? data.username[0] : data.username;
        } else if (data.email) {
          errorMsg = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.password) {
          errorMsg = Array.isArray(data.password) ? data.password[0] : data.password;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else {
          errorMsg = Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("\n");
        }
      } else if (error.message === "Network Error") {
        errorMsg = "Cannot connect to backend server. Make sure backend is running.";
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-overlay">
      <div className="register-card">
        {/* Close Button */}
        <button className="register-close" onClick={() => navigate("/")}>
          ×
        </button>

        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">Join Trend Cart and start shopping</p>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="register-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="register-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div className="register-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="register-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="register-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Login */}
        <p className="register-login">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;