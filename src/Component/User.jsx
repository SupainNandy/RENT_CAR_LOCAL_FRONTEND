import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { authContext } from "../context/contextApi";

const User = () => {
  const { setLoggedIn, setName } = useContext(authContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    setLoggedIn(false);
    setName("");
    window.location.href = "/login-user";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500&display=swap');

        :root {
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --gold-dim: #8a6f30;
          --black: #0a0a0a;
          --black-mid: #111111;
          --black-soft: #1a1a1a;
        }

        .cr-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--black);
          border-bottom: 1px solid transparent;
          transition: all 0.4s ease;
          font-family: 'Raleway', sans-serif;
        }

        .cr-navbar.scrolled {
          background: rgba(10, 10, 10, 0.97);
          border-bottom: 1px solid var(--gold-dim);
          box-shadow: 0 4px 30px rgba(201, 168, 76, 0.08);
          backdrop-filter: blur(12px);
        }

        .cr-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }

        /* Brand */
        .cr-brand {
          text-decoration: none !important;
          display: flex;
          flex-direction: column;
          line-height: 1;
          gap: 1px;
        }
        .cr-brand-main {
          font-family: 'Cinzel', serif;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: var(--gold);
          text-transform: uppercase;
          transition: color 0.3s ease;
        }
        .cr-brand-sub {
          font-size: 0.58rem;
          letter-spacing: 0.35em;
          color: #666;
          text-transform: uppercase;
          font-weight: 400;
          margin-top: 3px;
        }
        .cr-brand:hover .cr-brand-main {
          color: var(--gold-light);
        }

        /* Divider ornament */
        .cr-ornament {
          height: 32px;
          width: 1px;
          background: linear-gradient(to bottom, transparent, var(--gold-dim), transparent);
          display: none;
        }

        /* Nav links */
        .cr-nav-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .cr-nav-links a,
        .cr-nav-links button {
          display: inline-block;
          padding: 0.5rem 1.1rem;
          font-family: 'Raleway', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #aaa;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
          transition: color 0.25s ease;
        }

        .cr-nav-links a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 60%;
          height: 1px;
          background: var(--gold);
          transition: transform 0.3s ease;
          transform-origin: center;
        }

        .cr-nav-links a:hover { color: var(--gold-light); }
        .cr-nav-links a:hover::after { transform: translateX(-50%) scaleX(1); }
        
        .cr-nav-links a.active {
          color: var(--gold-light);
        }
        .cr-nav-links a.active::after {
          transform: translateX(-50%) scaleX(1);
        }

        /* Logout special style */
        .cr-logout {
          margin-left: 0.5rem;
          padding: 0.45rem 1.25rem !important;
          border: 1px solid var(--gold-dim) !important;
          border-radius: 4px;
          color: var(--gold) !important;
          transition: all 0.25s ease !important;
        }
        .cr-logout:hover {
          background: var(--gold) !important;
          color: var(--black) !important;
          border-color: var(--gold) !important;
          box-shadow: 0 4px 15px rgba(201, 168, 76, 0.15);
        }
        .cr-logout::after { display: none !important; }

        /* Hamburger */
        .cr-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
        }
        .cr-hamburger span {
          display: block;
          width: 22px;
          height: 1.5px;
          background: var(--gold);
          transition: all 0.3s ease;
          transform-origin: center;
        }
        .cr-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .cr-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .cr-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* Mobile menu */
        @media (max-width: 768px) {
          .cr-ornament { display: none !important; }
          .cr-hamburger { display: flex; }

          .cr-nav-links {
            position: absolute;
            top: 72px;
            left: 0; right: 0;
            flex-direction: column;
            align-items: stretch;
            background: var(--black-mid);
            border-top: 1px solid var(--gold-dim);
            border-bottom: 1px solid var(--gold-dim);
            padding: 0.5rem 0;
            gap: 0;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s ease, padding 0.3s ease;
          }
          .cr-nav-links.open {
            max-height: 300px;
            padding: 0.75rem 0;
          }
          .cr-nav-links li { width: 100%; }
          .cr-nav-links a,
          .cr-nav-links button {
            display: block;
            width: 100%;
            text-align: center;
            padding: 0.75rem 1.5rem;
            font-size: 0.75rem;
          }
          .cr-nav-links a::after { display: none; }
          .cr-logout {
            margin: 0.5rem auto 0 !important;
            width: calc(100% - 3rem) !important;
            display: block !important;
            text-align: center;
          }
        }

        @media (min-width: 769px) {
          .cr-ornament { display: block; }
          .cr-nav-links { position: static; max-height: none; overflow: visible; }
        }
      `}</style>

      <nav className={`cr-navbar${scrolled ? " scrolled" : ""}`}>
        <div className="cr-inner">
          <Link to="/user/dashboard" className="cr-brand">
            <span className="cr-brand-main">Royal Route</span>
            <span className="cr-brand-sub">Premium Fleet Services</span>
          </Link>

          <div className="cr-ornament" />

          <button
            className={`cr-hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span /><span /><span />
          </button>

          <ul className={`cr-nav-links${menuOpen ? " open" : ""}`}>
            <li>
              <Link
                to="/user/dashboard"
                className={location.pathname === "/user/dashboard" ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/user/mybookings"
                className={location.pathname === "/user/mybookings" ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                My Bookings
              </Link>
            </li>
            <li>
              <Link
                to="/user/user-profile"
                className={location.pathname === "/user/user-profile" ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
            </li>
            <li>
              <button className="cr-logout" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default User;