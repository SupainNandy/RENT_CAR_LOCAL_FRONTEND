import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Send,
  X,
  MessageCircle,
  CarFront,
  RotateCcw,
  Sparkles,
  CalendarDays,
  MapPin,
  BadgeIndianRupee,
} from "lucide-react";

// Requires Bootstrap 5 CSS to be loaded globally, e.g. in main.jsx:
// import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = import.meta.env.VITE_BACKEND_URI;

const QUICK_PROMPTS = [
  {
    label: "Luxury Cars",
    icon: Sparkles,
    text: "Show me luxury cars available for rent",
  },
  {
    label: "Automatic Cars",
    icon: CarFront,
    text: "Show automatic cars under 5000 per day",
  },
  {
    label: "My Bookings",
    icon: CalendarDays,
    text: "Show my bookings",
  },
  {
    label: "Cars in Kolkata",
    icon: MapPin,
    text: "Show cars available in Kolkata",
  },
];

export default function UserChat() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const [closing, setClosing] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Welcome to Royal Route AI. Tell me your budget, location, preferred car type, or travel dates and I will help you find the best car.",
      cars: [],
      time: new Date(),
    },
  ]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      const isMobile = window.matchMedia("(max-width: 575.98px)").matches;
      if (isMobile) document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200);
  };

  const formatTime = (date) =>
    new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));

  const addAssistantMessage = (text, cars = []) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text,
        cars,
        time: new Date(),
      },
    ]);
  };

  const resetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        text: "Welcome back. What kind of car would you like to rent today?",
        cars: [],
        time: new Date(),
      },
    ]);
    setMessage("");
    setShowPrompts(true);
  };

  const getImage = (car) => {
    if (car?.images?.length > 0 && car.images[0]) return car.images[0];
    return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80";
  };

  // Reserve Now must hand the full car object to BookingPage via router state,
  // since BookingPage reads location.state?.car and shows a "not found" screen
  // if that state is missing. It should also dismiss the chat panel first —
  // otherwise the panel stays open, floating over the BookingPage underneath.
  const goToBooking = (car) => {
    setOpen(false);
    setClosing(false);
    navigate(`/user/booking/${car._id}`, { state: { car } });
  };

  const sendMessage = async (customText = "") => {
    const text = (customText || message).trim();
    if (!text || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text, time: new Date() },
    ]);

    setMessage("");
    setShowPrompts(false);
    setLoading(true);

    try {
      const token = localStorage.getItem("userToken");

      if (!token || token === "null" || token === "undefined") {
        addAssistantMessage(
          "Your login session is missing. Please login again to use Royal Route AI."
        );
        return;
      }

      const response = await axios.post(
        `${API_URL}/users/ai-chat`,
        { message: text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      addAssistantMessage(
        response.data?.reply || "I found some cars that may be suitable for you.",
        response.data?.cars || []
      );
    } catch (error) {
      console.log("AI Chat Error:", error.response?.data || error.message);

      const status = error.response?.status;
      const errorMessage = error.response?.data?.message;

      if (status === 401 || errorMessage === "Token is missing" || errorMessage === "Invalid token") {
        localStorage.removeItem("userToken");
        addAssistantMessage(
          "Your login session has expired. Please login again and try once more."
        );
      } else {
        addAssistantMessage(
          "Something went wrong while contacting Royal Route AI. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Royal Route AI chat"
          className="rr-launcher btn d-flex align-items-center gap-2 position-fixed rounded-pill fw-bold border-0"
        >
          <span className="rr-launcher-icon position-relative d-flex align-items-center justify-content-center">
            <MessageCircle size={19} />
            <span className="rr-ping position-absolute top-0 start-0 w-100 h-100 rounded-circle" />
          </span>
          <span className="d-none d-sm-inline">Ask Royal Route AI</span>
        </button>
      )}

      {/* Backdrop (mobile only) */}
      {open && (
        <div
          onClick={handleClose}
          aria-hidden="true"
          className={`rr-backdrop position-fixed top-0 start-0 w-100 h-100 d-sm-none ${
            closing ? "rr-fade-out" : "rr-fade-in"
          }`}
        />
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Royal Route AI chat"
          className={`rr-panel position-fixed d-flex flex-column ${
            closing ? "rr-slide-out" : "rr-slide-in"
          }`}
        >
          {/* Header */}
          <div className="rr-header px-3 px-sm-4 py-3 py-sm-4 flex-shrink-0 position-relative">
            <div className="d-flex align-items-center justify-content-between gap-3 position-relative">
              <div className="d-flex align-items-center gap-3 text-truncate">
                <div className="rr-avatar d-flex align-items-center justify-content-center rounded-3 flex-shrink-0">
                  <Bot size={20} />
                </div>
                <div className="text-truncate">
                  <h3 className="rr-title mb-0 text-truncate">Royal Route AI</h3>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    {/* <span className="rr-status-dot rounded-circle flex-shrink-0" /> */}
                    <p className="rr-subtitle mb-0 text-truncate">Premium Car Rental Assistant</p>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-1 flex-shrink-0">
                <button
                  onClick={resetChat}
                  aria-label="Reset chat"
                  className="btn btn-sm rr-icon-btn rounded-3 d-flex align-items-center justify-content-center"
                  title="Reset chat"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={handleClose}
                  aria-label="Close chat"
                  className="btn btn-sm rr-icon-btn rounded-3 d-flex align-items-center justify-content-center"
                  title="Close chat"
                >
                  <X size={19} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="rr-messages flex-grow-1 overflow-auto px-3 px-sm-4 py-3">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`d-flex mb-3 rr-fade-in-up ${
                  item.role === "user" ? "justify-content-end" : "justify-content-start"
                }`}
              >
                <div
                  className={`rr-bubble px-3 py-2 ${
                    item.role === "user" ? "rr-bubble-user" : "rr-bubble-assistant"
                  }`}
                >
                  {item.role === "assistant" && (
                    <div className="d-flex align-items-center gap-1 mb-2 rr-label">
                      <Bot size={12} />
                      <span>ROYAL ROUTE AI</span>
                    </div>
                  )}

                  <p className="mb-0 rr-msg-text" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {item.text}
                  </p>

                  {item.cars?.length > 0 && (
                    <div className="mt-3 rr-car-list">
                      {item.cars.map((car) => (
                        <div key={car._id} className="rr-car-card rounded-4 overflow-hidden">
                          <div className="rr-img-wrap">
                            <img
                              src={getImage(car)}
                              alt={`${car.brand} ${car.model}`}
                              loading="lazy"
                              className="rr-car-img"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80";
                              }}
                            />
                            <span className="rr-price-badge">
                              <BadgeIndianRupee size={12} />
                              {car.pricePerDay || 0}/day
                            </span>
                          </div>

                          <div className="p-3">
                            <h4 className="rr-car-name mb-2">
                              {car.brand} {car.model}
                            </h4>

                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {car.transmission && <span className="rr-tag">{car.transmission}</span>}
                              {car.seats && <span className="rr-tag">{car.seats} Seats</span>}
                              {car.fuelType && <span className="rr-tag">{car.fuelType}</span>}
                            </div>

                            {car.location && (
                              <p className="rr-car-loc d-flex align-items-center gap-1 mb-3">
                                <MapPin size={13} className="flex-shrink-0" />
                                <span className="text-truncate">{car.location}</span>
                              </p>
                            )}

                            <button
                              onClick={() => goToBooking(car)}
                              className="btn rr-cta w-100 d-flex align-items-center justify-content-center gap-2 fw-bold rounded-3 border-0"
                            >
                              <CarFront size={15} />
                              Reserve Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="rr-time mb-0 mt-2">{formatTime(item.time)}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="d-flex justify-content-start rr-fade-in-up">
                <div className="rr-bubble rr-bubble-assistant px-3 py-2 d-flex align-items-center gap-2">
                  <Bot size={14} className="rr-gold-text" />
                  <span className="d-flex gap-1">
                    <span className="rr-dot" />
                    <span className="rr-dot" style={{ animationDelay: "0.15s" }} />
                    <span className="rr-dot" style={{ animationDelay: "0.3s" }} />
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts */}
          {showPrompts && !loading && (
            <div className="rr-prompts flex-shrink-0 px-3 px-sm-4 py-2 py-sm-3">
              <p className="rr-prompts-label mb-2">Quick Questions</p>
              <div className="d-flex gap-2 overflow-auto pb-1">
                {QUICK_PROMPTS.map((prompt) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={prompt.label}
                      onClick={() => sendMessage(prompt.text)}
                      className="btn rr-prompt-btn d-flex align-items-center gap-2 flex-shrink-0 rounded-pill fw-semibold"
                    >
                      <Icon size={13} />
                      {prompt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="rr-input-bar flex-shrink-0 px-3 px-sm-4 py-3"
          >
            <div className="rr-input-wrap d-flex align-items-center gap-2 rounded-4 p-1">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Ask about cars, prices, bookings..."
                className="form-control border-0 bg-transparent shadow-none rr-input"
              />
              <button
                type="submit"
                disabled={!message.trim() || loading}
                aria-label="Send message"
                className="btn rr-send-btn d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 border-0"
              >
                <Send size={17} />
              </button>
            </div>
            <p className="rr-note text-center mb-0 mt-2">
              Royal Route AI helps you find your perfect rental car.
            </p>
          </form>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --rr-gold: #d4af37;
          --rr-gold-bright: #e8c84a;
          --rr-black: #0a0a0a;
          --rr-panel: #111111;
          --rr-panel-alt: #0d0d0d;
          --rr-border: rgba(212,175,55,0.2);
          --rr-border-soft: rgba(255,255,255,0.08);
        }

        .rr-launcher {
          right: 1rem;
          bottom: 1.25rem;
          padding: 0.7rem 1rem;
          background: var(--rr-gold);
          color: #000;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.2px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.3);
          transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.2s ease;
          z-index: 1050;
        }
        .rr-launcher:hover { transform: translateY(-2px); background: var(--rr-gold-bright); box-shadow: 0 14px 36px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.4); }
        .rr-launcher:active { transform: translateY(0); }
        @media (min-width: 576px) { .rr-launcher { right: 1.5rem; bottom: 1.5rem; } }

        .rr-launcher-icon { width: 1.4rem; height: 1.4rem; }
        .rr-ping {
          background: rgba(0,0,0,0.25);
          animation: rr-ping 1.6s cubic-bezier(0,0,0.2,1) infinite;
        }
        @keyframes rr-ping {
          0% { transform: scale(1); opacity: 0.7; }
          75%, 100% { transform: scale(2.1); opacity: 0; }
        }

        .rr-backdrop {
          z-index: 1049;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(3px);
        }
        .rr-fade-in { animation: rr-fade-in 0.2s ease-out forwards; }
        .rr-fade-out { animation: rr-fade-out 0.2s ease-out forwards; }
        @keyframes rr-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rr-fade-out { from { opacity: 1; } to { opacity: 0; } }

        .rr-panel {
          z-index: 1050;
          left: 0; right: 0; bottom: 0;
          width: 100%;
          height: 100dvh;
          background: var(--rr-black);
          overflow: hidden;
          padding-bottom: env(safe-area-inset-bottom);
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
        }
        @media (min-width: 576px) {
          .rr-panel {
            left: auto;
            right: 1.5rem;
            bottom: 1.5rem;
            width: 400px;
            height: min(680px, calc(100dvh - 96px));
            border-radius: 1.25rem;
            border: 1px solid var(--rr-border);
            box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.08);
          }
        }
        @media (min-width: 768px) { .rr-panel { width: 420px; } }

        .rr-slide-in { animation: rr-slide-in 0.22s ease-out forwards; }
        .rr-slide-out { animation: rr-slide-out 0.2s ease-out forwards; }
        @keyframes rr-slide-in {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rr-slide-out {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(24px); }
        }

        .rr-header {
          background: #000;
          border-bottom: 1px solid var(--rr-border);
          padding-top: max(env(safe-area-inset-top), 1rem);
        }
        .rr-avatar {
          width: 2.4rem; height: 2.4rem;
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.35);
          color: var(--rr-gold);
        }
        .rr-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.02rem;
          font-weight: 600;
          color: #fff;
        }
        .rr-subtitle { font-size: 0.7rem; color: rgba(255,255,255,0.4); font-weight: 300; }
        .rr-status-dot { width: 0.4rem; height: 0.4rem; background: #4caf82; box-shadow: 0 0 6px rgba(76,175,130,0.6); }
        .rr-icon-btn { color: rgba(255,255,255,0.6); background: transparent; }
        .rr-icon-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .rr-icon-btn:active { transform: scale(0.95); }

        .rr-messages {
          background: var(--rr-black);
          scrollbar-width: thin;
        }

        .rr-fade-in-up { animation: rr-fade-in-up 0.25s ease-out forwards; }
        @keyframes rr-fade-in-up {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .rr-bubble { max-width: 90%; border-radius: 1rem; }
        @media (min-width: 576px) { .rr-bubble { max-width: 88%; } }
        .rr-bubble-user {
          background: var(--rr-gold);
          color: #000;
          border-bottom-right-radius: 0.3rem;
        }
        .rr-bubble-assistant {
          background: var(--rr-panel);
          color: rgba(255,255,255,0.85);
          border: 1px solid var(--rr-border-soft);
          border-bottom-left-radius: 0.3rem;
        }
        .rr-msg-text { font-size: 0.86rem; line-height: 1.55; font-weight: 300; }
        .rr-bubble-user .rr-msg-text { font-weight: 500; }
        .rr-label {
          font-size: 0.58rem; font-weight: 700; letter-spacing: 0.14em;
          color: var(--rr-gold);
        }
        .rr-time { font-size: 0.62rem; }
        .rr-bubble-user .rr-time { color: rgba(0,0,0,0.5); }
        .rr-bubble-assistant .rr-time { color: rgba(255,255,255,0.3); }
        .rr-gold-text { color: var(--rr-gold); }

        .rr-car-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .rr-img-wrap {
          position: relative;
          width: 100%;
          line-height: 0;
        }
        .rr-price-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          border-radius: 999px;
          padding: 0.25rem 0.6rem;
          max-width: calc(100% - 1rem);
          white-space: nowrap;
          background: rgba(0,0,0,0.75);
          border: 1px solid rgba(212,175,55,0.4);
          color: var(--rr-gold);
          font-size: 0.7rem;
          font-weight: 700;
          backdrop-filter: blur(4px);
        }
        .rr-car-card {
          background: var(--rr-panel-alt);
          border: 1px solid var(--rr-border-soft);
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .rr-car-card:hover { border-color: rgba(212,175,55,0.3); transform: translateY(-2px); }
        .rr-car-img { width: 100%; height: 8rem; object-fit: cover; display: block; background: #1a1a1a; }
        @media (min-width: 576px) { .rr-car-img { height: 9rem; } }
        .rr-car-name {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 500;
          color: #fff;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .rr-tag {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--rr-border-soft);
          color: rgba(255,255,255,0.6);
          border-radius: 6px;
          padding: 0.25rem 0.6rem;
          font-size: 0.66rem;
          font-weight: 500;
        }
        .rr-car-loc { font-size: 0.72rem; color: rgba(255,255,255,0.4); }
        .rr-car-loc svg { color: var(--rr-gold); }

        .rr-cta {
          background: var(--rr-gold);
          color: #000;
          padding: 0.6rem 1rem;
          font-size: 0.82rem;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .rr-cta:hover { background: var(--rr-gold-bright); color: #000; }
        .rr-cta:active { transform: scale(0.98); }

        .rr-dot { width: 0.4rem; height: 0.4rem; border-radius: 50%; background: var(--rr-gold); animation: rr-bounce 1s infinite; display: inline-block; }
        @keyframes rr-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }

        .rr-prompts { background: #000; border-top: 1px solid var(--rr-border-soft); }
        .rr-prompts-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--rr-gold); }
        .rr-prompt-btn {
          background: var(--rr-panel-alt);
          border: 1px solid var(--rr-border-soft);
          color: rgba(255,255,255,0.65);
          font-size: 0.72rem;
          padding: 0.42rem 0.8rem;
          transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
        }
        .rr-prompt-btn:hover { background: rgba(212,175,55,0.1); border-color: rgba(212,175,55,0.3); color: var(--rr-gold); }
        .rr-prompt-btn:active { transform: scale(0.96); }

        .rr-input-bar { background: #000; border-top: 1px solid var(--rr-border-soft); padding-bottom: max(env(safe-area-inset-bottom), 0.75rem); }
        .rr-input-wrap { background: var(--rr-panel-alt); border: 1px solid var(--rr-border-soft); transition: border-color 0.15s ease, box-shadow 0.15s ease; }
        .rr-input-wrap:focus-within { border-color: rgba(212,175,55,0.5); box-shadow: 0 0 0 3px rgba(212,175,55,0.12); }
        .rr-input { font-size: 0.85rem; font-weight: 400; color: #fff; padding: 0.5rem 0.75rem; }
        .rr-input::placeholder { color: rgba(255,255,255,0.3); }
        .rr-input:focus { box-shadow: none; }
        .rr-note { font-size: 0.62rem; color: rgba(255,255,255,0.25); }

        .rr-send-btn {
          width: 2.4rem; height: 2.4rem;
          background: var(--rr-gold);
          color: #000;
          transition: transform 0.15s ease, background 0.2s ease;
        }
        .rr-send-btn:hover:not(:disabled) { transform: scale(1.06); background: var(--rr-gold-bright); }
        .rr-send-btn:disabled { background: rgba(212,175,55,0.2); color: rgba(255,255,255,0.25); cursor: not-allowed; }

        @media (prefers-reduced-motion: reduce) {
          .rr-ping, .rr-dot, .rr-fade-in-up, .rr-slide-in, .rr-slide-out, .rr-fade-in, .rr-fade-out {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}