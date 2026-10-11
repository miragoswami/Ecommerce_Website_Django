import { useEffect, useState } from "react";
import "../css/Profile.css";

import FooterSection from "../components/FooterSection";
import Navbar from "../components/Navbar";

import api from "../services/api";

function Profile() {
  const [user, setUser] = useState(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // GET PROFILE

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError("");

        const response = await api.get("profile/");

        console.log("PROFILE STATUS:", response.status);
        console.log("PROFILE DATA:", response.data);

        setUser(response.data);

        setUsername(response.data.username);
        setEmail(response.data.email);
      } catch (error) {
        console.log("PROFILE ERROR:", error);

        // If user is not logged in
        if (error.response?.status === 401) {
          setError("Your session has expired. Please login again.");
        } else {
          setError(error.response?.data?.detail || "Unable to load profile.");
        }
      }
    };

    loadProfile();
  }, []);

  // SAVE PROFILE

  const handleSave = async () => {
    setError("");
    setMessage("");

    try {
      const response = await api.patch("profile/", {
        username: username,
        email: email,
      });

      console.log("UPDATE STATUS:", response.status);

      console.log("UPDATE DATA:", response.data);

      // Update profile on screen

      setUser(response.data);

      // Update localStorage user

      localStorage.setItem("user", JSON.stringify(response.data));

      setUsername(response.data.username);
      setEmail(response.data.email);

      setEditing(false);

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.log("UPDATE ERROR:", error);

      // Username validation error

      if (error.response?.data?.username) {
        setError(error.response.data.username[0]);

        return;
      }

      // Email validation error

      if (error.response?.data?.email) {
        setError(error.response.data.email[0]);

        return;
      }

      setError(error.response?.data?.detail || "Unable to update profile.");
    }
  };

  // ERROR SCREEN

  if (error && !user) {
    return (
      <>
        <Navbar />

        <h2 className="profile-loading">{error}</h2>

        <FooterSection />
      </>
    );
  }

  // LOADING

  if (!user) {
    return (
      <>
        <Navbar />

        <h2 className="profile-loading">Loading...</h2>

        <FooterSection />
      </>
    );
  }

  // PROFILE UI

  return (
    <>
      <Navbar />

      <div className="profile-container">
        <div className="profile-card">
          {/* TITLE */}

          <h1 className="profile-title">My Profile</h1>

          {/* PROFILE IMAGE / INITIAL */}

          <div className="profile-image">
            {user.username ? user.username.charAt(0).toUpperCase() : "U"}
          </div>

          {/* SUCCESS MESSAGE */}

          {message && <div className="profile-success">{message}</div>}

          {/* ERROR MESSAGE */}

          {error && <div className="profile-error">{error}</div>}

          {/* USERNAME */}

          <div className="profile-info">
            <span className="profile-label">Username</span>

            {editing ? (
              <input
                className="profile-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            ) : (
              <div className="profile-value">{user.username}</div>
            )}
          </div>

          {/* EMAIL */}

          <div className="profile-info">
            <span className="profile-label">Email</span>

            {editing ? (
              <input
                type="email"
                className="profile-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            ) : (
              <div className="profile-value">{user.email}</div>
            )}
          </div>

          {/* BUTTONS */}

          {!editing ? (
            <button
              className="profile-edit-button"
              onClick={() => {
                setEditing(true);

                setMessage("");
                setError("");
              }}
            >
              Edit Profile
            </button>
          ) : (
            <div className="profile-buttons">
              {/* SAVE */}

              <button className="profile-save-button" onClick={handleSave}>
                Save Changes
              </button>

              {/* CANCEL */}

              <button
                className="profile-cancel-button"
                onClick={() => {
                  setUsername(user.username);

                  setEmail(user.email);

                  setEditing(false);

                  setError("");
                  setMessage("");
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <FooterSection />
    </>
  );
}

export default Profile;
