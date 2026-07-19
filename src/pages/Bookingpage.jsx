import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URI;

const BookingPage = () => {
  const { carId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Router state is the fast path (Reserve Now buttons everywhere in the
  // app, including the AI chat, pass { state: { car } }). If it's missing —
  // page refresh, direct link, back/forward nav — fall back to fetching the
  // car by id so the redirect still resolves instead of showing "not found".
  const [car, setCar] = useState(location.state?.car || null);
  const [fetchingCar, setFetchingCar] = useState(!location.state?.car);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (car || !carId) return;

    let cancelled = false;

    const fetchCar = async () => {
      try {
        const res = await axios.get(`${API_URL}/cars/${carId}`);
        const fetchedCar = res.data?.car || res.data;
        if (!cancelled && fetchedCar && fetchedCar._id) {
          setCar(fetchedCar);
        } else if (!cancelled) {
          setFetchError(true);
        }
      } catch (error) {
        console.log("Fetch car error:", error.response?.data || error.message);
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setFetchingCar(false);
      }
    };

    fetchCar();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carId]);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
    dropLocation: "",
  });

  // Once the car resolves (either from state immediately, or from the
  // fallback fetch), seed the location fields.
  useEffect(() => {
    if (car) {
      setForm((prev) => ({
        ...prev,
        pickupLocation: prev.pickupLocation || car.location || "",
        dropLocation: prev.dropLocation || car.location || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car]);

  const [activeImg, setActiveImg] = useState(car?.images?.[0] || "");

  useEffect(() => {
    if (car?.images?.[0] && !activeImg) {
      setActiveImg(car.images[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car]);

  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Custom premium alert system state
  const [alertConfig, setAlertConfig] = useState({ show: false, message: "", type: "success" });

  const triggerAlert = (message, type = "success") => {
    setAlertConfig({ show: true, message, type });
    setTimeout(() => {
      setAlertConfig({ show: false, message: "", type: "success" });
    }, 4000);
  };

  if (fetchingCar) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "sans-serif", background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
        <p>Loading car details...</p>
      </div>
    );
  }

  if (!car || fetchError) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "sans-serif", background: "#0a0a0a", minHeight: "100vh", color: "#fff" }}>
        <p>Car details not found. Please go back and select a car.</p>
        <button onClick={() => navigate("/")} style={{ marginTop: 16, padding: "10px 24px", cursor: "pointer", background: "#d4af37", border: "none", borderRadius: 8, fontWeight: 600 }}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const calcDays = () => {
    if (!form.pickupDate || !form.returnDate) return 0;
    const diff = new Date(form.returnDate + "T00:00:00") - new Date(form.pickupDate + "T00:00:00");
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const totalAmount = calcDays() * (car.pricePerDay || 0);

  const handleConfirm = async () => {
    if (!form.pickupDate || !form.returnDate) {
      triggerAlert("Please select both pickup and return dates.", "error");
      return;
    }
    if (calcDays() <= 0) {
      triggerAlert("Return date must be after pickup date.", "error");
      return;
    }
    try {
      setLoading(true);
      const userToken = localStorage.getItem("userToken");
      await axios.post(
        `http://localhost:8000/bookings/book/${carId}`,
        { pickupDate: form.pickupDate, returnDate: form.returnDate },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setConfirmed(true);
    } catch (error) {
      triggerAlert(error.response?.data?.message || "Booking failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (confirmed) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .success-root {
            min-height: 100vh;
            background: #0a0a0a;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'DM Sans', sans-serif;
            padding: 40px 20px;
            text-align: center;
          }
          .success-icon {
            width: 80px; height: 80px;
            border-radius: 50%;
            background: rgba(212,175,55,0.1);
            border: 1px solid rgba(212,175,55,0.4);
            display: flex; align-items: center; justify-content: center;
            font-size: 32px;
            margin-bottom: 28px;
            color: #d4af37;
            animation: popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
          }
          @keyframes popIn {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .success-title {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            font-weight: 600;
            color: #fff;
            margin: 0 0 10px;
          }
          .success-title span { color: #d4af37; }
          .success-sub {
            color: rgba(255,255,255,0.4);
            font-size: 14px;
            margin-bottom: 36px;
            max-width: 360px;
            line-height: 1.6;
          }
          .success-card {
            background: #111;
            border: 1px solid rgba(212,175,55,0.2);
            border-radius: 16px;
            padding: 8px 28px;
            text-align: left;
            width: 100%;
            max-width: 400px;
            margin-bottom: 32px;
          }
          .success-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 0;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            font-size: 14px;
          }
          .success-row:last-child { border-bottom: none; }
          .success-row-label { color: rgba(255,255,255,0.4); }
          .success-row-value { color: #fff; font-weight: 500; }
          .success-row-value.gold {
            color: #d4af37;
            font-family: 'Playfair Display', serif;
            font-size: 18px;
          }
          .success-btn {
            padding: 14px 44px;
            background: #d4af37;
            color: #000;
            border: none;
            border-radius: 12px;
            font-family: 'DM Sans', sans-serif;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.2s, transform 0.15s;
            letter-spacing: 0.3px;
          }
          .success-btn:hover { background: #e8c84a; transform: translateY(-2px); }
          .success-btn:active { transform: scale(0.98); }
        `}</style>
        <div className="success-root">
          <div className="success-icon">✓</div>
          <h1 className="success-title">Booking <span>Confirmed!</span></h1>
          <p className="success-sub">Your ride has been reserved. Have a great journey ahead.</p>
          <div className="success-card">
            <div className="success-row">
              <span className="success-row-label">Car</span>
              <span className="success-row-value">{car.brand} {car.model}</span>
            </div>
            <div className="success-row">
              <span className="success-row-label">Pickup Date</span>
              <span className="success-row-value">{form.pickupDate}</span>
            </div>
            <div className="success-row">
              <span className="success-row-label">Return Date</span>
              <span className="success-row-value">{form.returnDate}</span>
            </div>
            <div className="success-row">
              <span className="success-row-label">Duration</span>
              <span className="success-row-value">{calcDays()} days</span>
            </div>
            <div className="success-row">
              <span className="success-row-label">Total Paid</span>
              <span className="success-row-value gold">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
          <button className="success-btn" onClick={() => navigate("/user/mybookings")}>
            View My Bookings →
          </button>
        </div>
      </>
    );
  }

  /* ── Booking Page ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bp-root {
          min-height: 100vh;
          background: #0a0a0a;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
        }

        /* ── Top bar ── */
        .bp-topbar {
          background: #000;
          border-bottom: 1px solid rgba(212,175,55,0.2);
          padding: 18px 40px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .bp-back-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          border-radius: 8px;
          padding: 8px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .bp-back-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .bp-topbar-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
        }
        .bp-topbar-title span { color: #fff; }

        /* ── Layout ── */
        .bp-layout {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 28px;
          align-items: start;
        }

        /* ── Car panel ── */
        .bp-car-panel {
          background: #111;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          overflow: hidden;
        }
        .bp-main-img {
          width: 100%;
          height: 280px;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .bp-main-img:hover { transform: scale(1.02); }
        .bp-thumbs {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          background: #0d0d0d;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .bp-thumbs::-webkit-scrollbar { display: none; }
        .bp-thumb {
          width: 60px; height: 46px;
          flex-shrink: 0;
          object-fit: cover;
          border-radius: 6px;
          cursor: pointer;
          border: 2px solid transparent;
          opacity: 0.55;
          transition: border-color 0.2s, opacity 0.2s;
        }
        .bp-thumb:hover { opacity: 1; }
        .bp-thumb.active { border-color: #d4af37; opacity: 1; }

        .bp-car-info { padding: 26px; }
        .bp-car-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 6px;
        }
        .bp-car-loc {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 20px;
          display: flex; align-items: center; gap: 5px;
        }
        .bp-specs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }
        .bp-spec-pill {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 12px;
        }
        .bp-price-box {
          background: #000;
          border: 1px solid rgba(212,175,55,0.2);
          border-radius: 12px;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bp-price-label {
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 6px;
        }
        .bp-price-val {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          font-weight: 600;
          color: #d4af37;
        }
        .bp-price-unit {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          font-family: 'DM Sans', sans-serif;
          margin-left: 4px;
        }

        /* ── Form panel ── */
        .bp-form-panel {
          background: #111;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 28px 24px;
          position: sticky;
          top: 24px;
        }
        .bp-form-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 500;
          color: #fff;
          margin-bottom: 24px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .bp-field { margin-bottom: 16px; }
        .bp-field label {
          display: block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 7px;
        }
        .bp-field input,
        .bp-field textarea,
        .bp-field select {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          background: #0d0d0d;
          outline: none;
          transition: border-color 0.2s;
          resize: none;
          color-scheme: dark;
        }
        .bp-field input:focus,
        .bp-field textarea:focus,
        .bp-field select:focus {
          border-color: rgba(212,175,55,0.5);
        }
        .bp-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* ── Summary ── */
        .bp-summary {
          background: #0d0d0d;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 16px 18px;
          margin: 20px 0;
        }
        .bp-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          padding: 7px 0;
        }
        .bp-summary-label { color: rgba(255,255,255,0.4); }
        .bp-summary-value { color: rgba(255,255,255,0.8); font-weight: 500; }
        .bp-summary-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 8px 0;
        }
        .bp-summary-total-label {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
        }
        .bp-summary-total-value {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 600;
          color: #d4af37;
        }

        /* ── Button ── */
        .bp-confirm-btn {
          width: 100%;
          padding: 15px;
          background: #d4af37;
          color: #000;
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: background 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .bp-confirm-btn:hover:not(:disabled) { background: #e8c84a; transform: translateY(-2px); }
        .bp-confirm-btn:active:not(:disabled) { transform: scale(0.98); }
        .bp-confirm-btn:disabled {
          background: rgba(212,175,55,0.2);
          color: rgba(255,255,255,0.3);
          cursor: not-allowed;
          transform: none;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .bp-note {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          text-align: center;
          margin-top: 12px;
          line-height: 1.5;
        }

        @keyframes alertSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @media (max-width: 820px) {
          .bp-layout { grid-template-columns: 1fr; }
          .bp-topbar { padding: 16px 20px; }
        }
        @media (max-width: 480px) {
          .bp-layout { padding: 24px 16px 60px; }
          .bp-field-row { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Modern Luxury System Toast Banner */}
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
            borderLeft: `3px solid ${alertConfig.type === "success" ? "#d4af37" : "#ff3b30"}`,
            borderTop: "1px solid rgba(212, 175, 55, 0.15)",
            borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
            borderRight: "1px solid rgba(212, 175, 55, 0.15)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.7)",
            backdropFilter: "blur(12px)",
            borderRadius: "4px",
            padding: "16px 20px",
            fontFamily: "'DM Sans', sans-serif",
            animation: "alertSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  color: alertConfig.type === "success" ? "#d4af37" : "#ff3b30",
                  fontWeight: 600,
                  marginBottom: "4px"
                }}
              >
                {alertConfig.type === "success" ? "Reservation Event Logged" : "Allocation Exception"}
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

      <div className="bp-root">
        <div className="bp-topbar">
          <button className="bp-back-btn" onClick={() => navigate(-1)}>← Back</button>
          <span className="bp-topbar-title">
            Reserve — <span>{car.brand} {car.model}</span>
          </span>
        </div>

        <div className="bp-layout">
          {/* Left: Car details */}
          <div className="bp-car-panel">
            <img src={activeImg} alt={`${car.brand} ${car.model}`} className="bp-main-img" />

            {car.images?.length > 1 && (
              <div className="bp-thumbs">
                {car.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`view-${i + 1}`}
                    className={`bp-thumb ${activeImg === img ? "active" : ""}`}
                    onClick={() => setActiveImg(img)}
                  />
                ))}
              </div>
            )}

            <div className="bp-car-info">
              <h2 className="bp-car-title">{car.brand} {car.model}</h2>
              <p className="bp-car-loc">📍 {car.location}</p>
              <div className="bp-specs">
                <span className="bp-spec-pill">⚙️ {car.transmission}</span>
                <span className="bp-spec-pill">⛽ {car.fuelType}</span>
                <span className="bp-spec-pill">💺 {car.seats} seats</span>
                <span className="bp-spec-pill">📅 {car.year}</span>
              </div>
              <div className="bp-price-box">
                <div>
                  <p className="bp-price-label">Price per day</p>
                  <p className="bp-price-val">
                    ₹{(car.pricePerDay || 0).toLocaleString()}
                    <span className="bp-price-unit">/ day</span>
                  </p>
                </div>
                {calcDays() > 0 && (
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Duration</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display', serif" }}>{calcDays()} days</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bp-form-panel">
            <h3 className="bp-form-title">Complete Your Booking</h3>

            <div className="bp-field-row">
              <div className="bp-field">
                <label>Pickup Date</label>
                <input
                  type="date"
                  min={today}
                  value={form.pickupDate}
                  onKeyDown={(e) => e.preventDefault()}
                  onChange={(e) => {
                    handleChange("pickupDate", e.target.value);
                    if (form.returnDate && new Date(form.returnDate) <= new Date(e.target.value)) {
                      handleChange("returnDate", "");
                    }
                  }}
                />
              </div>
              <div className="bp-field">
                <label>Return Date</label>
                <input
                  type="date"
                  min={form.pickupDate || today}
                  value={form.returnDate}
                  onKeyDown={(e) => e.preventDefault()}
                  onChange={(e) => handleChange("returnDate", e.target.value)}
                />
              </div>
            </div>

            <div className="bp-field">
              <label>Pickup Location</label>
              <input
                type="text"
                value={form.pickupLocation}
                placeholder="Enter pickup address"
                onChange={(e) => handleChange("pickupLocation", e.target.value)}
              />
            </div>

            <div className="bp-field">
              <label>Drop-off Location</label>
              <input
                type="text"
                value={form.dropLocation}
                placeholder="Enter drop-off address"
                onChange={(e) => handleChange("dropLocation", e.target.value)}
              />
            </div>

            <div className="bp-summary">
              <div className="bp-summary-row">
                <span className="bp-summary-label">₹{(car.pricePerDay || 0).toLocaleString()} × {calcDays()} days</span>
                <span className="bp-summary-value">₹{((car.pricePerDay || 0) * calcDays()).toLocaleString()}</span>
              </div>
              <div className="bp-summary-row">
                <span className="bp-summary-label">Service fee</span>
                <span className="bp-summary-value">₹0</span>
              </div>
              <div className="bp-summary-divider" />
              <div className="bp-summary-row">
                <span className="bp-summary-total-label">Total Amount</span>
                <span className="bp-summary-total-value">
                  ₹{totalAmount > 0 ? totalAmount.toLocaleString() : "—"}
                </span>
              </div>
            </div>

            <button
              className="bp-confirm-btn"
              onClick={handleConfirm}
              disabled={loading || !form.pickupDate || !form.returnDate || calcDays() <= 0}
            >
              {loading
                ? <><div className="spinner" /> Processing...</>
                : <>Confirm Booking ✓</>
              }
            </button>
            <p className="bp-note">You won't be charged until the booking is confirmed by admin.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingPage;