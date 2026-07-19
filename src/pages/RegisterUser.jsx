import React, { useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, ArrowLeft, Sparkles } from "lucide-react";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/firebase";

const RegisterUser = () => {
  const navigate = useNavigate();
  
  const [alertConfig, setAlertConfig] = useState({ show: false, message: "", type: "success" });

  const triggerAlert = (message, type = "success") => {
    setAlertConfig({ show: true, message, type });
    setTimeout(() => {
      setAlertConfig({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    onSubmit: async (values) => {
      try {
        const userData = {
          name: values.firstName + " " + values.lastName,
          email: values.email,
          password: values.password,
        };

        const response = await axios.post(
          "http://localhost:8000/users/register",
          userData
        );

        console.log(response.data);
        triggerAlert("Registration Successful! Redirecting to login...", "success");
        setTimeout(() => {
          navigate("/login-user");
        }, 1500);
      } catch (error) {
        console.error("Registration Error:", error);
        if (error.response) {
          triggerAlert(error.response.data.message || "Registration Failed", "error");
        } else {
          triggerAlert("Something went wrong with the connection!", "error");
        }
      }
    },

    validationSchema: Yup.object({
      firstName: Yup.string()
        .matches(/^[A-Za-z]+$/, "Only alphabets allowed")
        .required("First Name is required"),

      lastName: Yup.string()
        .matches(/^[A-Za-z]+$/, "Only alphabets allowed")
        .required("Last Name is required"),

      email: Yup.string()
        .email("Invalid Email")
        .required("Email is required"),

      password: Yup.string()
        .matches(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
          "Must contain uppercase, lowercase, number & special character"
        )
        .min(6, "Minimum 6 characters")
        .required("Password is required"),

      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
    }),
  });

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const response = await axios.post(
        "http://localhost:8000/users/google-login",
        { token }
      );

      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("name", response.data.user.name);

      triggerAlert("Google Cryptographic Token Accepted!", "success");

      setTimeout(() => {
        navigate("/user/dashboard");
      }, 1500);
    } catch (error) {
      console.error(error);
      triggerAlert("Google Handshake Aborted.", "error");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .auth-page {
          min-height: 100vh;
          background-color: #030303;
          background-image: 
            radial-gradient(circle at 50% 20%, rgba(201, 168, 76, 0.08), transparent 50%),
            radial-gradient(circle at 10% 80%, rgba(201, 168, 76, 0.02), transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(201, 168, 76, 0.02), transparent 40%);
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .auth-glow-1 {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201, 168, 76, 0.05) 0%, transparent 70%);
          top: -10%;
          left: -10%;
          pointer-events: none;
        }

        .auth-glow-2 {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201, 168, 76, 0.03) 0%, transparent 70%);
          bottom: -10%;
          right: -10%;
          pointer-events: none;
        }

        /* Glass Card */
        .auth-card {
          width: 100%;
          max-width: 520px;
          background: rgba(10, 10, 10, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(201, 168, 76, 0.16);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.05);
          position: relative;
          z-index: 2;
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
        }

        .auth-card:hover {
          border-color: rgba(201, 168, 76, 0.3);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(201, 168, 76, 0.04);
        }

        /* Branding */
        .auth-logo {
          font-family: 'Cinzel', serif;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 5px;
          color: #d4af37;
          text-align: center;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .auth-subtitle {
          font-size: 0.65rem;
          letter-spacing: 4px;
          color: #888;
          text-align: center;
          text-transform: uppercase;
          margin-bottom: 24px;
          font-weight: 500;
        }

        .auth-title {
          font-family: 'Cinzel', serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 30px;
          text-align: center;
          letter-spacing: 1px;
        }

        .auth-title span {
          color: #d4af37;
        }

        /* Side-by-side row setup */
        .auth-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 576px) {
          .auth-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }

        /* Input styling */
        .auth-input-group {
          margin-bottom: 20px;
          position: relative;
        }

        .auth-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(201, 168, 76, 0.85);
          margin-bottom: 8px;
          display: block;
        }

        .auth-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .auth-icon {
          position: absolute;
          left: 16px;
          color: rgba(201, 168, 76, 0.5);
          transition: color 0.3s ease;
        }

        .auth-field {
          width: 100%;
          background: rgba(5, 5, 5, 0.8) !important;
          border: 1px solid rgba(201, 168, 76, 0.2) !important;
          border-radius: 12px !important;
          padding: 14px 16px 14px 46px !important;
          color: #fff !important;
          font-size: 14px;
          font-weight: 400;
          outline: none;
          transition: all 0.3s ease;
        }

        .auth-field:focus {
          border-color: #d4af37 !important;
          background: rgba(15, 15, 15, 0.95) !important;
          box-shadow: 0 0 16px rgba(201, 168, 76, 0.15) !important;
        }

        .auth-field:focus + .auth-icon {
          color: #d4af37;
        }

        .auth-error-msg {
          color: #ea4335;
          font-size: 11px;
          margin-top: 6px;
          display: block;
          font-weight: 500;
          letter-spacing: 0.2px;
          animation: errorFadeIn 0.3s ease-out;
        }

        @keyframes errorFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Actions */
        .auth-btn-primary {
          background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
          color: #000;
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 2px;
          border: none;
          border-radius: 12px;
          padding: 14px;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(184, 134, 11, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
        }

        .auth-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.35);
          background: linear-gradient(135deg, #e8c97a 0%, #d4af37 100%);
        }

        .auth-btn-primary:active {
          transform: translateY(0);
        }

        .auth-divider {
          display: flex;
          align-items: center;
          margin: 24px 0;
          color: rgba(255, 255, 255, 0.2);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(251, 215, 0, 0.08);
        }

        .auth-divider::before {
          margin-right: 16px;
        }

        .auth-divider::after {
          margin-left: 16px;
        }

        .auth-btn-google {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.85);
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          border-radius: 12px;
          padding: 12px;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .auth-btn-google:hover {
          background: rgba(201, 168, 76, 0.06);
          border-color: rgba(201, 168, 76, 0.4);
          color: #fff;
          transform: translateY(-1px);
        }

        .auth-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.45);
        }

        .auth-link {
          color: #d4af37;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
          margin-left: 6px;
        }

        .auth-link:hover {
          color: #e8c97a;
          text-decoration: underline;
        }

        .auth-back-btn {
          position: absolute;
          top: 30px;
          left: 30px;
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 2px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          z-index: 10;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 10px 18px;
          border-radius: 30px;
          backdrop-filter: blur(10px);
        }

        .auth-back-btn:hover {
          color: #d4af37;
          border-color: rgba(201, 168, 76, 0.3);
          background: rgba(201, 168, 76, 0.04);
          transform: translateX(-3px);
        }

        /* Custom Notifications */
        .auth-toast {
          position: fixed;
          top: 30px;
          right: 30px;
          background: rgba(10, 10, 10, 0.9);
          border: 1px solid #d4af37;
          box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(201, 168, 76, 0.1);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 10000;
          backdrop-filter: blur(10px);
          animation: toastIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          color: #fff;
          font-size: 13px;
        }

        .auth-toast.error {
          border-color: #ea4335;
          box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(234, 67, 53, 0.15);
        }

        @keyframes toastIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-glow-1" />
        <div className="auth-glow-2" />

        <Link to="/" className="auth-back-btn">
          <ArrowLeft size={14} />
          Back to Home
        </Link>

        {alertConfig.show && (
          <div className={`auth-toast ${alertConfig.type}`}>
            {alertConfig.type === "success" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea4335" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <span>{alertConfig.message}</span>
          </div>
        )}

        <div className="auth-card">
          <div className="auth-logo">Royal Route</div>
          <div className="auth-subtitle">Premium Fleet Services</div>
          
          <div className="auth-title">
            Create <span>Account</span>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="auth-row">
              <div className="auth-input-group">
                <label className="auth-label">First Name</label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-icon" />
                  <input
                    type="text"
                    name="firstName"
                    className="auth-field"
                    placeholder="John"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.firstName && formik.errors.firstName && (
                  <span className="auth-error-msg">{formik.errors.firstName}</span>
                )}
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Last Name</label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-icon" />
                  <input
                    type="text"
                    name="lastName"
                    className="auth-field"
                    placeholder="Doe"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.lastName && formik.errors.lastName && (
                  <span className="auth-error-msg">{formik.errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-icon" />
                <input
                  type="email"
                  name="email"
                  className="auth-field"
                  placeholder="name@domain.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <span className="auth-error-msg">{formik.errors.email}</span>
              )}
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-icon" />
                <input
                  type="password"
                  name="password"
                  className="auth-field"
                  placeholder="••••••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <span className="auth-error-msg">{formik.errors.password}</span>
              )}
            </div>

            <div className="auth-input-group" style={{ marginBottom: "30px" }}>
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  className="auth-field"
                  placeholder="••••••••••••"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <span className="auth-error-msg">{formik.errors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className="auth-btn-primary">
              <Sparkles size={15} />
              Register Account
            </button>

            <div className="auth-divider">Or</div>

            <button type="button" onClick={handleGoogleLogin} className="auth-btn-google">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign Up with Google
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?
            <Link to="/login-user" className="auth-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterUser;