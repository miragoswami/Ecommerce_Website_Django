import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Login.css";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Remove old authentication data
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    const response = await api.post("login/", {
      email: email,
      password: password,
    });

    console.log("LOGIN RESPONSE:", response.data);
    console.log("ACCESS TOKEN:", response.data.access);
    console.log("REFRESH TOKEN:", response.data.refresh);

    localStorage.setItem(
      "access_token",
      response.data.access
    );

    localStorage.setItem(
      "refresh_token",
      response.data.refresh
    );

    if (response.data.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );
    }

    alert("Login Successful");

    navigate("/");
  } catch (error) {
    console.log("ERROR:", error);
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);

    const message =
      error.response?.data?.non_field_errors?.[0] ||
      error.response?.data?.detail ||
      (error.message === "Network Error"
        ? "Cannot connect to backend server. Make sure the backend server is running."
        : "Invalid email or password");

    alert(message);
  }
};

  return (
    <div className="login-overlay">

      <div className="login-card">

        {/* Close Button */}

        <button
          className="login-close"
          onClick={() => navigate("/")}
        >
          ×
        </button>


        <h2 className="login-title">
          Login 
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="login-field">

            <label className="login-label">
              Email
            </label>

            <input
              type="email"
              className="login-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>


          <div className="login-field">

            <label className="login-label">
              Password
            </label>

            <input
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>


          <button
            type="submit"
            className="login-button"
          >
            Login
          </button>

        </form>


        <p className="login-register">
          Don't have an account?{" "}

          <Link to="/register">
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;