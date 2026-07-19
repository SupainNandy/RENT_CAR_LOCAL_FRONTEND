import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { authContext } from "../context/contextApi";
import { useNavigate, useLocation } from "react-router-dom";


const MyBookings = () => {
  const { name } = useContext(authContext);
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [paymentMessage, setPaymentMessage] = useState("");

  const navigate = useNavigate();

  // Handle payment message success banner
  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setPaymentMessage(location.state.message);

      setTimeout(() => {
        setPaymentMessage("");
      }, 5000);
    }
  }, [location]);

  const handlePayment = (booking) => {
    navigate("/user/payment", {
      state: {
        bookingId: booking._id,
        amount: booking.totalAmount,
        carName: `${booking.carId?.brand || ""} ${booking.carId?.model || ""}`,
        pickupDate: booking.pickupDate,
        returnDate: booking.returnDate,
        pricePerDay: booking.carId?.pricePerDay,
        carImage: booking.carId?.images?.[0] || "",
        seats: booking.carId?.seats,
        fuelType: booking.carId?.fuelType,
        transmission: booking.carId?.transmission,
      },
    });
  };

  // Modified fetchBookings to support silent background loading
  const fetchBookings = async (isFirstLoad = false) => {
    try {
      if (isFirstLoad) {
        setLoading(true); // Show loading screen ONLY on the very first render
      }
      setError(null);
      const userToken = localStorage.getItem("userToken");
      const res = await axios.get("http://localhost:8000/bookings/my-bookings", {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setBookings(res.data.bookings);
    } catch (err) {
      setError("Failed to load bookings. Please try again.");
      console.error(err);
    } finally {
      if (isFirstLoad) {
        setLoading(false);
      }
    }
  };

  // Set up background polling
  useEffect(() => {
    // 1. Run the initial fetch with the loading UI enabled
    fetchBookings(true);

    // 2. Poll every 5 seconds silently in the background
    const interval = setInterval(() => {
      fetchBookings(false); // pass false so it updates state without changing 'loading' to true
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const cancelBooking = async (bookingId) => {
    try {
      const userToken = localStorage.getItem("userToken");
      await axios.put(
        `http://localhost:8000/bookings/cancel/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      fetchBookings(false); // Silent refresh
    } catch (err) {
      setError("Failed to cancel booking.");
    }
  };

  const updateBooking = async () => {
    try {
      const userToken = localStorage.getItem("userToken");
      await axios.put(
        `http://localhost:8000/bookings/update/${editingBooking._id}`,
        {
          pickupDate: editingBooking.pickupDate,
          returnDate: editingBooking.returnDate,
        },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setEditingBooking(null);
      fetchBookings(false); // Silent refresh
    } catch (err) {
      setError("Failed to update booking.");
    }
  };

  const getFirstName = (fullName) => fullName?.split(" ")[0] || "User";

  const statusStyle = (status) => {
    switch (status) {
      case "Approved": return { color: "#4caf82", border: "rgba(76,175,130,0.3)", bg: "rgba(76,175,130,0.08)" };
      case "Rejected": return { color: "#e05555", border: "rgba(224,85,85,0.3)", bg: "rgba(224,85,85,0.08)" };
      case "Cancelled": return { color: "rgba(255,255,255,0.35)", border: "rgba(255,255,255,0.15)", bg: "rgba(255,255,255,0.04)" };
      default: return { color: "#d4af37", border: "rgba(212,175,55,0.3)", bg: "rgba(212,175,55,0.08)" };
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const calcDays = (pickup, ret) => {
    const diff = new Date(ret) - new Date(pickup);
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .mb-root {
          min-height: 100vh;
          background: #0a0a0a;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
        }

        /* ── Hero ── */
        .mb-hero {
          background: #000;
          border-bottom: 1px solid rgba(212,175,55,0.2);
          padding: 56px 40px;
        }
        .mb-hero-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .mb-hero-label {
          font-size: 11px;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          color: #d4af37;
          margin-bottom: 10px;
          font-weight: 500;
        }
        .mb-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 600;
          color: #fff;
          line-height: 1.1;
        }
        .mb-hero-title span { color: #d4af37; }
        .mb-hero-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          margin-top: 8px;
          font-weight: 300;
        }

        /* Avatar */
        .mb-avatar {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: #d4af37;
          flex-shrink: 0;
        }
        .mb-hero-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .mb-hero-right-text { text-align: right; }
        .mb-hero-right-name {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
        }
        .mb-hero-right-count {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          margin-top: 3px;
        }

        /* ── Section ── */
        .mb-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 52px 40px 80px;
        }
        .mb-section-head {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 36px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(212,175,55,0.12);
        }
        .mb-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 500;
          color: #fff;
        }
        .mb-count {
          background: rgba(212,175,55,0.1);
          color: #d4af37;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          padding: 3px 12px;
          border-radius: 20px;
          border: 1px solid rgba(212,175,55,0.2);
        }

        /* ── Grid ── */
        .mb-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        /* ── Card ── */
        .mb-card {
          background: #111;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .mb-card:hover {
          transform: translateY(-5px);
          border-color: rgba(212,175,55,0.3);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .mb-card-img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .mb-card:hover .mb-card-img { transform: scale(1.04); }

        .mb-card-body { padding: 20px; }
        .mb-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 14px;
          gap: 10px;
        }
        .mb-car-name {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 500;
          color: #fff;
          line-height: 1.2;
        }
        .mb-status-badge {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .mb-dates {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 16px;
        }
        .mb-date-box {
          background: #0d0d0d;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 10px 12px;
        }
        .mb-date-label {
          font-size: 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 4px;
        }
        .mb-date-value {
          font-size: 13px;
          font-weight: 500;
          color: #fff;
        }

        .mb-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 16px;
        }
        .mb-price {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 600;
          color: #d4af37;
        }
        .mb-duration {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
        }

        .mb-actions { display: flex; gap: 10px; }
        .mb-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mb-btn-update {
          background: rgba(212,175,55,0.1);
          color: #d4af37;
          border: 1px solid rgba(212,175,55,0.25);
        }
        .mb-btn-update:hover {
          background: rgba(212,175,55,0.18);
          transform: translateY(-1px);
        }
        .mb-btn-cancel {
          background: rgba(224,85,85,0.08);
          color: #e05555;
          border: 1px solid rgba(224,85,85,0.2);
        }
        .mb-btn-cancel:hover {
          background: rgba(224,85,85,0.15);
          transform: translateY(-1px);
        }

        /* ── Empty / Loading ── */
        .mb-empty {
          text-align: center;
          padding: 80px 20px;
          color: rgba(255,255,255,0.25);
        }
        .mb-empty-icon { font-size: 44px; margin-bottom: 14px; }
        .mb-loading {
          text-align: center;
          padding: 80px 20px;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
        }
        .mb-error {
          background: rgba(224,85,85,0.08);
          border: 1px solid rgba(224,85,85,0.2);
          color: #e05555;
          border-radius: 10px;
          padding: 14px 18px;
          font-size: 14px;
          margin-bottom: 24px;
        }

        /* ── Modal overlay ── */
        .mb-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }
        .mb-modal {
          background: #111;
          border: 1px solid rgba(212,175,55,0.2);
          border-radius: 18px;
          width: 100%;
          max-width: 420px;
          overflow: hidden;
        }
        .mb-modal-header {
          padding: 22px 24px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .mb-modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 500;
          color: #fff;
        }
        .mb-modal-close {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
          width: 32px; height: 32px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .mb-modal-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .mb-modal-body { padding: 24px; }
        .mb-modal-field { margin-bottom: 16px; }
        .mb-modal-field label {
          display: block;
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 7px;
          font-weight: 600;
        }
        .mb-modal-field input {
          width: 100%;
          padding: 11px 14px;
          background: #0d0d0d;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          color-scheme: dark;
          transition: border-color 0.2s;
        }
        .mb-modal-field input:focus { border-color: rgba(212,175,55,0.5); }
        .mb-modal-footer {
          padding: 18px 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          gap: 10px;
        }
        .mb-modal-btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mb-modal-btn-cancel {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .mb-modal-btn-cancel:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .mb-modal-btn-save {
          background: #d4af37;
          color: #000;
        }
        .mb-modal-btn-save:hover { background: #e8c84a; transform: translateY(-1px); }

        /* ── Responsive ── */
        @media (max-width: 1100px) { .mb-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 700px) {
          .mb-grid { grid-template-columns: 1fr; }
          .mb-hero { padding: 44px 20px; }
          .mb-section { padding: 40px 20px 60px; }
          .mb-hero-right-text { display: none; }
        }
        @media (max-width: 480px) {
          .mb-dates { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="mb-root">
        {/* Hero */}
        <div className="mb-hero">
          <div className="mb-hero-inner">
            <div>
              <p className="mb-hero-label">Your Reservations</p>
              <h1 className="mb-hero-title">
                My <span>Bookings</span>
              </h1>
              <p className="mb-hero-sub">Track and manage all your car reservations.</p>
            </div>
            <div className="mb-hero-right">
              <div className="mb-hero-right-text">
                <p className="mb-hero-right-name">{name || "User"}</p>
                <p className="mb-hero-right-count">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="mb-avatar">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
          </div>
        </div>

        {/* Section */}
        <div className="mb-section">
          <div className="mb-section-head">
            <h2 className="mb-section-title">All Bookings</h2>
            {bookings.length > 0 && <span className="mb-count">{bookings.length}</span>}
          </div>

          {paymentMessage && (
            <div
              style={{
                background: "rgba(76,175,80,0.12)",
                border: "1px solid rgba(76,175,80,0.4)",
                color: "#4caf50",
                padding: "14px 18px",
                borderRadius: "10px",
                marginBottom: "20px",
                fontWeight: "600",
                textAlign: "center"
              }}
            >
              {paymentMessage}
            </div>
          )}

          {error && <div className="mb-error">{error}</div>}

          {loading ? (
            <div className="mb-loading">Loading your bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="mb-empty">
              <div className="mb-empty-icon">📋</div>
              <p>No bookings found.</p>
            </div>
          ) : (
            <div>
              {/* Active & Upcoming Rentals Section */}
              {bookings.filter(b => b.bookingStatus !== "Cancelled" && b.bookingStatus !== "Rejected" && new Date(b.returnDate) >= new Date()).length > 0 && (
                <div style={{ marginBottom: "50px" }}>
                  <h3 style={{ fontSize: "16px", color: "#d4af37", marginBottom: "24px", textTransform: "uppercase", letterSpacing: "1px", borderLeft: "3px solid #d4af37", paddingLeft: "12px", fontWeight: "700" }}>
                    Active & Upcoming Rentals
                  </h3>
                  <div className="mb-grid">
                    {bookings
                      .filter(b => b.bookingStatus !== "Cancelled" && b.bookingStatus !== "Rejected" && new Date(b.returnDate) >= new Date())
                      .map((booking) => {
                        const s = statusStyle(booking.bookingStatus);
                        const days = calcDays(booking.pickupDate, booking.returnDate);
                        return (
                          <div className="mb-card" key={booking._id}>
                            <div style={{ overflow: "hidden" }}>
                              <img
                                src={booking.carId?.images?.[0]}
                                alt={`${booking.carId?.brand} ${booking.carId?.model}`}
                                className="mb-card-img"
                              />
                            </div>
                            <div className="mb-card-body">
                              <div className="mb-card-top">
                                <h3 className="mb-car-name">
                                  {booking.carId?.brand} {booking.carId?.model}
                                </h3>
                                <span
                                  className="mb-status-badge"
                                  style={{ color: s.color, borderColor: s.border, background: s.bg }}
                                >
                                  {booking.bookingStatus}
                                </span>
                              </div>

                              <div className="mb-dates">
                                <div className="mb-date-box">
                                  <p className="mb-date-label">Pickup</p>
                                  <p className="mb-date-value">{formatDate(booking.pickupDate)}</p>
                                </div>
                                <div className="mb-date-box">
                                  <p className="mb-date-label">Return</p>
                                  <p className="mb-date-value">{formatDate(booking.returnDate)}</p>
                                </div>
                              </div>

                              <div className="mb-price-row">
                                <span className="mb-price">₹{booking.totalAmount?.toLocaleString()}</span>
                                <span className="mb-duration">{days} day{days !== 1 ? "s" : ""}</span>
                              </div>

                              <div className="mb-actions">
                                {booking.paymentStatus === "Paid" ? (
                                  <div
                                    style={{
                                      width: "100%",
                                      background: "rgba(76,175,80,0.06)",
                                      border: "1px solid rgba(76,175,80,0.25)",
                                      padding: "15px",
                                      borderRadius: "12px",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "8px",
                                      fontSize: "13px",
                                      color: "#ccc"
                                    }}
                                  >
                                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(76,175,80,0.2)", paddingBottom: "6px", marginBottom: "4px" }}>
                                      <span style={{ color: "#4caf50", fontWeight: "700" }}>✓ RIDE SECURED</span>
                                      <span style={{ color: "#4caf50", fontWeight: "bold" }}>CONFIRMED</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span>Transaction ID</span>
                                      <span style={{ color: "#fff", fontFamily: "monospace" }}>{booking.transactionId || "N/A"}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span>Receipt Code</span>
                                      <span style={{ color: "#fff", fontWeight: "600" }}>RR-{booking._id?.slice(-6).toUpperCase()}</span>
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#888", textAlign: "center", marginTop: "4px" }}>
                                      Show Receipt Code to counter agent at pickup.
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {booking.bookingStatus === "Approved" && (
                                      <button
                                        className="mb-btn"
                                        style={{
                                          background: "#4caf50",
                                          color: "#fff",
                                        }}
                                        onClick={() => handlePayment(booking)}
                                      >
                                        Make Payment
                                      </button>
                                    )}

                                    <button
                                      className="mb-btn mb-btn-update"
                                      onClick={() => setEditingBooking(booking)}
                                    >
                                      Update
                                    </button>

                                    {booking.bookingStatus !== "Cancelled" && (
                                      <button
                                        className="mb-btn mb-btn-cancel"
                                        onClick={() => cancelBooking(booking._id)}
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Rental History & Previous Bookings Section */}
              {bookings.filter(b => b.bookingStatus === "Cancelled" || b.bookingStatus === "Rejected" || new Date(b.returnDate) < new Date()).length > 0 && (
                <div style={{ marginTop: "40px" }}>
                  <h3 style={{ fontSize: "16px", color: "#888", marginBottom: "24px", textTransform: "uppercase", letterSpacing: "1px", borderLeft: "3px solid #555", paddingLeft: "12px", fontWeight: "700" }}>
                    Rental History & Previous Bookings
                  </h3>
                  <div className="mb-grid" style={{ opacity: 0.85 }}>
                    {bookings
                      .filter(b => b.bookingStatus === "Cancelled" || b.bookingStatus === "Rejected" || new Date(b.returnDate) < new Date())
                      .map((booking) => {
                        const isPastRide = new Date(booking.returnDate) < new Date();
                        const isCancelled = booking.bookingStatus === "Cancelled" || booking.bookingStatus === "Rejected";
                        
                        let displayStatus = booking.bookingStatus;
                        let displayColor = "#e55353";
                        let displayBg = "rgba(229,83,83,0.1)";
                        let displayBorder = "1px solid rgba(229,83,83,0.2)";

                        if (isPastRide && !isCancelled) {
                          displayStatus = "Completed";
                          displayColor = "#d4af37";
                          displayBg = "rgba(212,175,55,0.08)";
                          displayBorder = "1px solid rgba(212,175,55,0.2)";
                        } else if (booking.bookingStatus === "Rejected") {
                          displayStatus = "Rejected";
                        } else if (booking.bookingStatus === "Cancelled") {
                          displayStatus = "Cancelled";
                        }

                        const days = calcDays(booking.pickupDate, booking.returnDate);
                        return (
                          <div className="mb-card" key={booking._id} style={{ background: "rgba(20,20,20,0.5)", borderColor: "rgba(255,255,255,0.03)" }}>
                            <div style={{ overflow: "hidden", opacity: 0.5 }}>
                              <img
                                src={booking.carId?.images?.[0]}
                                alt={`${booking.carId?.brand} ${booking.carId?.model}`}
                                className="mb-card-img"
                              />
                            </div>
                            <div className="mb-card-body">
                              <div className="mb-card-top">
                                <h3 className="mb-car-name" style={{ color: "#888" }}>
                                  {booking.carId?.brand} {booking.carId?.model}
                                </h3>
                                <span
                                  className="mb-status-badge"
                                  style={{ color: displayColor, borderColor: displayBorder, background: displayBg }}
                                >
                                  {displayStatus}
                                </span>
                              </div>

                              <div className="mb-dates" style={{ opacity: 0.5 }}>
                                <div className="mb-date-box">
                                  <p className="mb-date-label">Pickup</p>
                                  <p className="mb-date-value">{formatDate(booking.pickupDate)}</p>
                                </div>
                                <div className="mb-date-box">
                                  <p className="mb-date-label">Return</p>
                                  <p className="mb-date-value">{formatDate(booking.returnDate)}</p>
                                </div>
                              </div>

                              <div className="mb-price-row" style={{ opacity: 0.6 }}>
                                <span className="mb-price" style={{ color: "#aaa" }}>₹{booking.totalAmount?.toLocaleString()}</span>
                                <span className="mb-duration">{days} day{days !== 1 ? "s" : ""}</span>
                              </div>

                              <div className="mb-actions">
                                {booking.paymentStatus === "Paid" && !isCancelled ? (
                                  <div
                                    style={{
                                      width: "100%",
                                      background: "rgba(255,255,255,0.02)",
                                      border: "1px solid rgba(255,255,255,0.08)",
                                      padding: "12px",
                                      borderRadius: "8px",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "6px",
                                      fontSize: "12px",
                                      color: "#888"
                                    }}
                                  >
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span>Transaction ID</span>
                                      <span style={{ fontFamily: "monospace", color: "#ccc" }}>{booking.transactionId || "N/A"}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span>Ride Status</span>
                                      <span style={{ color: "#d4af37", fontWeight: "bold" }}>COMPLETED RIDE</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      width: "100%",
                                      background: "rgba(255,255,255,0.01)",
                                      border: "1px solid rgba(255,255,255,0.03)",
                                      padding: "10px",
                                      borderRadius: "8px",
                                      textAlign: "center",
                                      fontSize: "12px",
                                      color: "#666",
                                    }}
                                  >
                                    {isCancelled ? "Reservation Cancelled" : "Ride Completed"}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {editingBooking && (
        <div className="mb-modal-overlay" onClick={() => setEditingBooking(null)}>
          <div className="mb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mb-modal-header">
              <h3 className="mb-modal-title">Update Booking</h3>
              <button className="mb-modal-close" onClick={() => setEditingBooking(null)}>✕</button>
            </div>
            <div className="mb-modal-body">
              <div className="mb-modal-field">
                <label>Pickup Date</label>
                <input
                  type="date"
                  value={new Date(editingBooking.pickupDate).toISOString().slice(0, 10)}
                  onChange={(e) =>
                    setEditingBooking({ ...editingBooking, pickupDate: e.target.value })
                  }
                />
              </div>
              <div className="mb-modal-field">
                <label>Return Date</label>
                <input
                  type="date"
                  value={new Date(editingBooking.returnDate).toISOString().slice(0, 10)}
                  onChange={(e) =>
                    setEditingBooking({ ...editingBooking, returnDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mb-modal-footer">
              <button className="mb-modal-btn mb-modal-btn-cancel" onClick={() => setEditingBooking(null)}>
                Close
              </button>
              <button className="mb-modal-btn mb-modal-btn-save" onClick={updateBooking}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyBookings;