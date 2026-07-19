  import React from "react";
  import { Link, Outlet, useNavigate } from "react-router-dom";

  const Admin = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminLoggedIn");
      navigate("/login-admin");
    };

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "#fff",
        }}
      >
        {/* Navbar */}
        <nav
          className="navbar navbar-expand-lg navbar-dark"
          style={{
            background: "#111",
            borderBottom: "1px solid rgba(212,175,55,.25)",
          }}
        >
          <div className="container-fluid">

            <Link
              className="navbar-brand fw-bold"
              style={{
                color: "#d4af37",
                fontSize: "1.4rem",
              }}
              to="/admin/admin-dashboard"
            >
              🚗 DriveAdmin
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#adminNavbar"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div
              className="collapse navbar-collapse"
              id="adminNavbar"
            >
              <ul className="navbar-nav ms-auto align-items-center">

                <li className="nav-item me-2">
                  <Link
                    className="nav-link text-white"
                    to="/admin/admin-dashboard"
                  >
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item me-3">
                  <Link
                    className="btn"
                    style={{
                      background: "#d4af37",
                      color: "#000",
                      fontWeight: "600",
                      borderRadius: "8px",
                    }}
                    to="/admin/admin-ai"
                  >
                    🤖 AI Chat
                  </Link>
                </li>

                <li className="nav-item">
                  <button
                    className="btn btn-outline-danger"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>

              </ul>
            </div>

          </div>
        </nav>

        {/* Welcome Section */}
        <div className="container py-5">

          <div
            className="text-center p-5"
            style={{
              background: "#111",
              borderRadius: "20px",
              border: "1px solid rgba(212,175,55,.25)",
            }}
          >
            <h1
              style={{
                color: "#d4af37",
                fontWeight: "700",
              }}
            >
              Admin Control Center
            </h1>

            <p
              style={{
                color: "#bbb",
                maxWidth: "700px",
                margin: "20px auto",
              }}
            >
              Manage bookings, users, vehicles and business
              analytics from a single dashboard.
            </p>

            <button
              className="btn btn-lg"
              style={{
                background: "#d4af37",
                color: "#000",
                fontWeight: "bold",
              }}
              onClick={() => navigate("/admin/admin-ai")}
            >
              Launch AI Assistant
            </button>
          </div>

        </div>

        {/* Child Pages */}
        <div className="container-fluid pb-4">
          <Outlet />
        </div>
      </div>
    );
  };

  export default Admin;