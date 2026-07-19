import React, { useContext, useEffect, useState } from "react";
import { authContext } from "../context/contextApi";

const UserProfile = () => {
  const { setName: setContextName } = useContext(authContext);

  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");

  // Toast/alert system state
  const [alertConfig, setAlertConfig] = useState({ show: false, message: "", type: "success" });

  const triggerAlert = (message, type = "success") => {
    setAlertConfig({ show: true, message, type });
    setTimeout(() => {
      setAlertConfig({ show: false, message: "", type: "success" });
    }, 4000);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("userToken");

      const res = await fetch(
        "http://localhost:8000/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setUser(data);
        setName(data.name || "");
      }
    } catch (error) {
      console.log(error);
      triggerAlert("Failed to load your profile.", "error");
    }
  };

  const updateProfile = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      triggerAlert("Name cannot be empty.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("userToken");

      const res = await fetch(
        "http://localhost:8000/users/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: trimmedName }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // Some APIs return { user: {...} }, others return the user object directly.
        // Handle both shapes, and always fall back to the name we just submitted
        // so the UI never regresses to a placeholder like "Guest".
        const updatedUser = data.user || data;
        const finalName = updatedUser?.name || trimmedName;

        setUser({
          ...user,
          ...updatedUser,
          name: finalName,
        });
        setName(finalName);

        // Push into the shared auth context so Dashboard (and anywhere
        // else reading from authContext) reflects the new name immediately.
        // App.jsx watches this value and persists it to localStorage too,
        // so it survives a page refresh.
        if (typeof setContextName === "function") {
          setContextName(finalName);
        }

        triggerAlert("Profile updated successfully.", "success");
        setEditMode(false);
      } else {
        triggerAlert(data.message || "Update failed.", "error");
      }
    } catch (error) {
      console.log(error);
      triggerAlert("Something went wrong while saving your changes.", "error");
    }
  };

  const deleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("userToken");

      const res = await fetch(
        "http://localhost:8000/users/delete",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        triggerAlert("Account deleted successfully.", "success");

        localStorage.removeItem("userToken");
        localStorage.removeItem("userName");

        setTimeout(() => {
          window.location.href = "/login-user";
        }, 1500);
      } else {
        triggerAlert(data.message || "Account deletion failed.", "error");
      }
    } catch (error) {
      console.log(error);
      triggerAlert("Network error while deleting your account.", "error");
    }
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#050505,#0d0d0d,#161616)",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        <div
          style={{
            color: "#FFD700",
            textAlign: "center",
            letterSpacing: "2px",
            fontSize: "0.85rem",
            textTransform: "uppercase",
          }}
        >
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes alertSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .profile-card {
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .premium-profile-input {
          width: 100%;
          padding: 13px 18px;
          margin-top: 16px;
          background-color: rgba(14, 14, 14, 0.85) !important;
          color: #fff !important;
          border: 1px solid rgba(255, 215, 0, 0.25) !important;
          border-radius: 12px;
          outline: none;
          transition: all 0.3s ease;
          font-size: 1rem;
          text-align: center;
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        .premium-profile-input:focus {
          border-color: #FFD700 !important;
          box-shadow: 0 0 16px rgba(255, 215, 0, 0.25) !important;
          background-color: rgba(20, 20, 20, 0.95) !important;
        }
        .info-tile {
          transition: all 0.3s ease;
        }
        .info-tile:hover {
          border-color: rgba(255, 215, 0, 0.18) !important;
          background: #181818 !important;
        }
        .action-btn {
          transition: all 0.3s ease !important;
        }
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(255,215,0,0.18) !important;
        }
        .delete-btn-hover:hover {
          transform: translateY(-2px);
          background: rgba(255, 59, 48, 0.22) !important;
          box-shadow: 0 10px 24px rgba(255, 59, 48, 0.2) !important;
        }
        .avatar-ring {
          position: relative;
          width: 132px;
          height: 132px;
          margin: 0 auto;
          border-radius: 50%;
          padding: 4px;
          background: conic-gradient(from 180deg, #FFD700, #b8860b, #FFD700);
          box-shadow: 0 0 30px rgba(255,215,0,0.18);
        }
        .avatar-ring img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 3px solid #0d0d0d;
          display: block;
          object-fit: cover;
        }
      `}</style>

      {/* Toast Notification */}
      {alertConfig.show && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            minWidth: "320px",
            maxWidth: "450px",
            background: "rgba(10, 10, 10, 0.95)",
            borderLeft: `3px solid ${alertConfig.type === "success" ? "#FFD700" : "#ff3b30"}`,
            borderTop: "1px solid rgba(255, 215, 0, 0.15)",
            borderBottom: "1px solid rgba(255, 215, 0, 0.15)",
            borderRight: "1px solid rgba(255, 215, 0, 0.15)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
            backdropFilter: "blur(12px)",
            borderRadius: "6px",
            padding: "16px 20px",
            fontFamily: "'Barlow', sans-serif",
            animation: "alertSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  color: alertConfig.type === "success" ? "#FFD700" : "#ff3b30",
                  fontWeight: 600,
                  marginBottom: "4px"
                }}
              >
                {alertConfig.type === "success" ? "Success" : "Error"}
              </div>
              <div style={{ color: "#fff", fontSize: "0.88rem", fontWeight: 300, letterSpacing: "0.5px" }}>
                {alertConfig.message}
              </div>
            </div>
            <button
              onClick={() => setAlertConfig({ ...alertConfig, show: false })}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "1.2rem", cursor: "pointer", paddingLeft: "15px" }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at 50% 0%, #161616 0%, #050505 70%)",
          padding: "40px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Barlow', sans-serif"
        }}
      >
        <div
          className="profile-card"
          style={{
            width: "100%",
            maxWidth: "640px",
            background: "linear-gradient(180deg, rgba(20,20,20,0.92), rgba(13,13,13,0.92))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 215, 0, 0.16)",
            borderRadius: "28px",
            padding: "44px 40px",
            boxShadow: "0 30px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div className="avatar-ring">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=FFD700&color=000&bold=true`}
                alt="Profile avatar"
              />
            </div>

            {editMode ? (
              <input
                className="premium-profile-input"
                value={name}
                placeholder="Your name"
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            ) : (
              <h1
                style={{
                  color: "#FFD700",
                  marginTop: "20px",
                  fontWeight: 600,
                  fontSize: "1.8rem",
                  letterSpacing: "0.3px"
                }}
              >
                {user.name}
              </h1>
            )}

            <p style={{
              color: "rgba(255,215,0,0.55)",
              fontSize: "0.72rem",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              marginTop: "8px",
              fontWeight: 500,
            }}>
              Account Holder
            </p>
          </div>

          <div
            style={{
              marginTop: "36px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div
              className="info-tile"
              style={{
                background: "#141414",
                padding: "18px 20px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.04)",
                gridColumn: "1 / -1",
              }}
            >
              <h4 style={{ color: "rgba(255,215,0,0.65)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "6px", fontWeight: 600 }}>
                Email Address
              </h4>
              <p style={{ color: "rgba(255,255,255,0.92)", margin: 0, fontSize: "0.98rem", fontWeight: 400 }}>
                {user.email}
              </p>
            </div>

            <div
              className="info-tile"
              style={{
                background: "#141414",
                padding: "18px 20px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.04)",
                gridColumn: "1 / -1",
              }}
            >
              <h4 style={{ color: "rgba(255,215,0,0.65)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "6px", fontWeight: 600 }}>
                Role
              </h4>
              <p style={{ color: "rgba(255,255,255,0.92)", margin: 0, fontSize: "0.98rem", textTransform: "capitalize", fontWeight: 400 }}>
                {user.role}
              </p>
            </div>
          </div>

          {/* Action Row */}
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="action-btn"
              style={{
                width: "100%",
                marginTop: "32px",
                padding: "15px",
                background: "linear-gradient(135deg, #FFD700, #e0b400)",
                color: "#000",
                border: "none",
                borderRadius: "13px",
                fontWeight: "700",
                fontSize: "0.85rem",
                letterSpacing: "1px",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Edit Profile
            </button>
          ) : (
            <div style={{ display: "flex", gap: "14px", marginTop: "32px" }}>
              <button
                onClick={() => {
                  setEditMode(false);
                  setName(user.name);
                }}
                className="action-btn"
                style={{
                  flex: 1,
                  padding: "15px",
                  background: "rgba(255,255,255,0.04)",
                  color: "#bbb",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "13px",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={updateProfile}
                className="action-btn"
                style={{
                  flex: 2,
                  padding: "15px",
                  background: "linear-gradient(135deg, #FFD700, #e0b400)",
                  color: "#000",
                  border: "none",
                  borderRadius: "13px",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          )}

          <button
            onClick={deleteAccount}
            className="delete-btn-hover"
            style={{
              width: "100%",
              marginTop: "14px",
              padding: "15px",
              background: "rgba(255, 59, 48, 0.1)",
              color: "#ff3b30",
              border: "1px solid rgba(255, 59, 48, 0.25)",
              borderRadius: "13px",
              fontWeight: "600",
              fontSize: "0.85rem",
              letterSpacing: "1px",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </>
  );
};

export default UserProfile;