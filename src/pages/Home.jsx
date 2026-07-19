import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Custom Cursor ─── */
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = mx + "px";
        dotRef.current.style.top = my + "px";
      }
    };
    document.addEventListener("mousemove", onMove);

    const animRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = rx + "px";
        ringRef.current.style.top = ry + "px";
      }
      requestAnimationFrame(animRing);
    };
    animRing();

    const addHover = (sel) => {
      document.querySelectorAll(sel).forEach(el => {
        el.addEventListener("mouseenter", () => ringRef.current?.classList.add("hovered"));
        el.addEventListener("mouseleave", () => ringRef.current?.classList.remove("hovered"));
      });
    };
    addHover(".feature-card, button, .stat-item, .about-ring, .dash-panel, .speedo-panel, .telemetry-card, .nav-logo, .nav-btn");

    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

/* ─── Particle Canvas ─── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.3,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));

    let mouseX = canvas.width / 2, mouseY = canvas.height / 2;
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    document.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        const dx = mouseX - p.x, dy = mouseY - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14000) { p.vx += dx * 0.00003; p.vy += dy * 0.00003; }
        p.vx *= 0.998; p.vy *= 0.998;
        p.x += p.vx; p.y += p.vy; p.pulse += 0.02;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${a})`; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212,175,55,${0.08 * (1 - d / 90)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      ctx.beginPath(); ctx.arc(mouseX, mouseY, 60, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(212,175,55,0.07)"; ctx.lineWidth = 1; ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); document.removeEventListener("mousemove", onMove); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }} />;
}

/* ─── Speedometer ─── */
function Speedometer() {
  const needleRef = useRef(null);
  const valRef = useRef(null);
  useEffect(() => {
    let raf, t = 0;
    const animate = () => {
      t += 0.008;
      const pct = 0.5 + 0.45 * Math.sin(t) * Math.sin(t * 0.4);
      const angle = -140 + pct * 280;
      const speed = Math.round(pct * 240);
      if (needleRef.current) needleRef.current.setAttribute("transform", `rotate(${angle}, 100, 100)`);
      if (valRef.current) valRef.current.textContent = speed;
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  const ticks = Array.from({ length: 25 }, (_, i) => {
    const a = (-140 + i * (280 / 24)) * (Math.PI / 180);
    const isMajor = i % 4 === 0, r1 = isMajor ? 72 : 76, r2 = 84;
    return { x1: 100 + r1 * Math.cos(a), y1: 100 + r1 * Math.sin(a), x2: 100 + r2 * Math.cos(a), y2: 100 + r2 * Math.sin(a), major: isMajor };
  });
  const s = (-140) * Math.PI / 180, e = (140) * Math.PI / 180, r = 84;
  const x1 = 100 + r * Math.cos(s), y1 = 100 + r * Math.sin(s), x2 = 100 + r * Math.cos(e), y2 = 100 + r * Math.sin(e);

  return (
    <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="18" />
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`} fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="2" />
      {ticks.map((tk, i) => (
        <line key={i} x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2}
          stroke={tk.major ? "rgba(212,175,55,0.7)" : "rgba(212,175,55,0.3)"}
          strokeWidth={tk.major ? 1.5 : 0.8} />
      ))}
      {[0, 60, 120, 180, 240].map((v, i) => {
        const a = (-140 + i * 70) * Math.PI / 180;
        return <text key={i} x={100 + 62 * Math.cos(a)} y={100 + 62 * Math.sin(a) + 3}
          textAnchor="middle" fill="rgba(212,175,55,0.6)"
          style={{ fontSize: 7, fontFamily: "'Barlow', sans-serif" }}>{v}</text>;
      })}
      <g ref={needleRef} transform="rotate(-140, 100, 100)">
        <line x1="100" y1="100" x2="100" y2="24" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
        <line x1="100" y1="100" x2="100" y2="110" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <circle cx="100" cy="100" r="6" fill="#D4AF37" />
      <circle cx="100" cy="100" r="3" fill="#000" />
      <text ref={valRef} x="100" y="148" textAnchor="middle" fill="#D4AF37"
        style={{ fontSize: 18, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>0</text>
      <text x="100" y="158" textAnchor="middle" fill="rgba(212,175,55,0.45)"
        style={{ fontSize: 6, fontFamily: "'Barlow', sans-serif", letterSpacing: 2 }}>KM/H</text>
    </svg>
  );
}

/* ─── Road Canvas ─── */
function RoadCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    let raf, offset = 0;
    const W = canvas.width, H = canvas.height;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      offset = (offset + 3) % 80;
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(20,20,20,0)"); grad.addColorStop(0.3, "rgba(15,15,15,0.9)"); grad.addColorStop(1, "rgba(10,10,10,0.98)");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      const vX = W / 2, vY = H * 0.15, rHB = W * 0.38, rHT = W * 0.04;
      ctx.beginPath(); ctx.moveTo(vX - rHT, vY); ctx.lineTo(vX + rHT, vY); ctx.lineTo(vX + rHB, H); ctx.lineTo(vX - rHB, H); ctx.closePath();
      const rg = ctx.createLinearGradient(0, vY, 0, H);
      rg.addColorStop(0, "rgba(30,30,30,0)"); rg.addColorStop(1, "rgba(40,40,40,0.7)");
      ctx.fillStyle = rg; ctx.fill();
      for (let i = 0; i < 14; i++) {
        const tS = ((i / 14) + (offset / (80 * 14))) % 1, tE = Math.min(tS + 0.035, 1);
        if (tS > 0.98) continue;
        const y1 = vY + tS * (H - vY), y2 = vY + tE * (H - vY);
        const alpha = Math.min(tS * 2, 1) * 0.7, w = (2 + tS * 6) * 0.25;
        ctx.beginPath(); ctx.moveTo(vX, y1); ctx.lineTo(vX, y2);
        ctx.strokeStyle = `rgba(212,175,55,${alpha})`; ctx.lineWidth = w; ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ─── Glow Ring Stat ─── */
function GlowRingStat({ value, label, pct, delay = 0 }) {
  const arcRef = useRef(null);
  useEffect(() => {
    const r = 36, circ = 2 * Math.PI * r;
    let start = null;
    const duration = 1800;
    const animate = (ts) => {
      if (!start) start = ts + delay;
      const elapsed = ts - start;
      if (elapsed < 0) { requestAnimationFrame(animate); return; }
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      if (arcRef.current) arcRef.current.style.strokeDasharray = `${circ * pct * ease} ${circ}`;
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [pct, delay]);

  const r = 36, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "transform 0.3s", cursor: "default" }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "none"}>
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="4" />
        <circle ref={arcRef} cx="45" cy="45" r={r} fill="none" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`0 ${circ}`} transform="rotate(-90 45 45)"
          style={{ filter: "drop-shadow(0 0 4px rgba(212,175,55,0.7))", transition: "stroke-dasharray 0.05s" }} />
        <text x="45" y="49" textAnchor="middle" fill="#D4AF37"
          style={{ fontSize: 13, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}>{value}</text>
      </svg>
      <span style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", textAlign: "center" }}>{label}</span>
    </div>
  );
}

/* ─── Heartbeat Line ─── */
function HeartbeatLine() {
  const svgRef = useRef(null);
  useEffect(() => {
    const points = Array(80).fill(0).map((_, i) => ({ x: i * (500 / 79), y: 30 }));
    let t = 0, raf;
    const animate = () => {
      t += 0.06; points.shift();
      points.push({ x: 500, y: 30 + 18 * Math.sin(t) * Math.sin(t * 3.1) * Math.sin(t * 0.5) });
      const step = 500 / 79;
      points.forEach((p, i) => { p.x = i * step; });
      if (svgRef.current) {
        const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        svgRef.current.setAttribute("d", d);
      }
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <svg viewBox="0 0 500 60" style={{ width: "100%", height: 60, overflow: "visible" }}>
      <defs>
        <linearGradient id="hbGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="rgba(212,175,55,0)" />
          <stop offset="60%" stopColor="rgba(212,175,55,0.8)" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <filter id="hbGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path ref={svgRef} fill="none" stroke="url(#hbGrad)" strokeWidth="1.5" filter="url(#hbGlow)" />
    </svg>
  );
}

/* ─── MAIN HOME COMPONENT ─── */
const Home = () => {
  const navigate = useNavigate();
  const handleClick = () => navigate("/dashboard");
  const handleAboutClick = () => navigate("/we");
  const heroBgRef = useRef(null);
  const heroGlowRef = useRef(null);

  /* Track pressed states and hover states for buttons */
  const [activeBtn, setActiveBtn] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  useEffect(() => {
    const onMove = (e) => {
      const xPct = (e.clientX / window.innerWidth - 0.5) * 18;
      const yPct = (e.clientY / window.innerHeight - 0.5) * 10;
      if (heroBgRef.current) heroBgRef.current.style.transform = `scale(1.08) translate(${xPct * 0.4}px,${yPct * 0.4}px)`;
      if (heroGlowRef.current) heroGlowRef.current.style.transform = `translate(calc(-50% + ${xPct * 2}px), calc(-58% + ${yPct * 2}px))`;
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  /* Pinpoint relative cursor coordinates over buttons */
  const onButtonMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%";
    const y = ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%";
    e.currentTarget.style.setProperty("--btn-mx", x);
    e.currentTarget.style.setProperty("--btn-my", y);
  };

  const onCardMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%";
    const y = ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%";
    e.currentTarget.style.setProperty("--mx", x);
    e.currentTarget.style.setProperty("--my", y);
  };

  return (
    <>
      <style>{`
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #fff8dc, #ffd700, #D4AF37, #b8860b);
          border-radius: 12px;
          box-shadow: 0 0 10px rgba(212,175,55,0.7), 0 0 20px rgba(212,175,55,0.4);
        }
        ::-webkit-scrollbar { width: 12px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; border-left: 1px solid rgba(212,175,55,0.2); }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #f5e6a3 0%, #D4AF37 30%, #b8860b 100%);
          border-radius: 10px; border: 2px solid #0a0a0a; box-shadow: 0 0 12px rgba(212,175,55,0.5);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #fff2b0 0%, #ffd700 50%, #D4AF37 100%);
          box-shadow: 0 0 18px rgba(212,175,55,0.8);
        }
        * { scrollbar-width: thin; scrollbar-color: #D4AF37 #0a0a0a; box-sizing: border-box; }
        body { cursor: none; background: #000; overflow-x: hidden; }

        /* ── Cursor Styles ── */
        .cursor-dot {
          width: 6px; height: 6px; background: #D4AF37; border-radius: 50%;
          position: fixed; transform: translate(-50%,-50%); pointer-events: none; z-index: 9999;
          transition: transform .15s ease;
        }
        .cursor-ring {
          width: 36px; height: 36px; border: 1px solid rgba(212,175,55,0.6); border-radius: 50%;
          position: fixed; transform: translate(-50%,-50%); pointer-events: none; z-index: 9998;
          transition: width .2s ease, height .2s ease, opacity .2s ease;
        }
        .cursor-ring.hovered { width: 56px; height: 56px; opacity: .4; background: rgba(212,175,55,0.03); }

        .pcr-root { font-family: 'Barlow', sans-serif; background: #000; color: #fff; }

        /* ── Navbar Styling ── */
        .premium-nav {
          position: fixed; top: 0; left: 0; right: 0; height: 80px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.95) 70%, rgba(0,0,0,0));
          border-bottom: 1px solid rgba(212,175,55,0.1);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 3rem; z-index: 1000; backdrop-filter: blur(8px);
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          position: relative;
        }

        .logo-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: radial-gradient(circle at top, #fff5b8, #d4af37 45%, #8b6b00 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(212,175,55,.4), inset 0 0 12px rgba(255,255,255,.3);
        }

        .logo-icon::before {
          content: '';
          position: absolute;
          inset: -30%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,.5), transparent);
          animation: logoShine 4s linear infinite;
        }

        .logo-icon span {
          font-family: 'Cinzel Decorative', serif;
          color: #000;
          font-size: 1.2rem;
          font-weight: 700;
          z-index: 2;
        }

        .logo-text h3 {
          margin: 0;
          font-size: 1.3rem;
          font-weight: 700;
          background: linear-gradient(90deg, #fff8d6, #d4af37, #fff8d6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .premium-nav { transition: all .4s ease; }
        .premium-nav:hover {
          border-bottom: 1px solid rgba(212,175,55,.4);
          box-shadow: 0 8px 30px rgba(212,175,55,.08);
        }

        .nav-btn {
          position: relative;
          overflow: hidden;
          font-family: 'Barlow', sans-serif; 
          text-transform: uppercase; 
          font-size: 0.72rem;
          letter-spacing: 2px; 
          padding: 0.55rem 1.35rem; 
          border-radius: 4px; 
          cursor: none; 
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .logo-text p {
          margin: 0;
          font-size: 9px;
          letter-spacing: 3px;
          color: rgba(255,255,255,.5);
        }
        .nav-actions { display: flex; gap: 0.85rem; align-items: center; }

        /* ── Unified Animations Hub ── */
        @keyframes globalShine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes goldLineGlow {
          from { box-shadow: 0 0 4px #d4af37; opacity: 0.6; }
          to { box-shadow: 0 0 16px #ffe97a; opacity: 1; }
        }
        @keyframes subtleMoveParticles {
          from { background-position: 0 0; }
          to { background-position: 80px 80px; }
        }
        @keyframes luxuryTextGlow {
          from { text-shadow: 0 0 5px rgba(212,175,55,0.4); }
          50% { text-shadow: 0 0 18px rgba(212,175,55,0.9); }
          to { text-shadow: 0 0 5px rgba(212,175,55,0.4); }
        }
        @keyframes scanLineAnimation { 0% { top: 0%; } 100% { top: 100%; } }
        @keyframes liveIndicatorPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .2; transform: scale(0.9); } }
        @keyframes bounceHint { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(6px); } }
        @keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spinRingRev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }

        /* ── Hero Segment ── */
        .hero { min-height: 100vh; position: relative; display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; background: #000; padding-top: 80px; }
        .hero-bg { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%), url('https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=2070&q=80') center/cover no-repeat; opacity: .45; transition: transform 1.2s cubic-bezier(0.1, 0.8, 0.2, 1); }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(212,175,55,0.04) 1px,transparent 1px), linear-gradient(90deg,rgba(212,175,55,0.04) 1px,transparent 1px); background-size: 60px 60px; pointer-events: none; }
        .hero-glow { position: absolute; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle,rgba(212,175,55,0.09) 0%,transparent 70%); top: 50%; left: 50%; transform: translate(-50%,-58%); pointer-events: none; z-index: 0; }
        .hero-content { position: relative; z-index: 4; padding: 0 1rem; max-width: 860px; }
        .hero-badge { display: inline-block; border: 1px solid rgba(212,175,55,0.4); color: #D4AF37; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; padding: 6px 20px; margin-bottom: 1.5rem; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); }
        .hero-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(3rem,8vw,5.5rem); font-weight: 700; color: #fff; line-height: 1.1; margin: 0 0 1.5rem; }
        .hero-title span { color: #D4AF37; filter: drop-shadow(0 2px 10px rgba(212,175,55,0.3)); }
        .hero-sub { font-size: 1.05rem; color: rgba(255,255,255,0.65); font-weight: 300; letter-spacing: .02em; max-width: 520px; margin: 0 auto 2.5rem; line-height: 1.7; }
        .hero-divider { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 2rem; }
        .hero-divider span { width: 60px; height: 1px; background: rgba(212,175,55,0.3); }
        
        .scroll-hint { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 6px; color: rgba(212,175,55,.5); font-size: 10px; letter-spacing: 3px; text-transform: uppercase; z-index: 5; animation: bounceHint 2s infinite; }
        .scroll-hint::after { content: ''; width: 1px; height: 36px; background: linear-gradient(to bottom,rgba(212,175,55,.5),transparent); }
        
        .corner-tl,.corner-br { position: absolute; width: 60px; height: 60px; pointer-events: none; z-index: 2; opacity: 0.7; }
        .corner-tl { top: 7rem; left: 2rem; border-top: 1px solid #D4AF37; border-left: 1px solid #D4AF37; }
        .corner-br { bottom: 6rem; right: 2rem; border-bottom: 1px solid #D4AF37; border-right: 1px solid #D4AF37; }

        /* ── Live Telemetry Panels ── */
        .live-dash { position: absolute; bottom: 5rem; left: 2.5rem; z-index: 10; display: flex; flex-direction: column; gap: 12px; pointer-events: auto; text-align: left; }
        @media(max-width:992px){.live-dash{display:none}}
        .dash-panel { background: rgba(5,5,5,0.75); border: 1px solid rgba(212,175,55,0.15); backdrop-filter: blur(16px); padding: 14px; min-width: 210px; border-radius: 4px; transition: border-color .3s, box-shadow .3s; }
        .dash-panel:hover { border-color: rgba(212,175,55,0.5); box-shadow: 0 0 20px rgba(212,175,55,0.08); }
        
        .speedo-panel { position: absolute; right: 2.5rem; top: 50%; transform: translateY(-50%); z-index: 10; width: 180px; background: rgba(5,5,5,0.75); border: 1px solid rgba(212,175,55,0.15); backdrop-filter: blur(16px); padding: 16px; border-radius: 4px; pointer-events: auto; transition: border-color .3s, box-shadow .3s; }
        .speedo-panel:hover { border-color: rgba(212,175,55,0.5); box-shadow: 0 0 25px rgba(212,175,55,0.08); }
        @media(max-width:1200px){.speedo-panel{display:none}}
        
        .panel-label { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: rgba(212,175,55,.6); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; font-weight: 500; }
        .live-dot { width: 5px; height: 5px; border-radius: 50%; background: #D4AF37; animation: liveIndicatorPulse 1.4s infinite ease-in-out; }

        /* ── Stats Bar ── */
        .stats-bar { background: #060606; border-top: 1px solid rgba(212,175,55,.15); border-bottom: 1px solid rgba(212,175,55,.15); padding: 3rem 0; }
        .stat-item { text-align: center; padding: 0 2rem; cursor: default; transition: transform .3s; }
        .stat-item:hover { transform: translateY(-4px); }
        .stat-num { font-family: 'Cormorant Garamond', serif; font-size: 3rem; font-weight: 700; color: #D4AF37; line-height: 1; transition: text-shadow .3s; }
        .stat-item:hover .stat-num { text-shadow: 0 0 15px rgba(212,175,55,.4); }
        .stat-label { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,.5); margin-top: 6px; font-weight: 400; }
        .stat-sep { width: 1px; background: rgba(212,175,55,.15); height: 50px; align-self: center; flex-shrink: 0; }

        /* ── Features ── */
        .features-section { background: #0a0a0a; padding: 7rem 0; position: relative; overflow: hidden; }
        .features-section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg,transparent,#D4AF37,transparent); }
        .section-label { font-size: 11px; letter-spacing: 5px; text-transform: uppercase; color: #D4AF37; margin-bottom: .75rem; font-weight: 500; }
        .section-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.2rem,4vw,3.5rem); font-weight: 700; color: #fff; margin-bottom: 4rem; }
        .feature-card { background: #111; border: 1px solid rgba(212,175,55,.08); padding: 3rem 2rem; position: relative; transition: border-color .3s, transform .3s, box-shadow .3s; cursor: default; overflow: hidden; border-radius: 4px; }
        .feature-card:hover { border-color: rgba(212,175,55,.45); transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,.6); }
        .feature-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 0; background: #D4AF37; transition: height .35s; }
        .feature-card:hover::before { height: 100%; }
        .feature-card::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at var(--mx,50%) var(--my,50%),rgba(212,175,55,.05) 0%,transparent 65%); opacity: 0; transition: opacity .3s; pointer-events: none; }
        .feature-card:hover::after { opacity: 1; }
        .feature-title { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; color: #D4AF37; margin-bottom: .85rem; font-weight: 600; letter-spacing: 0.5px; }
        .feature-text { color: rgba(255,255,255,.55); font-size: .95rem; line-height: 1.7; font-weight: 300; }
        .feature-num { position: absolute; top: 1.5rem; right: 1.75rem; font-family: 'Cormorant Garamond', serif; font-size: 4rem; font-weight: 700; color: rgba(212,175,55,.04); line-height: 1; user-select: none; }

        /* ── Road Overlay ── */
        .road-section { position: relative; height: 280px; background: #040404; overflow: hidden; }
        .road-section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg,transparent,#D4AF37,transparent); z-index: 2; }
        .road-overlay { position: absolute; inset: 0; z-index: 2; display: flex; align-items: center; justify-content: center; gap: 80px; pointer-events: none; }

        /* ── Telemetry Grid ── */
        .telemetry-section { background: #060606; padding: 5rem 0; border-top: 1px solid rgba(212,175,55,.1); border-bottom: 1px solid rgba(212,175,55,.1); }
        .telemetry-card { background: #0c0c0c; border: 1px solid rgba(212,175,55,.08); padding: 1.75rem; position: relative; overflow: hidden; border-radius: 4px; transition: border-color .3s, box-shadow .3s; }
        .telemetry-card:hover { border-color: rgba(212,175,55,.35); box-shadow: 0 0 30px rgba(212,175,55,.04); }
        .telemetry-card::after { content: ''; position: absolute; left: 0; right: 0; height: 1px; background: linear-gradient(90deg,transparent,rgba(212,175,55,.2),transparent); animation: scanLineAnimation 3.5s linear infinite; top: 0; }
        .tele-label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: rgba(212,175,55,.6); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; font-weight: 500; }

        /* ── About Section ── */
        .about-section { background: #000; padding: 7rem 0; position: relative; overflow: hidden; }
        .about-section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg,transparent,#D4AF37,transparent); }
        .about-ring { width: 300px; height: 300px; border-radius: 50%; border: 1px solid rgba(212,175,55,.12); position: relative; display: flex; align-items: center; justify-content: center; margin: 0 auto; transition: border-color .4s; }
        .about-ring:hover { border-color: rgba(212,175,55,.4); }
        .about-ring::before { content: ''; position: absolute; width: 240px; height: 240px; border-radius: 50%; border: 1px solid rgba(212,175,55,.2); }
        .about-ring::after { content: ''; position: absolute; width: 180px; height: 180px; border-radius: 50%; border: 1px solid rgba(212,175,55,.3); }
        .about-center-text { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; color: #D4AF37; text-align: center; z-index: 1; letter-spacing: 2px; font-weight: 600; }
        .about-dot { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #D4AF37; transition: transform .3s, box-shadow .3s; }
        .about-ring:hover .about-dot { transform: scale(1.5); box-shadow: 0 0 10px rgba(212,175,55,.7); }
        .about-text { color: rgba(255,255,255,.6); font-size: .95rem; line-height: 1.85; font-weight: 300; margin-bottom: 1.2rem; }
        .gold-line { width: 40px; height: 2px; background: #D4AF37; margin: 1.5rem 0; }

        /* ── Call To Action ── */
        .cta-section { background: #080808; padding: 7rem 0; text-align: center; position: relative; overflow: hidden; }
        .cta-section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg,transparent,#D4AF37,transparent); }
        .cta-bg-text { position: absolute; font-family: 'Cormorant Garamond', serif; font-size: 18vw; font-weight: 700; color: rgba(212,175,55,.02); top: 50%; left: 50%; transform: translate(-50%,-50%); white-space: nowrap; pointer-events: none; letter-spacing: -.03em; user-select: none; }
        .cta-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.4rem,5vw,4rem); font-weight: 700; color: #fff; margin-bottom: 1rem; position: relative; z-index: 1; }
        .cta-sub { color: rgba(255,255,255,.5); font-size: 1.05rem; font-weight: 300; margin-bottom: 2.5rem; position: relative; z-index: 1; }

        /* ── Footer ── */
        .footer { background: #000; border-top: 1px solid rgba(212,175,55,.2); padding: 4rem 0 3rem; text-align: center; }
        .footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; color: #D4AF37; font-weight: 600; letter-spacing: 2px; margin-bottom: .5rem; }
        .footer-tagline { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: rgba(212,175,55,.45); margin-bottom: 2rem; }
        .footer-hr { border: none; border-top: 1px solid rgba(212,175,55,.1); margin: 2rem auto; max-width: 400px; }
        .footer-copy { color: rgba(255,255,255,.4); font-size: .85rem; }
        .footer-dev { color: rgba(212,175,55,.55); font-size: .8rem; margin-top: .6rem; }

        /* ── Rotating Vectors ── */
        .spin-ring { animation: spinRing 14s linear infinite; transform-origin: 150px 150px; }
        .spin-ring-rev { animation: spinRingRev 20s linear infinite; transform-origin: 150px 150px; }
      `}</style>

      <div className="pcr-root">
        <CustomCursor />

        {/* ── FIXED TOP NAVBAR ── */}
        <nav className="premium-nav">
          <a href="/" className="nav-logo">
            <div className="logo-icon">
              <span>RR</span>
            </div>

            <div className="logo-text">
              <h3>Royal Route</h3>
              <p>PREMIUM RENTALS</p>
            </div>
          </a>
          
          <div className="nav-actions">
            <button 
              className="nav-btn" 
              style={{
                color: hoveredBtn === "nav-signin" ? "#fff" : "rgba(255,255,255,0.75)",
                background: hoveredBtn === "nav-signin" ? "rgba(212,175,55,0.06)" : "transparent",
                borderColor: hoveredBtn === "nav-signin" ? "rgba(212,175,55,0.6)" : "rgba(212,175,55,0.15)",
                borderStyle: "solid",
                borderWidth: "1px",
                transform: activeBtn === "nav-signin" ? "translateY(1px) scale(0.98)" : hoveredBtn === "nav-signin" ? "translateY(-1px)" : "none",
                boxShadow: hoveredBtn === "nav-signin" ? "0 4px 12px rgba(212,175,55,0.15)" : "none"
              }}
              onMouseEnter={() => setHoveredBtn("nav-signin")}
              onMouseLeave={() => { setHoveredBtn(null); setActiveBtn(null); }}
              onMouseDown={() => setActiveBtn("nav-signin")}
              onMouseUp={() => setActiveBtn(null)}
              onClick={() => navigate("/login-user")}
            >
              Sign In
            </button>
            
            <button 
              className="nav-btn" 
              style={{
                color: hoveredBtn === "nav-admin" ? "#000" : "#D4AF37",
                background: activeBtn === "nav-admin"
                  ? "#b08f2e"
                  : hoveredBtn === "nav-admin" 
                    ? "radial-gradient(circle 80px at var(--btn-mx, 50%) var(--btn-my, 50%), #ffffff 0%, #ffe97a 50%, #D4AF37 100%)" 
                    : "transparent",
                borderColor: hoveredBtn === "nav-admin" ? "transparent" : "rgba(212,175,55,0.45)",
                borderStyle: "solid",
                borderWidth: "1px",
                fontWeight: hoveredBtn === "nav-admin" ? "600" : "500",
                transform: activeBtn === "nav-admin" ? "translateY(1px) scale(0.98)" : hoveredBtn === "nav-admin" ? "translateY(-1px)" : "none",
                boxShadow: hoveredBtn === "nav-admin" ? "0 4px 15px rgba(212,175,55,0.5)" : "none"
              }}
              onMouseMove={onButtonMouseMove}
              onMouseEnter={() => setHoveredBtn("nav-admin")}
              onMouseLeave={() => { setHoveredBtn(null); setActiveBtn(null); }}
              onMouseDown={() => setActiveBtn("nav-admin")}
              onMouseUp={() => setActiveBtn(null)}
              onClick={() => navigate("/login-admin")}
            >
              Admin Login
            </button>

            <button 
              className="nav-btn" 
              style={{
                color: "#000", 
                background: activeBtn === "nav-signup"
                  ? "#b8860b"
                  : "linear-gradient(90deg, #ffe97a, #D4AF37)", 
                fontWeight: "600",
                border: "none",
                transform: activeBtn === "nav-signup" ? "translateY(1px) scale(0.98)" : hoveredBtn === "nav-signup" ? "translateY(-2px)" : "none",
                boxShadow: hoveredBtn === "nav-signup" ? "0 4px 15px rgba(212,175,55,0.45)" : "0 2px 8px rgba(212,175,55,0.2)"
              }}
              onMouseEnter={() => setHoveredBtn("nav-signup")}
              onMouseLeave={() => { setHoveredBtn(null); setActiveBtn(null); }}
              onMouseDown={() => setActiveBtn("nav-signup")}
              onMouseUp={() => setActiveBtn(null)}
              onClick={() => navigate("/register-user")}
            >
              Sign Up
            </button>
          </div>
        </nav>

        {/* ── HERO SECTION ── */}
        <section className="hero">
          <div className="hero-bg" ref={heroBgRef} />
          <div className="hero-grid" />
          <div className="hero-glow" ref={heroGlowRef} />
          <div className="corner-tl" />
          <div className="corner-br" />
          <ParticleCanvas />

          <div className="hero-content">
            <div style={{ textAlign: "center", marginTop: "20px", fontFamily: "'Cinzel Decorative', serif", position: "relative", overflow: "hidden" }}>
              <div style={{ width: "45%", height: "2px", margin: "12px auto 0", borderRadius: "2px", background: "linear-gradient(90deg, transparent, #d4af37, #f5f5f5, #d4af37, transparent)", animation: "goldLineGlow 2s ease-in-out infinite alternate" }} />
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(circle, rgba(212,175,55,0.4) 1.5px, transparent 1.5px)", backgroundSize: "40px 40px", animation: "subtleMoveParticles 12s linear infinite" }} />
            </div>

            <div className="hero-badge mt-4">Est. 2026 · Premium Fleet</div>
            <h1 className="hero-title" style={{ color: '#e7deaecf' }}>Every Mile,<br /><span>A Royal Experience</span></h1>
            <div className="hero-divider">
              <span /><span style={{ fontSize: 7, color: "#D4AF37" }}>◆</span><span />
            </div>
            <p className="hero-sub">
              Your journey deserves more than a ride—it deserves a royal experience.
            </p>

            <div style={{ display: "flex", gap: "18px", justifyContent: "center", flexWrap: "wrap" }}>
              {/* EXPLORE CARS BUTTON */}
              <button
                className="btn btn-outline-light btn-lg"
                style={{
                  color: hoveredBtn === "explore" ? "#fff" : "#D4AF37",
                  borderColor: hoveredBtn === "explore" ? "#ffe97a" : "rgba(212,175,55,0.5)",
                  borderStyle: "solid",
                  borderWidth: "1px",
                  letterSpacing: "2.5px",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  padding: "0.85rem 2.25rem",
                  borderRadius: "4px",
                  background: activeBtn === "explore"
                    ? "rgba(0, 0, 0, 0.95)"
                    : hoveredBtn === "explore"
                      ? "radial-gradient(circle 120px at var(--btn-mx, 50%) var(--btn-my, 50%), rgba(212,175,55,0.35) 0%, transparent 100%)"
                      : "rgba(5, 5, 5, 0.4)",
                  cursor: "none",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  animation: "luxuryTextGlow 5s ease infinite",
                  transform: activeBtn === "explore" ? "translateY(2px) scale(0.97)" : hoveredBtn === "explore" ? "translateY(-4px)" : "none",
                  boxShadow: activeBtn === "explore"
                    ? "inset 0 2px 6px rgba(0,0,0,0.8)"
                    : hoveredBtn === "explore"
                      ? "0 12px 28px rgba(212,175,55,0.45), inset 0 0 12px rgba(212,175,55,0.2)"
                      : "0 4px 15px rgba(212,175,55,0.05)"
                }}
                onMouseMove={onButtonMouseMove}
                onMouseEnter={() => setHoveredBtn("explore")}
                onMouseLeave={() => { setHoveredBtn(null); setActiveBtn(null); }}
                onMouseDown={() => setActiveBtn("explore")}
                onMouseUp={() => setActiveBtn(null)}
                onClick={handleClick}
              >
                Explore Cars
              </button>

             

              {/* DEVELOPERS BUTTON */}
              <button
                className="btn btn-outline-light btn-lg"
                 style={{
                  background: activeBtn === "admin"
                    ? "#96751c"
                    : "radial-gradient(circle 140px at var(--btn-mx, 50%) var(--btn-my, 50%), #ffffff 0%, #ffe97a 40%, #D4AF37 100%)",
                  color: "#000",
                  borderColor: "transparent",
                  letterSpacing: "2.5px",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  fontWeight: "700",
                  padding: "0.85rem 2.25rem",
                  borderRadius: "4px",
                  cursor: "none",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  animation: activeBtn === "admin" ? "none" : "globalShine 6s ease infinite",
                  transform: activeBtn === "admin" ? "translateY(2px) scale(0.97)" : hoveredBtn === "admin" ? "translateY(-4px)" : "none",
                  boxShadow: activeBtn === "admin"
                    ? "inset 0 4px 10px rgba(0,0,0,0.6)"
                    : hoveredBtn === "admin"
                      ? "0 14px 35px rgba(212,175,55,0.75)"
                      : "0 6px 22px rgba(212,175,55,0.35)"
                }}
                onMouseMove={onButtonMouseMove}
                onMouseEnter={() => setHoveredBtn("devs")}
                onMouseLeave={() => { setHoveredBtn(null); setActiveBtn(null); }}
                onMouseDown={() => setActiveBtn("devs")}
                onMouseUp={() => setActiveBtn(null)}
                onClick={handleAboutClick}
              >
                Developers
              </button>
            </div>
          </div>
         
        </section>

        {/* ── STATS SECTION ── */}
        <section className="stats-bar">
          <div className="container">
            <div className="row g-0 align-items-center justify-content-center">
              {[
                { num: "500+", label: "Cars Available" }, null,
                { num: "20K+", label: "Happy Customers" }, null,
                { num: "24/7", label: "Support Execution" }, null,
                { num: "50+", label: "Cities Covered" },
              ].map((item, i) =>
                item === null ? (
                  <div key={i} className="col-auto d-none d-md-flex"><div className="stat-sep" /></div>
                ) : (
                  <div key={i} className="col-6 col-md-auto px-md-4 mb-3 mb-md-0">
                    <div className="stat-item">
                      <div className="stat-num">{item.num}</div>
                      <div className="stat-label">{item.label}</div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* ── FEATURES SECTION ── */}
        <section className="features-section">
          <div className="container">
            <div className="text-center mb-5">
              <div className="section-label">What We Offer</div>
              <h2 className="section-title">Why Choose Us</h2>
            </div>
            <div className="row g-4">
              {[
                { title: "Luxury Fleet", text: "Select from absolute premium sedans, high-performance SUVs, and exotics — all tuned flawlessly for the discerning driver.", num: "01" },
                { title: "Transparent Metrics", text: "No hidden parameters, no unexpected overheads. Just direct, highly competitive rates honoring your expectations.", num: "02" },
                { title: "Constant Telemetry", text: "Our concierge team is online around the clock — ensuring structural safety and flawless transitions anywhere.", num: "03" },
              ].map((f, i) => (
                <div key={i} className="col-md-4">
                  <div className="feature-card h-100" onMouseMove={onCardMouseMove}>
                    <div className="feature-num">{f.num}</div>
                    <div className="feature-title">{f.title}</div>
                    <p className="feature-text mb-0">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ROAD CANVAS DATA GRAPHIC ── */}
        <div className="road-section">
          <RoadCanvas />
          <div className="road-overlay">
            <GlowRingStat value="500+" label="Cars" pct={0.82} delay={0} />
            <GlowRingStat value="10K+" label="Clients" pct={0.91} delay={300} />
            <GlowRingStat value="50+" label="Cities" pct={0.67} delay={600} />
          </div>
        </div>

        {/* ── LIVE TELEMETRY GRAPHS SECTION ── */}
        <section className="telemetry-section">
          <div className="container">
            <div className="row g-4 align-items-start">
              <div className="col-md-4">
                <div className="telemetry-card">
                  <div className="tele-label"><span className="live-dot" />Engine Heartbeat</div>
                  <HeartbeatLine />
                  <div style={{ fontSize: 9, color: "rgba(212,175,55,.5)", letterSpacing: 2, marginTop: 6, fontWeight: 500 }}>PERFORMANCE · LIVE DIAGNOSTIC</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="telemetry-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div className="tele-label" style={{ alignSelf: "flex-start" }}><span className="live-dot" />Fleet RPM Array</div>
                  <div style={{ position: "relative", width: 140 }}><Speedometer /></div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="telemetry-card">
                  <div className="tele-label"><span className="live-dot" />Availability Index</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
                    {[{ label: "Sedan", pct: 78 }, { label: "SUV", pct: 55 }, { label: "Exotic", pct: 32 }, { label: "EV Fleet", pct: 89 }].map((row, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.6)", fontWeight: 400 }}>{row.label}</span>
                          <span style={{ fontSize: 9, color: "#D4AF37", fontWeight: 600 }}>{row.pct}%</span>
                        </div>
                        <div style={{ height: 3, background: "rgba(212,175,55,.1)", borderRadius: 2 }}>
                          <div style={{ height: "100%", borderRadius: 2, width: `${row.pct}%`, background: "linear-gradient(90deg,rgba(212,175,55,.4),#D4AF37)", boxShadow: "0 0 6px rgba(212,175,55,.5)", transition: "width 1s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ABOUT SECTION ── */}
        <section className="about-section">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-md-5 d-flex justify-content-center">
                <div style={{ position: "relative", display: "flex", alignItems: "center", width: 300, height: 300 }}>
                  <svg width="300" height="300" viewBox="0 0 300 300" style={{ position: "absolute", top: 0, left: 0 }}>
                    <g className="spin-ring">
                      <circle cx="150" cy="150" r="138" fill="none" stroke="rgba(212,175,55,.08)" strokeWidth="1" strokeDasharray="4 8" />
                    </g>
                    <g className="spin-ring-rev">
                      <circle cx="150" cy="150" r="112" fill="none" stroke="rgba(212,175,55,.12)" strokeWidth="1" strokeDasharray="2 12" />
                    </g>
                    <g className="spin-ring" style={{ animationDuration: "20s" }}>
                      {Array.from({ length: 8 }, (_, i) => {
                        const a = (i / 8) * Math.PI * 2;
                        return <circle key={i} cx={150 + 138 * Math.cos(a)} cy={150 + 138 * Math.sin(a)} r="3" fill="rgba(212,175,55,.4)" />;
                      })}
                    </g>
                  </svg>
                  <div className="about-ring">
                    <div className="about-center-text">Premium<br />Since 2026</div>
                    <div className="about-dot" style={{ top: "10px", left: "50%", transform: "translateX(-50%)" }} />
                    <div className="about-dot" style={{ bottom: "10px", left: "50%", transform: "translateX(-50%)" }} />
                    <div className="about-dot" style={{ left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                    <div className="about-dot" style={{ right: "10px", top: "50%", transform: "translateY(-50%)" }} />
                  </div>
                </div>
              </div>
              <div className="col-md-7">
                <div className="section-label">Our Story</div>
                <h2 className="section-title" style={{ marginBottom: "1rem" }}>About Us</h2>
                <div className="gold-line" />
                <p className="about-text">Premium Royal Route was engineered out of a singular design philosophy: that every traveler deserves unhindered access to high-caliber, high-luxury driving experiences. Established in 2026, we have eliminated custom friction to marry a world-class performance fleet with absolute security.</p>
                <p className="about-text">From meticulous technical engineering audits to seamless executive concierge networks, we guarantee that the voyage mirrors your standard of excellence.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CALL TO ACTION SECTION ── */}
        <section className="cta-section">
          <div className="cta-bg-text">DRIVE</div>
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <h2 className="cta-title">Ready for Your Next Ride?</h2>
            <p className="cta-sub">Experience elite mechanical architecture and comfort through our curated vehicle ecosystem.</p>
            <button
              className="btn btn-lg"
              style={{
                background: activeBtn === "reserve"
                  ? "#ffe97a"
                  : "radial-gradient(circle 160px at var(--btn-mx, 50%) var(--btn-my, 50%), #ffffff 0%, #ffe97a 45%, #D4AF37 90%)",
                backgroundSize: "400% 400%",
                color: "#000",
                fontWeight: 600,
                letterSpacing: "2px",
                fontSize: ".85rem",
                padding: "0.9rem 2.75rem",
                cursor: "none",
                border: "none",
                borderRadius: "4px",
                transition: "transform 0.15s ease, box-shadow 0.2s ease, background 0.05s",
                transform: activeBtn === "reserve" ? "translateY(2px) scale(0.99)" : hoveredBtn === "reserve" ? "translateY(-4px)" : "none",
                boxShadow: activeBtn === "reserve"
                  ? "inset 0 4px 10px rgba(0,0,0,0.5)"
                  : hoveredBtn === "reserve"
                    ? "0 10px 35px rgba(212,175,55,0.75), 0 0 15px rgba(255,233,122,0.3)"
                    : "0 4px 25px rgba(212,175,55,0.25)"
              }}
              onMouseMove={onButtonMouseMove}
              onMouseEnter={() => setHoveredBtn("reserve")}
              onMouseLeave={() => { setHoveredBtn(null); setActiveBtn(null); }}
              onMouseDown={() => setActiveBtn("reserve")}
              onMouseUp={() => setActiveBtn(null)}
              onClick={handleClick}
            >
              Reserve Your Car
            </button>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="container">
            <div className="footer-logo">Premium Cars</div>
            <div className="footer-tagline">Luxury · Comfort · Mechanical Reliability</div>
            <hr className="footer-hr" />
            <div style={{ textAlign: "center", padding: "20px", color: "#D4AF37", fontFamily: "'Cinzel Decorative', serif", position: "relative" }}>
              <p className="footer-copy mb-0" style={{ margin: 0, fontSize: "0.9rem", letterSpacing: "1px", textShadow: "0 0 10px rgba(212,175,55,0.2)" }}>
                © {new Date().getFullYear()} Royal Route. All Rights Reserved.
              </p>
              <p className="footer-dev" style={{ margin: "6px 0 0", fontSize: "0.8rem", fontStyle: "italic", letterSpacing: "1px", opacity: 0.85 }}>
                Designed & Developed by Supain Nandy
              </p>
              <div style={{ width: "40%", height: "1px", margin: "16px auto 0", background: "linear-gradient(90deg, transparent, #D4AF37, #f5f5f5, #D4AF37, transparent)" }} />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;