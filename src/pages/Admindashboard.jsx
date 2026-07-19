import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useContext } from "react";
import { authContext } from "../context/contextApi";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Car, CalendarRange, History, Sparkles, LogOut, Plus } from "lucide-react";

const API = "http://localhost:8000";

// ─── helpers ───────────────────────────────────────────────
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

const multipartHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  "Content-Type": "multipart/form-data",
});

// ─── small reusable components ──────────────────────────────
const Badge = ({ status }) => {
  const map = {
    pending: { bg: "rgba(255,248,230,0.06)", color: "#b8860b", border: "1px solid rgba(184,134,11,0.25)", label: "Pending" },
    confirmed: { bg: "rgba(76,175,80,0.06)", color: "#4caf50", border: "1px solid rgba(76,175,80,0.25)", label: "Confirmed" },
    cancelled: { bg: "rgba(229,83,83,0.06)", color: "#ea4335", border: "1px solid rgba(229,83,83,0.25)", label: "Cancelled" },
    completed: { bg: "rgba(212,175,55,0.06)", color: "#d4af37", border: "1px solid rgba(212,175,55,0.25)", label: "Completed" },
  };
  const s = map[status?.toLowerCase()] || {
    bg: "rgba(255,255,255,0.03)",
    color: "#aaa",
    border: "1px solid rgba(255,255,255,0.08)",
    label: status,
  };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: s.border,
        fontSize: 11,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 20,
        letterSpacing: "0.5px",
        textTransform: "uppercase",
      }}
    >
      {s.label}
    </span>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 20,
      backdropFilter: "blur(4px)",
    }}
  >
    <div
      style={{
        background: "#0d0d0d",
        border: "1px solid rgba(212, 175, 55, 0.2)",
        borderRadius: 18,
        width: "100%",
        maxWidth: 560,
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "28px 28px 24px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 22,
        }}
      >
        <h3
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 18,
            fontWeight: 600,
            color: "#fff",
            margin: 0,
            letterSpacing: "1px",
          }}
        >
          {title}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            cursor: "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(212,175,55,0.2)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label
      style={{
        display: "block",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "1px",
        textTransform: "uppercase",
        color: "rgba(212,175,55,0.8)",
        marginBottom: 6,
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid rgba(212, 175, 55, 0.25)",
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "'DM Sans',sans-serif",
  color: "#fff",
  background: "#050505",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.3s ease",
};

const btnPrimary = {
  padding: "10px 20px",
  background: "#0c0c0c",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  fontFamily: "'DM Sans',sans-serif",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  textTransform: "uppercase",
  letterSpacing: "1px",
  transition: "all 0.3s ease",
};

const btnDanger = {
  ...btnPrimary,
  background: "rgba(234,67,53,0.15)",
  color: "#ea4335",
  border: "1px solid rgba(234,67,53,0.3)",
};

const btnGold = {
  ...btnPrimary,
  background: "linear-gradient(135deg, #d4af37 0%, #b8860b 100%)",
  color: "#000",
  border: "none",
  fontWeight: "700",
};

// ────────────────────────────────────────────────────────────
//  SECTION: Cars
// ────────────────────────────────────────────────────────────
const CarsSection = () => {
  const [cars, setCars] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editCar, setEditCar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const emptyForm = {
    brand: "",
    model: "",
    fuelType: "petrol",
    transmission: "Manual",
    seats: 4,
    location: "",
    year: new Date().getFullYear(),
    pricePerDay: "",
    available: true,
  };
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const fileRef = useRef();

  const fetchCars = async () => {
    try {
      const res = await axios.get(`${API}/cars`);
      setCars(res.data.data);
    } catch (e) {
      console.error("Error fetching cars:", e);
    }
  };

  useEffect(() => {
    fetchCars();
    const interval = setInterval(() => {
      fetchCars();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const openAdd = () => {
    setForm(emptyForm);
    setImages([]);
    setShowAdd(true);
  };
  const openEdit = (car) => {
    setEditCar(car);
    setForm({
      brand: car.brand || "",
      model: car.model || "",
      fuelType: car.fuelType || "petrol",
      transmission: car.transmission || "Manual",
      seats: car.seats || 4,
      location: car.location || "",
      year: car.year || new Date().getFullYear(),
      pricePerDay: car.pricePerDay || "",
      available: car.available ?? true,
    });
    setImages([]);
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((f) => fd.append("images", f));
      await axios.post(`${API}/cars/add-cars`, fd, {
        headers: multipartHeaders(),
      });
      setShowAdd(false);
      fetchCars();
    } catch (e) {
      alert(e.response?.data?.message || "Error adding car");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((f) => fd.append("images", f));
      await axios.put(`${API}/cars/update-car/${editCar._id}`, fd, {
        headers: multipartHeaders(),
      });
      setEditCar(null);
      fetchCars();
    } catch (e) {
      alert(e.response?.data?.message || "Error updating car");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this car?")) return;
    await axios.delete(`${API}/cars/delete-car/${id}`, {
      headers: authHeaders(),
    });
    fetchCars();
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 22,
              fontWeight: 600,
              color: "#fff",
              margin: 0,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Fleet Management
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>
            {cars.length} cars in fleet
          </p>
        </div>
        <button style={btnGold} onClick={openAdd}>
          + Add Car
        </button>
      </div>

      {/* Search Bar */}
      <div
        style={{
          marginBottom: 20,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: "rgba(212,175,55,0.5)",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by brand or model..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "13px 16px 13px 44px",
            background: "#0d0d0d",
            border: "1px solid rgba(212,175,55,0.15)",
            borderRadius: 12,
            fontSize: 14,
            fontFamily: "'DM Sans',sans-serif",
            color: "#fff",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            letterSpacing: "0.3px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div
        style={{
          background: "#0d0d0d",
          borderRadius: 16,
          border: "1px solid rgba(212,175,55,0.12)",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0f1117" }}>
              {[
                "Car",
                "Fuel / Trans.",
                "Seats",
                "Location",
                "Year",
                "Price/Day",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#d4af37",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cars
              .filter((car) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  (car.brand || "").toLowerCase().includes(q) ||
                  (car.model || "").toLowerCase().includes(q) ||
                  `${car.brand} ${car.model}`.toLowerCase().includes(q)
                );
              })
              .map((car, i) => (
              <tr
                key={car._id}
                style={{
                  background: i % 2 === 0 ? "transparent" : "rgba(212,175,55,0.03)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <td style={{ padding: "14px 16px" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    {car.images?.[0] && (
                      <img
                        src={car.images[0]}
                        alt=""
                        style={{
                          width: 52,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    )}
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#fff",
                        }}
                      >
                        {car.brand} {car.model}
                      </p>
                    </div>
                  </div>
                </td>
                <td
                  style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}
                >
                  {car.fuelType} / {car.transmission}
                </td>
                <td
                  style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}
                >
                  {car.seats}
                </td>
                <td
                  style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}
                >
                  {car.location}
                </td>
                <td
                  style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}
                >
                  {car.year}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#d4af37",
                  }}
                >
                  ₹{car.pricePerDay}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span
                    style={{
                      background: car.available ? "rgba(76,175,80,0.1)" : "rgba(234,67,53,0.1)",
                      color: car.available ? "#4caf50" : "#ea4335",
                      border: car.available ? "1px solid rgba(76,175,80,0.25)" : "1px solid rgba(234,67,53,0.25)",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 20,
                    }}
                  >
                    {car.available ? "Available" : "Not Available"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => openEdit(car)}
                      style={{
                        padding: "7px 14px",
                        background: "rgba(212,175,55,0.1)",
                        border: "1px solid rgba(212,175,55,0.25)",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        color: "#d4af37",
                        transition: "all 0.3s ease",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(car._id)}
                      style={{
                        padding: "7px 14px",
                        background: "rgba(234,67,53,0.1)",
                        border: "1px solid rgba(234,67,53,0.25)",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        color: "#ea4335",
                        transition: "all 0.3s ease",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {cars.filter((car) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                (car.brand || "").toLowerCase().includes(q) ||
                (car.model || "").toLowerCase().includes(q) ||
                `${car.brand} ${car.model}`.toLowerCase().includes(q)
              );
            }).length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 14,
                  }}
                >
                  {searchQuery.trim() ? `No cars matching "${searchQuery}"` : "No cars found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Add New Car" onClose={() => setShowAdd(false)}>
          <CarForm
            form={form}
            handleField={handleField}
            images={images}
            setImages={setImages}
            fileRef={fileRef}
            loading={loading}
            onSubmit={handleAdd}
            submitLabel="Add Car"
          />
        </Modal>
      )}

      {editCar && (
        <Modal
          title={`Edit — ${editCar.brand} ${editCar.model}`}
          onClose={() => setEditCar(null)}
        >
          <CarForm
            form={form}
            handleField={handleField}
            images={images}
            setImages={setImages}
            fileRef={fileRef}
            loading={loading}
            onSubmit={handleUpdate}
            submitLabel="Save Changes"
          />
        </Modal>
      )}
    </div>
  );
};

const CarForm = ({
  form,
  handleField,
  images,
  setImages,
  fileRef,
  loading,
  onSubmit,
  submitLabel,
}) => {
  return (
    <div>
      <div
        style={{
          background: "rgba(212,175,55,0.04)",
          padding: "20px",
          borderRadius: "14px",
          marginBottom: "20px",
          border: "1px solid rgba(212,175,55,0.1)",
        }}
      >
        <h4 style={{ marginBottom: "16px", color: "#d4af37", fontFamily: "'Cinzel',serif", letterSpacing: "1px", textTransform: "uppercase", fontSize: 14 }}>
          Car Information
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "16px",
          }}
        >
          <Field label="Brand">
            <input
              style={inputStyle}
              value={form.brand}
              onChange={(e) => handleField("brand", e.target.value)}
              placeholder="BMW"
            />
          </Field>
          <Field label="Model">
            <input
              style={inputStyle}
              value={form.model}
              onChange={(e) => handleField("model", e.target.value)}
              placeholder="X5"
            />
          </Field>
          <Field label="Location">
            <input
              style={inputStyle}
              value={form.location}
              onChange={(e) => handleField("location", e.target.value)}
              placeholder="Kolkata"
            />
          </Field>
          <Field label="Fuel Type">
            <select
              style={inputStyle}
              value={form.fuelType}
              onChange={(e) => handleField("fuelType", e.target.value)}
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </Field>
          <Field label="Transmission">
            <select
              style={inputStyle}
              value={form.transmission}
              onChange={(e) => handleField("transmission", e.target.value)}
            >
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </Field>
          <Field label="Seats">
            <input
              style={inputStyle}
              type="number"
              value={form.seats}
              onChange={(e) => handleField("seats", e.target.value)}
            />
          </Field>
          <Field label="Year">
            <input
              style={inputStyle}
              type="number"
              value={form.year}
              onChange={(e) => handleField("year", e.target.value)}
            />
          </Field>
          <Field label="Price Per Day">
            <input
              style={inputStyle}
              type="number"
              value={form.pricePerDay}
              onChange={(e) => handleField("pricePerDay", e.target.value)}
              placeholder="2000"
            />
          </Field>
          <Field label="Available">
            <select
              style={inputStyle}
              value={form.available}
              onChange={(e) =>
                handleField(
                  "available",
                  e.target.value === "true" || e.target.value === true,
                )
              }
            >
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>
          </Field>
        </div>
      </div>

      <div
        style={{
          background: "rgba(212,175,55,0.04)",
          padding: "20px",
          borderRadius: "14px",
          marginBottom: "20px",
          border: "1px solid rgba(212,175,55,0.1)",
        }}
      >
        <h4 style={{ marginBottom: "16px", color: "#d4af37", fontFamily: "'Cinzel',serif", letterSpacing: "1px", textTransform: "uppercase", fontSize: 14 }}>Car Images</h4>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: "2px dashed rgba(212,175,55,0.4)",
            borderRadius: "12px",
            padding: "30px",
            textAlign: "center",
            cursor: "pointer",
            background: "rgba(212,175,55,0.03)",
            transition: "all 0.3s ease",
          }}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
          />
          <h4 style={{ color: "rgba(255,255,255,0.8)", margin: "0 0 8px" }}>Click To Upload Images</h4>
          <p style={{ color: "rgba(255,255,255,0.4)", margin: 0 }}>Maximum 5 images</p>
          {images.length > 0 && (
            <p style={{ color: "#d4af37", fontWeight: "600", marginTop: 8, marginBottom: 0 }}>
              {images.length} files selected
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          style={{ ...btnGold, minWidth: "180px" }}
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
//  SECTION: Bookings
// ────────────────────────────────────────────────────────────
const BookingsSection = () => {
  const [bookings, setBookings] = useState([]);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API}/bookings/all`, {
        headers: authHeaders(),
      });
      setBookings(res.data.bookings);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => {
      fetchBookings();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this booking? The car will become available again.",
      )
    )
      return;
    await axios.delete(`${API}/bookings/delete/${id}`, {
      headers: authHeaders(),
    });
    fetchBookings();
  };

  const openStatus = (booking) => {
    if (!booking) return;
    setStatusModal(booking);
    setNewStatus(booking.bookingStatus || "Pending");
  };

  const handleUpdateStatus = async () => {
    try {
      if (!statusModal?._id) return;
      if (newStatus === "Approved") {
        await axios.put(
          `${API}/admin/booking/approve/${statusModal._id}`,
          {},
          { headers: authHeaders() },
        );
      } else if (newStatus === "Rejected") {
        await axios.put(
          `${API}/admin/booking/reject/${statusModal._id}`,
          {},
          { headers: authHeaders() },
        );
      }
      setStatusModal(null);
      fetchBookings();
    } catch (error) {
      console.log(error);
    }
  };

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 22,
            fontWeight: 600,
            color: "#fff",
            margin: 0,
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Booking Management
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>
          {bookings.length} total bookings
        </p>
      </div>

      <div
        style={{
          background: "#0d0d0d",
          borderRadius: 16,
          border: "1px solid rgba(212,175,55,0.12)",
          overflow: "auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}
        >
          <thead>
            <tr style={{ background: "#0f1117" }}>
              {[
                "Customer",
                "Car",
                "Pickup",
                "Return",
                "Amount",
                "Booking Status",
                "Payment Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#d4af37",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => (
              <tr
                key={b._id}
                style={{
                  background: i % 2 === 0 ? "transparent" : "rgba(212,175,55,0.03)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <td style={{ padding: "14px 16px" }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#fff",
                    }}
                  >
                    {b.userId?.name || "—"}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    {b.userId?.email || ""}
                  </p>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    {b.carId?.brand} {b.carId?.model}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    ₹{b.carId?.pricePerDay}/day
                  </p>
                </td>
                <td
                  style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}
                >
                  {fmt(b.pickupDate)}
                </td>
                <td
                  style={{ padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}
                >
                  {fmt(b.returnDate)}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#d4af37",
                  }}
                >
                  ₹{b.totalAmount?.toLocaleString()}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <Badge status={b.bookingStatus || "pending"} />
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <Badge
                    status={
                      b.paymentStatus === "Paid" ? "completed" : "pending"
                    }
                  />
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {b.paymentStatus === "Paid" ? (
                    <span
                      style={{
                        background: "rgba(76,175,80,0.1)",
                        color: "#4caf50",
                        border: "1px solid rgba(76,175,80,0.25)",
                        fontSize: "12px",
                        fontWeight: "700",
                        padding: "7px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      Payment Completed — Locked
                    </span>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openStatus(b)}
                        style={{
                          padding: "7px 12px",
                          background: "rgba(212,175,55,0.1)",
                          border: "1px solid rgba(212,175,55,0.25)",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          color: "#d4af37",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Status
                      </button>

                      <button
                        onClick={() => handleDelete(b._id)}
                        style={{
                          padding: "7px 12px",
                          background: "rgba(234,67,53,0.1)",
                          border: "1px solid rgba(234,67,53,0.25)",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          color: "#ea4335",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "#bbb",
                    fontSize: 14,
                  }}
                >
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {statusModal && (
        <Modal
          title="Update Booking Status"
          onClose={() => setStatusModal(null)}
        >
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "0 0 4px" }}>
              <strong style={{ color: "#fff" }}>{statusModal?.userId?.name || "User"}</strong> -{" "}
              {statusModal?.carId?.brand || ""}{" "}
              {statusModal?.carId?.model || ""}
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
              Current Status : {statusModal?.bookingStatus || "Pending"}
            </p>
          </div>
          <Field label="New Status">
            <select
              style={inputStyle}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </Field>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 20,
            }}
          >
            <button
              onClick={() => setStatusModal(null)}
              style={{
                padding: "10px 16px",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                cursor: "pointer",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.7)",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 13,
                transition: "all 0.3s ease",
              }}
            >
              Cancel
            </button>
            <button onClick={handleUpdateStatus} style={btnGold}>
              Update
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────
//  SECTION: Overview stats
// ────────────────────────────────────────────────────────────
const OverviewSection = () => {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/cars`)
      .then((r) => setCars(r.data.data))
      .catch(() => {});
    axios
      .get(`${API}/bookings/all`, { headers: authHeaders() })
      .then((r) => setBookings(r.data.bookings))
      .catch(() => {});
  }, []);

  const totalRevenue = bookings.reduce(
    (acc, b) => acc + (b.totalAmount || 0),
    0,
  );
  const availableCars = cars.filter((c) => c.available).length;
  const historyBookings = bookings.filter((b) =>
    ["completed", "rejected", "cancelled"].includes(
      b.bookingStatus?.toLowerCase(),
    ),
  ).length;

  const stats = [
    { label: "Total Cars", value: cars.length, icon: "" },
    { label: "Total Bookings", value: bookings.length, icon: "" },
    { label: "History Bookings", value: historyBookings, icon: "" },
    { label: "Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: "" },
  ];

  const recent = [...bookings].slice(0, 5);
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })
      : "—";

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Cinzel',serif",
          fontSize: 22,
          fontWeight: 600,
          color: "#fff",
          margin: "0 0 24px",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        Overview
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "#0d0d0d",
              borderRadius: 14,
              border: "1px solid rgba(212,175,55,0.12)",
              padding: "20px 18px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                marginBottom: 4,
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 24,
                fontFamily: "'Cinzel',serif",
                fontWeight: 600,
                color: "#d4af37",
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h3
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 18,
            fontWeight: 500,
            color: "#fff",
            margin: "0 0 16px",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Recent Bookings
        </h3>
        <div
          style={{
            background: "#0d0d0d",
            borderRadius: 16,
            border: "1px solid rgba(212,175,55,0.12)",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0f1117" }}>
                {["Customer", "Car", "Pickup", "Amount", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#d4af37",
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((b, i) => (
                <tr
                  key={b._id}
                  style={{
                    background: i % 2 === 0 ? "transparent" : "rgba(212,175,55,0.03)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#fff",
                    }}
                  >
                    {b.userId?.name || "—"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {b.carId?.brand} {b.carId?.model}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {fmt(b.pickupDate)}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#d4af37",
                    }}
                  >
                    ₹{b.totalAmount?.toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge status={b.bookingStatus || "pending"} />
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 32,
                      textAlign: "center",
                      color: "#bbb",
                      fontSize: 14,
                    }}
                  >
                    No recent bookings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
//  SECTION: History
// ────────────────────────────────────────────────────────────
const HistorySection = () => {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/admin/booking-history`, {
        headers: authHeaders(),
      });
      setHistory(res.data.history || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(() => {
      fetchHistory();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: "28px", marginBottom: "20px", color: "#fff", fontFamily: "'Cinzel',serif", letterSpacing: "1px", textTransform: "uppercase" }}>
        Booking History
      </h2>
      <div
        style={{
          background: "#0d0d0d",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(212,175,55,0.12)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0f1117" }}>
              {["Customer", "Car", "Amount", "Status", "Date"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "15px",
                    color: "#d4af37",
                    textAlign: "left",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((item) => (
                <tr key={item._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "15px", color: "#fff" }}>{item.customerName}</td>
                  <td style={{ padding: "15px", color: "rgba(255,255,255,0.7)" }}>{item.carName}</td>
                  <td style={{ padding: "15px", color: "#d4af37", fontWeight: 600 }}>₹{item.totalAmount}</td>
                  <td style={{ padding: "15px", color: "rgba(255,255,255,0.7)" }}>{item.status}</td>
                  <td style={{ padding: "15px", color: "rgba(255,255,255,0.5)" }}>
                    {new Date(item.actionDate).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  No Booking History Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const adminName = (() => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return "Admin";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.name || "Admin";
    } catch {
      return "Admin";
    }
  })();

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login-admin");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={15} /> },
    { id: "cars", label: "Fleet", icon: <Car size={15} /> },
    { id: "bookings", label: "Bookings", icon: <CalendarRange size={15} /> },
    { id: "history", label: "History", icon: <History size={15} /> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; background: #060606; }
        
        /* Root Wrapper */
        .adm-root { 
          min-height: 100vh; 
          background: #060606 !important; 
          color: #ffffff !important;
          font-family: 'Outfit', sans-serif; 
          display: flex; 
          flex-direction: column; 
        }
        
        /* Top Navigation Header */
        .adm-topbar { 
          background: #000000 !important; 
          padding: 0 32px; 
          height: 72px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          position: sticky; 
          top: 0; 
          z-index: 100; 
          border-bottom: 1px solid rgba(212,175,55,0.15) !important; 
        }
        
        .adm-brand { 
          font-family: 'Cinzel', serif !important; 
          font-size: 1.25rem; 
          font-weight: 700; 
          color: #fff !important; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        
        .adm-topright { display: flex; align-items: center; gap: 20px; }
        .adm-admin-name { font-size: 13px; color: rgba(255,255,255,0.5); }
        .adm-admin-name strong { color: #d4af37; }
        
        .adm-logout { 
          background: rgba(255,255,255,0.03) !important; 
          border: 1px solid rgba(255,255,255,0.08) !important; 
          color: rgba(255,255,255,0.7) !important; 
          border-radius: 8px; 
          padding: 8px 16px; 
          font-family: 'Outfit', sans-serif; 
          font-size: 12px; 
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer; 
          transition: all 0.3s ease; 
        }
        .adm-logout:hover { 
          background: rgba(212,175,55,0.1) !important; 
          border-color: rgba(212,175,55,0.3) !important; 
          color: #d4af37 !important; 
        }
        
        /* Tab Navigation */
        .adm-tabnav { 
          background: #0b0b0b !important; 
          border-bottom: 1px solid rgba(212,175,55,0.1) !important; 
          padding: 0 32px; 
          display: flex; 
          gap: 8px; 
          overflow-x: auto;
        }
        
        .adm-tab { 
          padding: 18px 24px; 
          border: none; 
          background: none; 
          font-family: 'Outfit', sans-serif; 
          font-size: 13px; 
          font-weight: 600; 
          color: rgba(255,255,255,0.45) !important; 
          cursor: pointer; 
          border-bottom: 3px solid transparent; 
          transition: all 0.3s ease; 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .adm-tab:hover { color: #fff !important; }
        .adm-tab.active { 
          color: #d4af37 !important; 
          border-bottom-color: #d4af37 !important; 
        }
        
        /* Main Workspace Container */
        .adm-content { 
          flex: 1; 
          max-width: 1400px; 
          margin: 0 auto; 
          padding: 40px 32px 80px; 
          width: 100%; 
        }
        
        /* Target H2/H3 */
        .adm-content h2 {
          font-family: 'Cinzel', serif !important;
          color: #fff !important;
          font-size: 20px !important;
          letter-spacing: 1px !important;
          text-transform: uppercase;
          margin-bottom: 24px !important;
        }
        
        .adm-content h3 {
          font-family: 'Cinzel', serif !important;
          color: #fff !important;
          font-size: 16px !important;
          letter-spacing: 1px !important;
          text-transform: uppercase;
        }
        
        /* Override inline background cards (Overview stats blocks and list wrappers) */
        .adm-content div[style*="background: #fff"],
        .adm-content div[style*="background: rgb(255, 255, 255)"],
        .adm-content div[style*="background: white"],
        .adm-content div[style*="background-color: #fff"],
        .adm-content div[style*="background-color: rgb(255, 255, 255)"] {
          background: #0d0d0d !important;
          border: 1px solid rgba(212,175,55,0.12) !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
          overflow: auto !important; /* Forces responsive scrollbars on tables */
        }
        
        /* Text overrides inside overview cards */
        .adm-content div[style*="background: #fff"] p,
        .adm-content div[style*="background: rgb(255, 255, 255)"] p {
          color: #fff !important;
        }
        .adm-content div[style*="background: #fff"] p[style*="color: #999"],
        .adm-content div[style*="background: rgb(255, 255, 255)"] p[style*="color: rgb(153, 153, 153)"] {
          color: rgba(255,255,255,0.45) !important;
          font-weight: 600 !important;
          letter-spacing: 1px !important;
        }
        
        /* Tables Override */
        .adm-content table {
          background: transparent !important;
          border-collapse: collapse !important;
          width: 100% !important;
        }
        
        .adm-content thead tr,
        .adm-content tr[style*="background: #0f1117"],
        .adm-content tr[style*="background: rgb(15, 17, 23)"] {
          background: #000000 !important;
          border-bottom: 2px solid rgba(212,175,55,0.2) !important;
        }
        
        .adm-content th {
          color: #d4af37 !important;
          font-size: 11px !important;
          letter-spacing: 1px !important;
          text-transform: uppercase !important;
          padding: 14px 16px !important;
          border: none !important;
        }
        
        .adm-content tr {
          background: transparent !important;
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
          transition: background 0.2s ease;
        }
        
        .adm-content tr:hover {
          background: rgba(212,175,55,0.02) !important;
        }
        
        .adm-content td {
          color: rgba(255,255,255,0.8) !important;
          padding: 14px 16px !important;
          border: none !important;
          font-size: 13px !important;
          vertical-align: middle !important;
        }

        /* Modals and Modal Content fields */
        div[style*="position: fixed"] input,
        div[style*="position: fixed"] select,
        div[style*="position: fixed"] textarea {
          background: #050505 !important;
          border: 1px solid rgba(212, 175, 55, 0.25) !important;
          color: #fff !important;
        }
        
        /* Custom golden scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #060606; }
        ::-webkit-scrollbar-thumb { background: #d4af37; border-radius: 3px; }
      `}</style>

      <div className="adm-root">
        <div className="adm-topbar">
          <div className="adm-brand">
            <span style={{ color: "#d4af37", fontWeight: "bold" }}>Royal Route </span>Admin
          </div>
          <div className="adm-topright">
            <span className="adm-admin-name">
              Logged in as <strong>{adminName}</strong>
            </span>
            <button className="adm-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <button
            onClick={() => navigate("/admin/admin-ai")}
            style={{
              background: "linear-gradient(135deg, #d4af37, #f5d76e)",
              color: "#000",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1px",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Sparkles size={13} />
            Open AI Agent
          </button>
        </div>

        <div className="adm-tabnav">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`adm-tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="adm-content">
          {activeTab === "overview" && <OverviewSection />}
          {activeTab === "cars" && <CarsSection />}
          {activeTab === "bookings" && <BookingsSection />}
          {activeTab === "history" && <HistorySection />}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
