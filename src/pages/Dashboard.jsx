import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { authContext } from "../context/contextApi";

const Dashboard = () => {
  const { name } = React.useContext(authContext);
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);

  const [avelableCars, setAvelableCars] = useState([]);

  //Filter
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [fuel, setFuel] = useState("");
  const [seat, setSeat] = useState("");
  const [sort, setSort] = useState("");

  // pagination
  const [selectedImages, setSelectedImages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const carsPerPage = 12;

  // searching
  const [searchTerm, setSearchTerm] = useState("");

  // Derive unique brand list dynamically from available cars
  const brandOptions = Array.from(
    new Set(avelableCars.map((c) => c.brand).filter(Boolean))
  ).sort();

  const fuelOptions = Array.from(
    new Set(avelableCars.map((c) => c.fuelType).filter(Boolean))
  ).sort();

  const seatOptions = Array.from(
    new Set(avelableCars.map((c) => c.seats).filter(Boolean))
  ).sort((a, b) => a - b);

  const filteredCars = avelableCars.filter((car) => {
    // Search
    const searchMatch = `${car.brand} ${car.model}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Brand
    const brandMatch = brand === "" || car.brand === brand;

    // Fuel
    const fuelMatch = fuel === "" || car.fuelType === fuel;

    // Seats
    const seatMatch = seat === "" || car.seats === Number(seat);

    // Price
    let priceMatch = true;

    switch (price) {
      case "0-3000":
        priceMatch = car.pricePerDay <= 3000;
        break;

      case "3000-5000":
        priceMatch = car.pricePerDay >= 3000 && car.pricePerDay <= 5000;
        break;

      case "5000-8000":
        priceMatch = car.pricePerDay >= 5000 && car.pricePerDay <= 8000;
        break;

      case "8000+":
        priceMatch = car.pricePerDay >= 8000;
        break;

      default:
        priceMatch = true;
    }

    return searchMatch && brandMatch && fuelMatch && seatMatch && priceMatch;
  });

  //Sorting
  let finalCars = [...filteredCars];

  switch (sort) {
    case "low":
      finalCars.sort((a, b) => a.pricePerDay - b.pricePerDay);
      break;

    case "high":
      finalCars.sort((a, b) => b.pricePerDay - a.pricePerDay);
      break;

    case "brand":
      finalCars.sort((a, b) => a.brand.localeCompare(b.brand));
      break;

    case "newest":
      finalCars.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      break;

    default:
      break;
  }

  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = finalCars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(finalCars.length / carsPerPage) || 1;

  // Keep currentPage within valid range whenever filters/sort change the result set
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const fetchCars = async (isFirstLoad = false) => {
    try {
      if (isFirstLoad) {
        setLoading(true);
      }
      const res = await axios.get("http://localhost:8000/cars");

      const data = res.data.data;

      setCars(data);
      setAvelableCars(data.filter((e) => e.available));
    } catch (error) {
      console.log(error);
    } finally {
      if (isFirstLoad) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCars(true);
    const interval = setInterval(() => {
      fetchCars(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getFirstName = (fullName) => fullName?.split(" ")[0] || "Guest";

  const handleBookNow = (car) => {
    navigate(`/user/booking/${car._id}`, { state: { car } });
  };

  const handleReset = () => {
    setSearchTerm("");
    setBrand("");
    setPrice("");
    setFuel("");
    setSeat("");
    setSort("");
    setCurrentPage(1);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ---------- Premium Filter Bar ---------- */

.filter-bar{
    display:flex;
    flex-wrap:wrap;
    gap:16px;
    justify-content:center;
    align-items:center;
    margin-top:-20px;
    margin-bottom:45px;
}

.filter-select{
    min-width:180px;
    height:52px;
    padding:0 18px;
    border-radius:14px;
    outline:none;
    cursor:pointer;

    background:rgba(255,255,255,.03);
    border:1px solid rgba(212,175,55,.25);

    color:#fff;
    font-size:14px;

    transition:.3s;
    backdrop-filter:blur(8px);
}

.filter-select:hover{
    border-color:#d4af37;
}

.filter-select:focus{
    border-color:#d4af37;
    box-shadow:0 0 18px rgba(212,175,55,.18);
}

.filter-select option{
    background:#101010;
    color:white;
}

.reset-btn{
    height:52px;
    padding:0 30px;

    border:none;
    border-radius:14px;

    background:#d4af37;
    color:#000;

    font-weight:600;
    cursor:pointer;

    transition:.3s;
}

.reset-btn:hover{
    transform:translateY(-2px);
    background:#f1cb4b;
}

.sort-select{
    margin-left:auto;
}

@media(max-width:768px){

.filter-bar{
justify-content:stretch;
}

.filter-select,
.reset-btn{
width:100%;
}
}
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { min-height: 100%; background: #070708; }

        .dash-root {
          min-height: 100vh;
          width: 100%;
          background: radial-gradient(circle at 50% 0%, #141416 0%, #070708 100%);
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          display: flex;
          flex-direction: column;
        }

        /* ── Hero ── */
        .dash-hero {
          width: 100%;
          border-bottom: 1px solid rgba(212,175,55,0.15);
          padding: 60px max(20px, 4%);
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
        }
        .dash-hero-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
        }
        .dash-greeting-label {
          font-size: 11px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #d4af37;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .dash-greeting-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4.5vw, 44px);
          font-weight: 600;
          line-height: 1.1;
          color: #fff;
        }
        .dash-greeting-name span { color: #d4af37; }
        .dash-hero-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          margin-top: 8px;
          font-weight: 300;
        }
        .dash-hero-badge {
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 100px;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #d4af37;
          font-size: 13px;
          font-weight: 500;
          background: rgba(212,175,55,0.04);
        }
        .dash-badge-dot {
          width: 8px;
          height: 8px;
          background: #d4af37;
          border-radius: 50%;
          box-shadow: 0 0 10px #d4af37;
        }
 
        /* ── Main Layout Content Container ── */
        .dash-container {
          max-width: 1440px;
          width: 100%;
          margin: 0 auto;
          padding: 40px max(20px, 4%);
          flex: 1;
        }

        /* ── Search Bar UI ── */
        .search-wrapper {
          margin-bottom: 48px;
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .search-input {
          width: 100%;
          max-width: 540px;
          padding: 16px 24px;
          border-radius: 14px;
          border: 1px solid rgba(212,175,55,0.3);
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }
        .search-input:focus {
          border-color: #d4af37;
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 20px rgba(212,175,55,0.15);
        }

        /* ── Section Header ── */
        .dash-section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 16px;
        }
        .dash-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 500;
        }
        .dash-count {
          background: rgba(212,175,55,0.1);
          color: #d4af37;
          font-size: 12px;
          font-weight: 600;
          padding: 2px 10px;
          border-radius: 100px;
          border: 1px solid rgba(212,175,55,0.2);
        }

        /* ── Height & Width Unified Responsive Grid ── */
        .dash-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 32px;
          align-items: stretch; /* Cards instantly match height across layout rows */
        }

        /* ── Premium Refined Card ── */
        .car-card {
          background: rgba(18, 18, 18, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column; /* Organizes card dynamic content downwards */
          justify-content: space-between;
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .car-card:hover {
          transform: translateY(-10px) scale(1.015);
          border-color: rgba(212, 175, 55, 0.45);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(212, 175, 55, 0.15);
        }
        .car-card.unavailable { 
          opacity: 0.45; 
        }
        .car-card.unavailable:hover {
          transform: none;
          border-color: rgba(255,255,255,0.06);
          box-shadow: none;
        }

        /* ── Image & Ratio Controls ── */
        .car-main-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10; /* Fixed standard image ratio constraints */
          background: #000;
          overflow: hidden;
        }
        .car-main-img-wrap::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 35%;
          background: linear-gradient(to top, rgba(18, 18, 18, 0.95) 0%, transparent 100%);
          pointer-events: none;
          z-index: 1;
        }
        .car-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .car-card:hover .car-main-img { 
          transform: scale(1.06); 
        }

        /* ── Badges ── */
        .car-availability-badge,
        .unavailable-badge {
          position: absolute;
          top: 18px;
          left: 18px;
          z-index: 2;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 30px;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .car-availability-badge {
          background: rgba(7, 7, 8, 0.85);
          color: #d4af37;
          border: 1px solid rgba(212,175,55,0.4);
        }
        .unavailable-badge {
          background: rgba(197, 49, 49, 0.9);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* ── Dynamic Layout Thumbnails ── */
        .car-thumbs {
          display: flex;
          gap: 10px;
          padding: 12px 24px;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .car-thumbs::-webkit-scrollbar { display: none; }
        .car-thumb {
          width: 52px;
          height: 36px;
          flex-shrink: 0;
          object-fit: cover;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0.45;
        }
        .car-thumb:hover { 
          opacity: 0.85; 
          transform: scale(1.03);
        }
        .car-thumb.active { 
          border-color: #d4af37; 
          opacity: 1; 
          transform: scale(1.06); 
          box-shadow: 0 0 8px rgba(212, 175, 55, 0.3);
        }

        /* ── Card Body Flow ── */
        .car-body { 
          padding: 24px; 
          display: flex;
          flex-direction: column;
          flex-grow: 1; /* Pushes content boundaries to match structural grid row sizes */
        }
        .car-name {
          font-family: 'Outfit', 'Inter', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }
        .car-location {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ── Responsive Pill Specs ── */
        .car-specs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }
        .spec-pill {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.75);
          font-size: 12px;
          font-weight: 500;
          padding: 9px 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: all 0.2s ease;
        }
        .spec-pill:hover {
          background: rgba(212, 175, 55, 0.05);
          border-color: rgba(212, 175, 55, 0.15);
          color: #ffffff;
        }

        /* ── Price Alignment Block ── */
        .car-footer-wrapper {
          margin-top: auto; /* Locks price & button to baseline bottom across uneven text descriptions */
        }
        .car-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 0;
          margin-bottom: 18px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .car-price {
          font-family: 'Outfit', 'Inter', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #d4af37;
        }
        .car-price-unit {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-left: 2px;
          font-weight: 500;
        }
        .car-price-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 30px;
          background: rgba(212,175,55,0.08);
          color: #d4af37;
          border: 1px solid rgba(212,175,55,0.15);
          letter-spacing: 0.5px;
        }
        .booked-tag {
          font-size: 11px;
          color: #e55353;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        /* ── Luxury Buttons ── */
        .book-btn {
          width: 100%;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 15px;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          background: linear-gradient(135deg, #FFE885 0%, #d4af37 100%);
          color: #070708;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
        }
        .book-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #ffffff 0%, #d4af37 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(212,175,55,0.35);
        }
        .book-btn:active:not(:disabled) { 
          transform: translateY(0); 
        }
        
        .book-btn.unavailable-btn {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.2);
          box-shadow: none;
          cursor: not-allowed;
        }

        .unavailable-notice {
          font-size: 11px;
          color: #e55353;
          text-align: center;
          margin-top: 12px;
          opacity: 0.8;
          font-weight: 500;
        }

        /* ── Loaders & Fallbacks ── */
        .dash-loading {
          text-align: center;
          padding: 100px 20px;
          color: rgba(255,255,255,0.5);
          font-size: 16px;
          letter-spacing: 1px;
        }
        .empty-state {
          text-align: center;
          padding: 100px 20px;
          color: rgba(255,255,255,0.4);
          background: rgba(255, 255, 255, 0.01);
          border-radius: 20px;
          border: 1px dashed rgba(255,255,255,0.08);
        }
        .empty-state-icon { font-size: 40px; margin-bottom: 16px; }

        /* ── Pagination UI ── */
        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 56px;
          flex-wrap: wrap;
        }
        .page-nav-btn {
          width: auto !important;
          padding: 12px 24px !important;
        }

        /* ── Footer ── */
        footer {
          background: #000;
          border-top: 1px solid rgba(212,175,55,0.15);
          padding: 32px 20px;
          text-align: center;
          margin-top: auto;
        }
        .footer-brand {
          color: #d4af37;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }
        .footer-credit { color: rgba(255,255,255,0.4); font-size: 12px; }

        /* ── Dynamic Width Breakpoints ── */
        @media (max-width: 768px) {
          .dash-hero { padding: 40px 20px; }
          .search-wrapper { margin-bottom: 32px; }
          .dash-hero-badge { width: 100%; justify-content: center; }
          .car-specs { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (max-width: 480px) {
          .dash-grid { grid-template-columns: 1fr; }
          .car-specs { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash-root">
        {/* Hero Banner Header */}
        <div className="dash-hero">
          <div className="dash-hero-inner">
            <div>
              <p className="dash-greeting-label">Welcome back</p>
              <h1 className="dash-greeting-name">
                Hello, <span>{getFirstName(name)}</span>
              </h1>
              <p className="dash-hero-sub">
                Find your perfect ride for the journey ahead.
              </p>
            </div>
            <div className="dash-hero-badge">
              <span className="dash-badge-dot" />
              {avelableCars.length}{" "}
              {avelableCars.length === 0 ? "Not Available" : "Available"} listed
            </div>

            <div className="dash-hero-badge">
              <span className="dash-badge-dot" />
              {cars.length} {cars.length === 1 ? "vehicle" : "vehicles"} listed
            </div>
          </div>
        </div>

        {/* Core Main Content Body */}
        <div className="dash-container">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search by brand or model..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filters */}
          <div className="filter-bar">
            <select
              className="filter-select"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Brands</option>
              {brandOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Price</option>
              <option value="0-3000">₹0 - ₹3000</option>
              <option value="3000-5000">₹3000 - ₹5000</option>
              <option value="5000-8000">₹5000 - ₹8000</option>
              <option value="8000+">₹8000+</option>
            </select>

            <select
              className="filter-select"
              value={fuel}
              onChange={(e) => {
                setFuel(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Fuel</option>
              {fuelOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={seat}
              onChange={(e) => {
                setSeat(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Seats</option>
              {seatOptions.map((s) => (
                <option key={s} value={s}>
                  {s} Seats
                </option>
              ))}
            </select>

            <button className="reset-btn" onClick={handleReset}>
              Reset
            </button>
          </div>

          <div
            className="dash-section-header"
            style={{
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <h2 className="dash-section-title">Available Cars</h2>

              <span className="dash-count">{finalCars.length}</span>
            </div>

            <select
              className="filter-select sort-select"
              style={{
                maxWidth: "220px",
              }}
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest First</option>
              <option value="low">Price Low → High</option>
              <option value="high">Price High → Low</option>
              <option value="brand">Brand A-Z</option>
            </select>
          </div>

          {loading ? (
            <div className="dash-loading">Loading luxury fleet...</div>
          ) : cars.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>No cars available at the moment.</p>
            </div>
          ) : finalCars.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">❌</div>
              <p>No matches found for "{searchTerm}"</p>
            </div>
          ) : (
            <>
              <div className="dash-grid">
                {currentCars.map((car) => {
                  const activeImg = selectedImages[car._id] ?? car.images?.[0];
                  const isAvailable = car.available;

                  return (
                    <div
                      className={`car-card ${!isAvailable ? "unavailable" : ""}`}
                      key={car._id}
                    >
                      <div>
                        <div className="car-main-img-wrap">
                          <img
                            src={activeImg}
                            alt={`${car.brand} ${car.model}`}
                            className="car-main-img"
                          />
                          {isAvailable ? (
                            <div className="car-availability-badge">
                              Available
                            </div>
                          ) : (
                            <div className="unavailable-badge">Unavailable</div>
                          )}
                        </div>

                        {car.images?.length > 1 && (
                          <div className="car-thumbs">
                            {car.images.map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                alt={`view-${index + 1}`}
                                className={`car-thumb ${activeImg === img ? "active" : ""}`}
                                onClick={() => {
                                  if (!isAvailable) return;
                                  setSelectedImages((prev) => ({
                                    ...prev,
                                    [car._id]: img,
                                  }));
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="car-body">
                        <div>
                          <h3 className="car-name">
                            {car.brand} {car.model}
                          </h3>
                          <p className="car-location">
                            <span>📍</span> {car.location}
                          </p>

                          <div className="car-specs">
                            <span
                              className="spec-pill"
                              title={car.transmission}
                            >
                              ⚙️ {car.transmission}
                            </span>
                            <span className="spec-pill" title={car.fuelType}>
                              ⛽ {car.fuelType}
                            </span>
                            <span className="spec-pill">
                              💺 {car.seats} seats
                            </span>
                            <span className="spec-pill">📅 {car.year}</span>
                          </div>
                        </div>

                        <div className="car-footer-wrapper">
                          <div className="car-price-row">
                            <div>
                              <span className="car-price">
                                ₹{car.pricePerDay}
                              </span>
                              <span className="car-price-unit">/ day</span>
                            </div>
                            {isAvailable ? (
                              <span className="car-price-tag">Best Price</span>
                            ) : (
                              <span className="booked-tag">
                                Not Available
                              </span>
                            )}
                          </div>

                          <button
                            className={`book-btn ${!isAvailable ? "unavailable-btn" : ""}`}
                            onClick={() => isAvailable && handleBookNow(car)}
                            disabled={!isAvailable}
                          >
                            {isAvailable ? (
                              <>View &amp; Book →</>
                            ) : (
                              <>Not Available</>
                            )}
                          </button>

                          {!isAvailable && (
                            <p className="unavailable-    mybooking page notice">
                              This car is currently unavailable for booking.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Flow Pagination Block */}
              {filteredCars.length > carsPerPage && (
                <div className="pagination-container">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="book-btn page-nav-btn"
                    style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
                  >
                    ← Previous
                  </button>

                  <span
                    style={{
                      color: "#d4af37",
                      fontWeight: "600",
                      fontSize: "15px",
                    }}
                  >
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="book-btn page-nav-btn"
                    style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <footer>
          <p className="footer-brand">
            © {new Date().getFullYear()} Royal Route. All rights reserved.
          </p>
          <p className="footer-credit">
            Designed &amp; Developed by Supain Nandy
          </p>
        </footer>
      </div>
    </>
  );
};

export default Dashboard;