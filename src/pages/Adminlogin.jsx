import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API}/admin/login`, form);
      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/admin-dashboard");
    } catch (e) {
      setError(e.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

.al-root{
  min-height:100vh;
  background:#050505;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;
  font-family:'DM Sans',sans-serif;
  position:relative;
  overflow:hidden;
}

.al-root::before{
  content:'';
  position:absolute;
  width:700px;
  height:700px;
  border-radius:50%;
  top:-250px;
  right:-250px;
  background:radial-gradient(
    circle,
    rgba(212,175,55,0.18) 0%,
    transparent 70%
  );
}

.al-root::after{
  content:'';
  position:absolute;
  width:600px;
  height:600px;
  border-radius:50%;
  bottom:-250px;
  left:-250px;
  background:radial-gradient(
    circle,
    rgba(212,175,55,0.12) 0%,
    transparent 70%
  );
}

.al-card{
  width:100%;
  max-width:450px;
  position:relative;
  z-index:2;

  background:linear-gradient(
    145deg,
    rgba(18,18,18,0.98),
    rgba(8,8,8,0.98)
  );

  border:1px solid rgba(212,175,55,0.30);
  border-radius:30px;

  padding:52px 42px;

  backdrop-filter:blur(20px);

  box-shadow:
    0 0 0 1px rgba(212,175,55,0.08),
    0 20px 80px rgba(0,0,0,0.85),
    0 0 60px rgba(212,175,55,0.08);
}

.al-card::before{
  content:'';
  position:absolute;
  inset:0;
  border-radius:30px;
  padding:1px;
  background:linear-gradient(
    135deg,
    rgba(245,215,110,.6),
    transparent,
    rgba(212,175,55,.4)
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor;
  mask-composite:exclude;
  pointer-events:none;
}

.al-logo{
  font-family:'Playfair Display',serif;
  font-size:36px;
  font-weight:700;
  text-align:center;
  color:#ffffff;
  margin-bottom:8px;
  letter-spacing:1px;
  text-shadow:0 0 25px rgba(212,175,55,.18);
}

.al-logo span{
  color:#D4AF37;
}

.al-subtitle{
  text-align:center;
  color:rgba(255,255,255,0.55);
  font-size:13px;
  letter-spacing:2px;
  text-transform:uppercase;
  margin-bottom:38px;
}

.al-field{
  margin-bottom:22px;
}

.al-label{
  display:block;
  margin-bottom:8px;

  color:rgba(212,175,55,.85);

  font-size:11px;
  font-weight:700;

  text-transform:uppercase;
  letter-spacing:1.5px;
}

.al-input{
  width:100%;
  padding:15px 18px;

  background:rgba(255,255,255,.03);

  border:1px solid rgba(212,175,55,.15);

  border-radius:14px;

  color:#ffffff;

  font-size:14px;
  font-family:'DM Sans',sans-serif;

  outline:none;
  transition:.35s ease;
}

.al-input::placeholder{
  color:rgba(255,255,255,.25);
}

.al-input:focus{
  border-color:#D4AF37;

  background:rgba(212,175,55,.03);

  box-shadow:
    0 0 0 4px rgba(212,175,55,.08),
    0 0 25px rgba(212,175,55,.12);
}

.al-error{
  background:rgba(255,59,59,.08);
  border:1px solid rgba(255,59,59,.18);
  color:#ffb3b3;

  padding:14px;
  border-radius:14px;

  font-size:13px;
  margin-bottom:20px;
}

.al-btn{
  width:100%;
  padding:16px;

  border:none;
  border-radius:14px;

  cursor:pointer;

  font-size:15px;
  font-weight:700;

  letter-spacing:1px;
  text-transform:uppercase;

  background:linear-gradient(
    135deg,
    #F5D76E,
    #D4AF37,
    #B8860B
  );

  color:#050505;

  box-shadow:
    0 12px 30px rgba(212,175,55,.25),
    0 0 20px rgba(212,175,55,.15);

  transition:.35s ease;
}

.al-btn:hover{
  transform:translateY(-3px);

  box-shadow:
    0 18px 40px rgba(212,175,55,.35),
    0 0 30px rgba(212,175,55,.25);
}

.al-btn:active{
  transform:scale(.98);
}

.al-btn:disabled{
  opacity:.6;
  cursor:not-allowed;
}

@keyframes spin{
  to{
    transform:rotate(360deg);
  }
}

.spinner{
  display:inline-block;
  width:16px;
  height:16px;

  border:2px solid rgba(0,0,0,.25);
  border-top-color:#000;

  border-radius:50%;

  animation:spin .7s linear infinite;
  margin-right:8px;
  vertical-align:middle;
}
`}</style>

      <div className="al-root">
        <div className="al-card">
          <h1 className="al-logo"> <span>Royal Route </span>Admin</h1>
          <p className="al-subtitle">Administrator Portal — Secure Access</p>

          {error && <div className="al-error">{error}</div>}

          <div className="al-field">
            <label className="al-label">Email Address</label>
            <input
              className="al-input"
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="al-field">
            <label className="al-label">Password</label>
            <input
              className="al-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <button className="al-btn" onClick={handleSubmit} disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;