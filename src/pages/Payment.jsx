import { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Calendar,
  ChevronLeft,
  Loader2,
  Car,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Banknote,
  Info
} from "lucide-react";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const bookingId = location.state?.bookingId;
  const amount = location.state?.amount || 0;
  const carName = location.state?.carName || "Premium Luxury Car";
  const pickupDate = location.state?.pickupDate;
  const returnDate = location.state?.returnDate;
  const pricePerDay = location.state?.pricePerDay;
  const carImage = location.state?.carImage || "";
  const seats = location.state?.seats || 5;
  const fuelType = location.state?.fuelType || "Petrol";
  const transmission = location.state?.transmission || "Automatic";

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("bypass"); // default to bypass since user's cards are restricted
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Card simulation state (purely cosmetic to make the simulation experience rich)
  const [cardHolder, setCardHolder] = useState("John Doe");
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [expiry, setExpiry] = useState("12/30");
  const [cvv, setCvv] = useState("123");

  // Format Date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days
  const start = pickupDate ? new Date(pickupDate) : null;
  const end = returnDate ? new Date(returnDate) : null;
  const totalDays = start && end ? Math.ceil((end - start) / (1000 * 3600 * 24)) || 1 : 1;

  // Cost breakdown
  const baseFare = pricePerDay ? pricePerDay * totalDays : Math.round(amount * 0.85);
  const serviceFee = Math.round(amount - baseFare);

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const { data } = await axios.post(
        "http://localhost:8000/payment/create-order",
        {
          amount,
        }
      );

      const options = {
        key: "rzp_test_T7hm9BL1wPK6Jd",
        amount: data.order.amount,
        currency: "INR",
        order_id: data.order.id,
        name: "Royal Route",
        description: `${carName} Booking`,
        prefill: {
          name: "Customer",
          email: "customer@gmail.com",
          contact: "9999999999",
        },
        notes: {
          bookingId,
        },
        theme: {
          color: "#D4AF37",
        },
        handler: async function (response) {
          try {
            setLoading(true);
            const verify = await axios.post(
              "http://localhost:8000/payment/verify",
              {
                bookingId,
                amount,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (verify.data.success) {
              setSuccess(true);
              setTimeout(() => {
                navigate("/user/mybookings", {
                  state: { paymentSuccess: true, message: "Payment Successful! Enjoy your drive." }
                });
              }, 2500);
            } else {
              setErrorMessage("Payment Verification Failed");
            }
          } catch (verifyErr) {
            console.log(verifyErr);
            setErrorMessage("Verification request failed. Please check backend.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.log(err);
      setErrorMessage(err.response?.data?.message || "Razorpay initialization failed.");
      setLoading(false);
    }
  };

  const handleBypassPayment = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Simulate a realistic processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const { data } = await axios.post(
        "http://localhost:8000/payment/bypass",
        {
          bookingId,
        }
      );

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/user/mybookings", {
            state: { paymentSuccess: true, message: "Mock Payment Successful! Booking Approved." }
          });
        }, 2500);
      } else {
        setErrorMessage("Mock Payment Failed on Server");
      }
    } catch (err) {
      console.log(err);
      setErrorMessage(err.response?.data?.message || "Mock bypass endpoint failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <AlertCircle size={60} color="#D4AF37" style={{ marginBottom: "20px" }} />
          <h2 style={styles.errorTitle}>Invalid Session</h2>
          <p style={styles.errorText}>No booking details were found. Please go back to My Bookings and initiate payment.</p>
          <button onClick={() => navigate("/user/mybookings")} style={styles.backBtnLarge}>
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* CSS Animations Injector */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 15px rgba(212,175,55,0.25); }
          50% { box-shadow: 0 0 30px rgba(212,175,55,0.5); }
          100% { box-shadow: 0 0 15px rgba(212,175,55,0.25); }
        }
        @keyframes checkScale {
          0% { transform: scale(0.7); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes rotateSpinner {
          to { transform: rotate(360deg); }
        }
        .anim-fade { animation: fadeIn 0.4s ease-out forwards; }
        .success-checkmark { animation: checkScale 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .pulse-card { animation: pulseGlow 2.5s infinite ease-in-out; }
        @media (max-width: 800px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate("/user/mybookings")} style={styles.backBtn}>
          <ChevronLeft size={20} />
          <span>Back to Bookings</span>
        </button>
        <div style={styles.logoGroup}>
          <Sparkles size={24} color="#D4AF37" />
          <span style={styles.logoText}>Royal Route</span>
        </div>
      </div>

      <div style={styles.contentGrid} className="anim-fade checkout-grid">
        {/* Left Column - Booking Summary */}
        <div style={styles.leftColumn}>
          <h2 style={styles.sectionTitle}>Booking Details</h2>
          <div style={styles.carCard} className="pulse-card">
            {carImage ? (
              <img src={carImage} alt={carName} style={styles.carImg} />
            ) : (
              <div style={styles.carPlaceholder}>
                <Car size={64} color="#D4AF37" />
              </div>
            )}
            <div style={styles.carOverlay}>
              <span style={styles.carTag}>Luxury Fleet</span>
              <h3 style={styles.carTitle}>{carName}</h3>
            </div>
          </div>

          {/* Quick Specifications */}
          <div style={styles.specGrid}>
            <div style={styles.specItem}>
              <span style={styles.specLabel}>Seats</span>
              <span style={styles.specValue}>{seats ? `${seats} Seats` : "Premium"}</span>
            </div>
            <div style={styles.specItem}>
              <span style={styles.specLabel}>Fuel</span>
              <span style={styles.specValue}>{fuelType || "Petrol"}</span>
            </div>
            <div style={styles.specItem}>
              <span style={styles.specLabel}>Gear</span>
              <span style={styles.specValue}>{transmission || "Automatic"}</span>
            </div>
          </div>

          {/* Timeline */}
          <div style={styles.summaryCard}>
            <div style={styles.timelineRow}>
              <div style={styles.timelinePoint}>
                <div style={styles.dotGold} />
                <span style={styles.timelineLabel}>PICKUP</span>
                <span style={styles.timelineVal}>{formatDate(pickupDate)}</span>
              </div>
              <div style={styles.timelineDivider}>
                <span style={styles.daysBadge}>{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</span>
              </div>
              <div style={{ ...styles.timelinePoint, textAlign: "right" }}>
                <div style={styles.dotGoldRight} />
                <span style={styles.timelineLabel}>RETURN</span>
                <span style={styles.timelineVal}>{formatDate(returnDate)}</span>
              </div>
            </div>

            <hr style={styles.cardDivider} />

            <h4 style={styles.breakdownHeader}>Cost Breakdown</h4>
            <div style={styles.breakdownRow}>
              <span style={styles.breakdownLabel}>
                Base Rental ({totalDays} {totalDays === 1 ? 'day' : 'days'})
              </span>
              <span style={styles.breakdownValue}>₹{baseFare.toLocaleString("en-IN")}</span>
            </div>
            <div style={styles.breakdownRow}>
              <span style={styles.breakdownLabel}>Service Fees & GST (18%)</span>
              <span style={styles.breakdownValue}>₹{serviceFee.toLocaleString("en-IN")}</span>
            </div>

            <hr style={styles.cardDivider} />

            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total Amount</span>
              <span style={styles.totalValue}>₹{Number(amount).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Payment Panel */}
        <div style={styles.rightColumn}>
          <h2 style={styles.sectionTitle}>Secure Payment</h2>
          
          {/* Tabs */}
          <div style={styles.tabContainer}>
            <button
              onClick={() => { setActiveTab("bypass"); setErrorMessage(""); }}
              style={{
                ...styles.tab,
                ...(activeTab === "bypass" ? styles.activeTab : styles.inactiveTab),
              }}
            >
              <Sparkles size={16} style={{ marginRight: "8px" }} />
              Test Bypass (Simulated)
            </button>
            <button
              onClick={() => { setActiveTab("razorpay"); setErrorMessage(""); }}
              style={{
                ...styles.tab,
                ...(activeTab === "razorpay" ? styles.activeTab : styles.inactiveTab),
              }}
            >
              <CreditCard size={16} style={{ marginRight: "8px" }} />
              Razorpay Secure
            </button>
          </div>

          {/* Form Area */}
          <div style={styles.formCard}>
            {errorMessage && (
              <div style={styles.errorAlert}>
                <AlertCircle size={18} style={{ marginRight: "8px" }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {activeTab === "bypass" ? (
              <div style={styles.bypassSection}>
                <div style={styles.infoBanner}>
                  <Info size={18} color="#D4AF37" style={{ marginRight: "10px", flexShrink: 0 }} />
                  <p style={styles.infoText}>
                    <strong>Simulated Sandbox:</strong> Use this method if your credit/debit card does not support international transactions. This avoids the Razorpay payment gateway, simulating a successful transaction locally.
                  </p>
                </div>

                <div style={styles.creditCardMock}>
                  <div style={styles.cardHeader}>
                    <Sparkles size={20} color="#D4AF37" />
                    <span style={styles.cardLogo}>ROYAL PLATINUM</span>
                  </div>
                  <div style={styles.chip} />
                  <div style={styles.cardNumberDisplay}>{cardNumber}</div>
                  <div style={styles.cardFooter}>
                    <div style={styles.cardFooterCol}>
                      <span style={styles.cardFooterLabel}>CARDHOLDER</span>
                      <span style={styles.cardFooterValue}>{cardHolder.toUpperCase()}</span>
                    </div>
                    <div style={styles.cardFooterCol}>
                      <span style={styles.cardFooterLabel}>EXPIRES</span>
                      <span style={styles.cardFooterValue}>{expiry}</span>
                    </div>
                  </div>
                </div>

                {/* Mock Card Form Fields */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    style={styles.input}
                    placeholder="John Doe"
                  />
                </div>

                <div style={styles.inputRow}>
                  <div style={{ ...styles.inputGroup, flex: 2 }}>
                    <label style={styles.label}>Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={styles.input}
                      placeholder="4111 2222 3333 4444"
                    />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>Expiry</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      style={styles.input}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      style={styles.input}
                      placeholder="123"
                    />
                  </div>
                </div>

                <button
                  onClick={handleBypassPayment}
                  disabled={loading}
                  style={styles.payBtn}
                >
                  {loading ? (
                    <span style={styles.loaderFlex}>
                      <Loader2 size={20} style={styles.spinner} />
                      Simulating Transaction...
                    </span>
                  ) : (
                    `Complete Mock Payment (₹${amount})`
                  )}
                </button>
              </div>
            ) : (
              <div style={styles.razorpaySection}>
                <div style={styles.infoBanner}>
                  <Info size={18} color="#D4AF37" style={{ marginRight: "10px", flexShrink: 0 }} />
                  <p style={styles.infoText}>
                    <strong>Razorpay Checkout:</strong> Recommended for users with UPI, Indian Netbanking, or domestic debit cards. You will be redirected to the secure Razorpay sandbox gateway interface.
                  </p>
                </div>

                <div style={styles.razorpayDisplay}>
                  <span style={styles.gatewayBadge}>Live Gateway Sandbox</span>
                  <div style={styles.paymentBox}>
                    <Banknote size={48} color="#D4AF37" />
                    <span style={styles.gatewayName}>RAZORPAY</span>
                  </div>
                  <p style={styles.gatewayTerms}>Supports UPI, Cards, Netbanking & Mobile Wallets</p>
                </div>

                <button
                  onClick={handleRazorpayPayment}
                  disabled={loading}
                  style={styles.payBtnGold}
                >
                  {loading ? (
                    <span style={styles.loaderFlex}>
                      <Loader2 size={20} style={styles.spinner} />
                      Opening Secure Portal...
                    </span>
                  ) : (
                    `Pay via Razorpay Portal (₹${amount})`
                  )}
                </button>
              </div>
            )}

            <div style={styles.trustBadge}>
              <Lock size={14} color="#888" style={{ marginRight: "5px" }} />
              <span style={styles.trustText}>Secured by 256-bit SSL encryption. Royal Route guarantees transaction security.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Overlay */}
      {success && (
        <div style={styles.overlay}>
          <div style={styles.successCard} className="success-checkmark">
            <div style={styles.checkCircle}>
              <CheckCircle2 size={72} color="#D4AF37" />
            </div>
            <h2 style={styles.successTitle}>Payment Approved</h2>
            <p style={styles.successText}>Thank you for choosing Royal Route. Your car rental reservation has been successfully booked and approved!</p>
            <div style={styles.receiptBox}>
              <div style={styles.receiptLine}>
                <span style={styles.receiptLabel}>Transaction Status</span>
                <span style={{ ...styles.receiptValue, color: "#4CAF50", fontWeight: "bold" }}>SUCCESS</span>
              </div>
              <div style={styles.receiptLine}>
                <span style={styles.receiptLabel}>Booking Reference</span>
                <span style={styles.receiptValue}>{bookingId}</span>
              </div>
              <div style={styles.receiptLine}>
                <span style={styles.receiptLabel}>Total Charged</span>
                <span style={styles.receiptValue}>₹{amount}</span>
              </div>
            </div>
            <div style={styles.redirectBanner}>
              <Loader2 size={16} style={{ ...styles.spinner, marginRight: "10px" }} />
              <span>Redirecting you to My Bookings...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#000000",
    color: "#ffffff",
    padding: "30px 40px",
    fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    animation: "fadeIn 0.5s ease-out",
  },
  backBtn: {
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "#fff",
    borderRadius: "10px",
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#D4AF37",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "40px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#ffffff",
    borderLeft: "4px solid #D4AF37",
    paddingLeft: "12px",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  carCard: {
    position: "relative",
    height: "220px",
    borderRadius: "20px",
    overflow: "hidden",
    background: "#121212",
    border: "1px solid rgba(212, 175, 55, 0.15)",
  },
  carImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.65,
  },
  carPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #111, #1e1e1e)",
  },
  carOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "24px",
    background: "linear-gradient(to top, rgba(0,0,0,0.9) 20%, transparent 100%)",
  },
  carTag: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color: "#D4AF37",
    fontWeight: "bold",
    display: "inline-block",
    marginBottom: "5px",
  },
  carTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
  },
  specGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  specItem: {
    background: "#0a0a0a",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "12px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  specLabel: {
    color: "#666",
    fontSize: "11px",
    textTransform: "uppercase",
  },
  specValue: {
    color: "#fff",
    fontSize: "13px",
    fontWeight: "bold",
  },
  summaryCard: {
    background: "rgba(18, 18, 18, 0.6)",
    backdropFilter: "blur(15px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "24px",
  },
  timelineRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timelinePoint: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    position: "relative",
  },
  dotGold: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#D4AF37",
    position: "absolute",
    left: 0,
    top: "-15px",
  },
  dotGoldRight: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#D4AF37",
    position: "absolute",
    right: 0,
    top: "-15px",
  },
  timelineLabel: {
    fontSize: "10px",
    color: "#888",
    fontWeight: "600",
    letterSpacing: "1px",
  },
  timelineVal: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
  },
  timelineDivider: {
    flex: 1,
    height: "1px",
    borderTop: "1px dashed rgba(212,175,55,0.3)",
    margin: "0 20px",
    display: "flex",
    justifyContent: "center",
    position: "relative",
  },
  daysBadge: {
    position: "absolute",
    top: "-11px",
    background: "#D4AF37",
    color: "#000",
    fontSize: "10px",
    fontWeight: "800",
    padding: "2px 8px",
    borderRadius: "20px",
    textTransform: "uppercase",
  },
  cardDivider: {
    border: "none",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    margin: "20px 0",
  },
  breakdownHeader: {
    color: "#D4AF37",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "0 0 15px 0",
  },
  breakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#aaa",
    marginBottom: "10px",
  },
  breakdownLabel: {
    fontWeight: "400",
  },
  breakdownValue: {
    color: "#fff",
    fontWeight: "600",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#fff",
  },
  totalValue: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#D4AF37",
  },
  tabContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "rgba(255,255,255,0.04)",
    padding: "6px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  tab: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  activeTab: {
    background: "#D4AF37",
    color: "#000",
    boxShadow: "0 4px 15px rgba(212, 175, 55, 0.2)",
  },
  inactiveTab: {
    background: "transparent",
    color: "#888",
  },
  formCard: {
    background: "#0c0c0c",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  infoBanner: {
    background: "rgba(212, 175, 55, 0.08)",
    borderLeft: "3px solid #D4AF37",
    borderRadius: "10px",
    padding: "12px 16px",
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  infoText: {
    margin: 0,
    fontSize: "13px",
    color: "#ddd",
    lineHeight: "1.4",
  },
  creditCardMock: {
    background: "linear-gradient(135deg, #161616, #2a2a2a, #111)",
    borderRadius: "16px",
    height: "180px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "24px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 15px 30px rgba(0,0,0,0.4)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLogo: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#D4AF37",
    letterSpacing: "2px",
  },
  chip: {
    width: "40px",
    height: "30px",
    borderRadius: "6px",
    background: "linear-gradient(135deg, #ffe97a, #D4AF37)",
    opacity: 0.8,
  },
  cardNumberDisplay: {
    fontSize: "20px",
    fontFamily: "monospace",
    letterSpacing: "3.5px",
    color: "#fff",
    margin: "10px 0",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
  },
  cardFooterCol: {
    display: "flex",
    flexDirection: "column",
  },
  cardFooterLabel: {
    fontSize: "8px",
    color: "#666",
    letterSpacing: "1px",
    marginBottom: "2px",
  },
  cardFooterValue: {
    fontSize: "12px",
    color: "#fff",
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "16px",
  },
  inputRow: {
    display: "flex",
    gap: "14px",
    marginBottom: "24px",
  },
  label: {
    fontSize: "12px",
    color: "#888",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  payBtn: {
    width: "100%",
    padding: "16px",
    background: "#D4AF37",
    color: "#000",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(212, 175, 55, 0.3)",
    transition: "all 0.3s ease",
  },
  payBtnGold: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #FFE885, #D4AF37)",
    color: "#000",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(212, 175, 55, 0.4)",
    transition: "all 0.3s ease",
  },
  loaderFlex: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    animation: "rotateSpinner 1s linear infinite",
  },
  razorpaySection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  razorpayDisplay: {
    background: "rgba(255,255,255,0.02)",
    border: "1px dashed rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  gatewayBadge: {
    fontSize: "10px",
    background: "rgba(76, 175, 80, 0.15)",
    color: "#4CAF50",
    padding: "3px 8px",
    borderRadius: "20px",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  paymentBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  gatewayName: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: "2px",
  },
  gatewayTerms: {
    fontSize: "12px",
    color: "#666",
    margin: 0,
  },
  trustBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "20px",
    textAlign: "center",
  },
  trustText: {
    fontSize: "11px",
    color: "#666",
  },
  errorAlert: {
    background: "rgba(244, 67, 54, 0.1)",
    borderLeft: "3px solid #f44336",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#f44336",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  // Success Overlay
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  successCard: {
    background: "#0c0c0c",
    border: "2px solid #D4AF37",
    borderRadius: "24px",
    padding: "40px",
    maxWidth: "500px",
    width: "90%",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(212, 175, 55, 0.25)",
  },
  checkCircle: {
    marginBottom: "20px",
    display: "inline-block",
  },
  successTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#fff",
    margin: "0 0 10px 0",
  },
  successText: {
    fontSize: "14px",
    color: "#aaa",
    lineHeight: "1.5",
    margin: "0 0 24px 0",
  },
  receiptBox: {
    background: "rgba(255,255,255,0.03)",
    borderRadius: "14px",
    padding: "18px",
    textAlign: "left",
    marginBottom: "24px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  receiptLine: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    marginBottom: "10px",
  },
  receiptLabel: {
    color: "#666",
  },
  receiptValue: {
    color: "#fff",
    fontWeight: "600",
  },
  redirectBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#888",
    fontSize: "13px",
  },
  // Global Error state
  errorContainer: {
    minHeight: "100vh",
    backgroundColor: "#000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  errorCard: {
    background: "#0c0c0c",
    border: "1px solid rgba(212, 175, 55, 0.3)",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "450px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  errorTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 10px 0",
    color: "#fff",
  },
  errorText: {
    fontSize: "14px",
    color: "#aaa",
    lineHeight: "1.5",
    marginBottom: "24px",
  },
  backBtnLarge: {
    background: "#D4AF37",
    color: "#000",
    border: "none",
    borderRadius: "10px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(212, 175, 55, 0.2)",
  },
};

export default Payment;