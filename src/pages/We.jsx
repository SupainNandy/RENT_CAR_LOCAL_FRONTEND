import React from "react";
// Ensure these paths match your project structure
import supainImg from "../Profile/supain.jpg";
import lipeImg from "../Profile/lipe.jpeg";
import suryaImg from '../Profile/surya.jpg';
import {
  Crown,
  Code,
  Server,
  Palette,
  GraduationCap,
  ShieldCheck,
  Box
} from "lucide-react";

const developers = [
  {
    name: "Supain Nandy",
    role: "Lead Developer",
    img: supainImg,
    desc: "Builds secure APIs, database architecture, and high-performance backend systems.",
    icon: <Code size={20} />,
    skills: ["API Architecture", "Security", "Database"]
  },
  {
    name: "Surya Halder",
    role: "Backend Engineer",
    img: suryaImg,
    desc: "Architect of Royal Route. Specialized in MERN Stack, UI/UX, and scalable applications.",
    icon: <Server size={20} />,
    skills: ["MERN Stack", "System Design", "UI/UX Optimization"]
  },
  {
    name: "Lipe Dhar",
    role: "Frontend Engineer",
    img: lipeImg,
    desc: "Creates elegant interfaces and seamless user experiences for premium customers.",
    icon: <Palette size={20} />,
    skills: ["Premium UI", "Animation Systems", "UX Flow"]
  },
];

const We = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#050505",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        padding: "120px 20px 100px 20px",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      }}
      className="premium-mesh-bg"
    >
      {/* Decorative Top Ambient Orbs */}
      <div className="ambient-glow-top" />
      <div className="ambient-orb-left" />
      <div className="ambient-orb-right" />

      <div style={{ position: "relative", zIndex: 2, maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <div style={{ display: "inline-block", position: "relative" }}>
            <div className="icon-glow" />
            <Crown
              size={44}
              color="#D4AF37"
              style={{ position: "relative", zIndex: 2, marginBottom: "16px" }}
            />
          </div>
          
          <h1 className="gold-gradient-text" style={{
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            fontWeight: "800",
            margin: "0 0 16px 0",
            textTransform: "uppercase",
            letterSpacing: "8px",
          }}>
            We Are Royal Route
          </h1>
          
          <p style={{
            maxWidth: "620px",
            margin: "0 auto",
            color: "#8a8a8a",
            fontSize: "0.95rem",
            lineHeight: "1.8",
            fontWeight: "300",
            letterSpacing: "0.3px",
          }}>
            A premium luxury mobility framework engineered with clean architecture, high performance subsystems, and modern interface dynamics.
          </p>
        </div>

        {/* --- SECTION 1: MODERN PROJECT SPECIFICATION TRACK --- */}
        <div className="spec-track-container" style={{ marginBottom: "60px" }}>
          <div className="spec-item">
            <GraduationCap size={18} color="#D4AF37" />
            <div className="spec-text">
              <span className="spec-label">PROJECT SCOPE</span>
              <span className="spec-value">Final Year MCA Major</span>
            </div>
          </div>
          <div className="spec-divider" />
          <div className="spec-item">
            <Box size={16} color="#D4AF37" />
            <div className="spec-text">
              <span className="spec-label">SYSTEM BUILD</span>
              <span className="spec-value">MERN Stack Architecture</span>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: LUXURY ACADEMIC GUIDE MASTERPIECE --- */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "80px" }}>
          <div className="academic-master-card">
            {/* Top Border Shimmer Track */}
            <div className="shimmer-top-line" />
            
            <div className="academic-card-inner">
              {/* Left Column: Premium Crest Badge */}
              <div className="academic-crest-wrapper">
                <div className="crest-ring-outer" />
                <div className="crest-ring-inner">
                  <ShieldCheck size={32} color="#D4AF37" className="crest-icon" />
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="academic-details">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                  <span className="academic-tag">FACULTY RECTOR</span>
                  <div className="academic-status-pill">
                    <span className="status-dot" />
                    <span>Project Guide</span>
                  </div>
                </div>

                <h2 className="academic-name">
                  Prof. Debalina Barman
                </h2>

                <h4 className="academic-subtitle">
                  Project Supervisor &amp; Academic Mentor
                </h4>

                <div className="academic-divider-line" />

                <p className="academic-description">
                  Providing strategic algorithmic validation, cryptographic architecture oversight, 
                  and strict institutional governance workflows for the deployment of the Royal Route ecosystem.
                </p>

                {/* Core Pillars Grid */}
                <div className="academic-pillars-grid">
                  <div className="pillar-tag">System Validation</div>
                  <div className="pillar-tag">Algorithmic Oversight</div>
                  <div className="pillar-tag">Architecture Compliance</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Grid Title Separator */}
        <div className="grid-section-separator">
          <span className="separator-line"></span>
          <h3 className="separator-heading">Engineering Cohort</h3>
          <span className="separator-line"></span>
        </div>

        {/* Team Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "30px",
            justifyItems: "center",
          }}
        >
          {developers.map((dev, index) => (
            <div key={index} className="premium-card">
              <div className="card-top-accent" />

              {/* Profile Wrapper */}
              <div style={{ position: "relative", width: "105px", height: "105px", margin: "0 auto 20px" }}>
                <div className="profile-ring-animated" />
                <img
                  src={dev.img}
                  alt={dev.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    position: "relative",
                    zIndex: 2,
                    border: "3px solid #0a0a0a",
                  }}
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${dev.name}&backgroundColor=1a1a1a`;
                  }}
                />
              </div>

              {/* Dev Icon */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                <div className="developer-icon-wrapper">
                  {dev.icon}
                </div>
              </div>
              
              <h2 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: "600", margin: "0 0 6px 0", letterSpacing: "0.5px" }}>
                {dev.name}
              </h2>
              
              <h4 style={{ color: "#D4AF37", fontSize: "0.78rem", fontWeight: "500", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 16px 0" }}>
                {dev.role}
              </h4>
              
              <p style={{ color: "#808080", lineHeight: "1.6", fontSize: "0.88rem", margin: "0 0 20px 0", fontWeight: '300' }}>
                {dev.desc}
              </p>

              {/* Skills Pills */}
              <div className="tech-pills-container">
                {dev.skills.map((skill, sIdx) => (
                  <span key={sIdx} className="tech-pill">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Fine Minimalist Footer Branding */}
        <div style={{ margin: "100px auto 0", maxWidth: "300px", textAlign: 'center' }}>
          <div className="footer-line-graphic" />
          <div style={{ fontSize: '9px', color: '#444', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '14px' }}>
            Royal Route Platform • 2026
          </div>
          <p className="footer-dev" style={{ margin: "6px 0 0", fontSize: "0.8rem", fontStyle: "italic", letterSpacing: "1px", opacity: 0.85,color: "#d4af37)" }}>
                Designed & Developed by Supain Nandy
              </p>
        </div>
      </div>

      {/* Embedded Clean CSS Sheet */}
      <style>
        {`
          /* Premium Luxury Mesh & Net Background Architecture */
          .premium-mesh-bg {
            background-image: 
              radial-gradient(circle at 50% 0%, rgba(22, 19, 13, 0.7) 0%, rgba(5, 5, 5, 0) 60%),
              radial-gradient(circle at 0% 100%, rgba(15, 15, 15, 0.8) 0%, rgba(5, 5, 5, 0) 50%),
              linear-gradient(135deg, #050505 0%, #0a0a0a 100%);
            background-attachment: fixed;
          }
          .premium-mesh-bg::before {
            content: "";
            position: absolute;
            inset: 0;
            background-image: linear-gradient(rgba(212, 175, 55, 0.015) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(212, 175, 55, 0.015) 1px, transparent 1px);
            background-size: 60px 60px;
            mask-image: radial-gradient(circle at 50% 30%, black 20%, transparent 80%);
            -webkit-mask-image: radial-gradient(circle at 50% 30%, black 20%, transparent 80%);
            pointer-events: none;
            z-index: 1;
          }

          /* Ambient Cinematic Light System */
          .ambient-glow-top {
            position: absolute;
            top: -10%; left: 25%; right: 25%; height: 350px;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.06) 0%, rgba(0,0,0,0) 70%);
            pointer-events: none;
            z-index: 1;
            filter: blur(40px);
          }
          .ambient-orb-left {
            position: absolute;
            top: 40%; left: -15%; width: 500px; height: 500px;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.02) 0%, rgba(0,0,0,0) 75%);
            pointer-events: none;
            z-index: 1;
          }
          .ambient-orb-right {
            position: absolute;
            bottom: 5%; right: -15%; width: 500px; height: 500px;
            background: radial-gradient(circle, rgba(138, 109, 28, 0.02) 0%, rgba(0,0,0,0) 75%);
            pointer-events: none;
            z-index: 1;
          }

          .gold-gradient-text {
            background: linear-gradient(to right, #b89742 0%, #f7e5a9 25%, #d4af37 50%, #f7e5a9 75%, #b89742 100%);
            background-size: 200% auto;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shine 6s linear infinite;
          }

          /* --- SYSTEM BUILD TRACK --- */
          .spec-track-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 30px;
            background: rgba(15, 15, 15, 0.6);
            border: 1px solid rgba(212, 175, 55, 0.12);
            padding: 14px 35px;
            border-radius: 100px;
            width: fit-content;
            margin: 0 auto;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          }
          @media(max-width: 680px) {
            .spec-track-container { flex-direction: column; gap: 15px; border-radius: 20px; padding: 25px; align-items: center; width: 90%; }
            .spec-divider { display: none; }
          }

          .spec-item { display: flex; align-items: center; gap: 14px; }
          .spec-text { display: flex; flex-direction: column; }
          .spec-label { font-size: 9px; color: #666; letter-spacing: 2px; font-weight: 700; }
          .spec-value { font-size: 13px; color: #cccccc; font-weight: 400; margin-top: 2px; }
          .spec-divider { width: 1px; height: 24px; background: rgba(212, 175, 55, 0.2); }

          /* --- PROF. DEBOLINA BARMAN HIGH-PREMIUM ACADEMIC CARD --- */
          .academic-master-card {
            background: linear-gradient(180deg, rgba(20, 19, 17, 0.85) 0%, rgba(10, 10, 10, 0.98) 100%);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 24px;
            max-width: 820px;
            width: 100%;
            position: relative;
            box-shadow: 0 25px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            overflow: hidden;
          }
          .shimmer-top-line {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 2px;
            background: linear-gradient(90deg, transparent, rgba(212,175,55,0.2), #f5df93, rgba(212,175,55,0.2), transparent);
          }
          .academic-card-inner {
            display: flex;
            padding: 45px 50px;
            gap: 40px;
            align-items: flex-start;
          }
          @media(max-width: 768px) {
            .academic-card-inner { flex-direction: column; align-items: center; text-align: center; padding: 40px 25px; }
          }

          /* Luxury Structural Crest Geometry */
          .academic-crest-wrapper {
            position: relative;
            width: 100px; height: 100px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .crest-ring-outer {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 2px dashed rgba(212, 175, 55, 0.25);
            animation: rotateGlow 30s linear infinite;
          }
          .crest-ring-inner {
            width: 80px; height: 80px;
            border-radius: 50%;
            background: radial-gradient(circle, #1a160f 0%, #0d0c08 100%);
            border: 1px solid rgba(212, 175, 55, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 25px rgba(212,175,55,0.15);
          }
          .crest-icon {
            filter: drop-shadow(0 0 8px rgba(212,175,55,0.5));
          }

          /* Academic Details Text Engine */
          .academic-details { flex-grow: 1; }
          .academic-tag {
            font-size: 9px;
            font-weight: 700;
            color: #d4af37;
            letter-spacing: 3px;
            background: rgba(212, 175, 55, 0.08);
            border: 1px solid rgba(212, 175, 55, 0.25);
            padding: 4px 12px;
            border-radius: 4px;
          }
          .academic-status-pill {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: #8a8a8a;
            font-weight: 400;
          }
          .academic-status-pill .status-dot {
            width: 6px; height: 6px;
            background-color: #00ff66;
            border-radius: 50%;
            box-shadow: 0 0 8px #00ff66;
          }
          .academic-name {
            margin: 12px 0 4px 0;
            font-size: 2.1rem;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.5px;
          }
          @media(max-width: 500px) { .academic-name { font-size: 1.6rem; } }
          
          .academic-subtitle {
            margin: 0;
            font-size: 0.88rem;
            font-weight: 400;
            color: #bfa35c;
            text-transform: uppercase;
            letter-spacing: 2.5px;
          }
          .academic-divider-line {
            width: 100%; height: 1px;
            background: linear-gradient(90deg, rgba(212,175,55,0.25), transparent);
            margin: 20px 0;
          }
          @media(max-width: 768px) {
            .academic-divider-line { background: linear-gradient(90deg, transparent, rgba(212,175,55,0.25), transparent); }
          }
          .academic-description {
            margin: 0 0 24px 0;
            font-size: 0.95rem;
            line-height: 1.75;
            color: #b0b0b0;
            font-weight: 300;
          }
          .academic-pillars-grid {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }
          @media(max-width: 768px) { .academic-pillars-grid { justify-content: center; } }
          .pillar-tag {
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.06);
            padding: 5px 14px;
            font-size: 11px;
            color: #cdcdcd;
            border-radius: 30px;
            font-weight: 400;
          }

          /* --- SEPARATOR ELEMENTS --- */
          .grid-section-separator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin: 80px 0 40px 0;
          }
          .separator-line {
            height: 1px;
            flex-grow: 1;
            max-width: 120px;
            background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2));
          }
          .grid-section-separator .separator-line:last-child {
            background: linear-gradient(90deg, rgba(212, 175, 55, 0.2), transparent);
          }
          .separator-heading {
            font-size: 0.85rem;
            letter-spacing: 4px;
            color: #9e7a28;
            text-transform: uppercase;
            font-weight: 600;
            margin: 0;
          }

          /* --- COHORT TEAM CARDS --- */
          .premium-card {
            width: 100%;
            background: linear-gradient(180deg, rgba(16, 16, 16, 0.6) 0%, rgba(8, 8, 8, 0.95) 100%);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 40px 25px;
            text-align: center;
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            box-shadow: 0 15px 35px rgba(0,0,0,0.4);
          }
          .card-top-accent {
            position: absolute;
            top: 0; left: 50%;
            transform: translateX(-50%);
            width: 40px; height: 1px;
            background: rgba(212, 175, 55, 0.3);
            transition: width 0.4s ease;
          }
          .premium-card:hover {
            transform: translateY(-8px);
            border-color: rgba(212, 175, 55, 0.3);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.7);
          }
          .premium-card:hover .card-top-accent {
            width: 100px;
            background: #D4AF37;
          }

          .developer-icon-wrapper {
            background: rgba(212, 175, 55, 0.03); 
            padding: 9px; 
            border-radius: 50%;
            color: #9e7a28;
            border: 1px solid rgba(212, 175, 55, 0.15);
            transition: all 0.3s ease;
            display: inline-flex;
          }
          .premium-card:hover .developer-icon-wrapper {
            color: #D4AF37;
            background: rgba(212, 175, 55, 0.08);
            border-color: rgba(212, 175, 55, 0.4);
            transform: scale(1.05);
          }

          .tech-pills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            justify-content: center;
          }
          .tech-pill {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.07);
            color: #888;
            font-size: 10px;
            font-weight: 500;
            padding: 4px 10px;
            border-radius: 4px;
            letter-spacing: 0.3px;
          }
          .premium-card:hover .tech-pill {
            color: #ccc;
            border-color: rgba(255,255,255,0.12);
          }

          .profile-ring-animated {
            position: absolute;
            top: -5px; left: -5px; right: -5px; bottom: -5px;
            border-radius: 50%;
            background: linear-gradient(45deg, #D4AF37, transparent, #8a6d1c, transparent);
            z-index: 1;
            animation: rotateGlow 8s linear infinite;
            opacity: 0.15;
            transition: opacity 0.4s ease;
          }
          .premium-card:hover .profile-ring-animated {
            opacity: 0.6;
          }

          .icon-glow {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 40px; height: 40px;
            background: #D4AF37;
            filter: blur(30px);
            border-radius: 50%;
            opacity: 0.25;
          }

          .footer-line-graphic {
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(212,175,55,0.2) 50%, transparent);
          }

          @keyframes shine {
            to { background-position: 200% center; }
          }
          @keyframes rotateGlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default We;