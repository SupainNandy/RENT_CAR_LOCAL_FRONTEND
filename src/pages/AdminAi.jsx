import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Bot,
  User,
  ArrowLeft,
  Sparkles,
  Loader2,
  MessageSquare,
  BarChart3,
  Car,
  IndianRupee,
  Trash2,
} from "lucide-react";

const API = import.meta.env.VITE_BACKEND_URI || "http://localhost:8000";

const AdminAI = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "Welcome, Admin.\n\nI'm your Royal Route AI Assistant powered by Ollama. I can analyze your bookings, revenue, fleet status, and business performance in real-time.\n\nTry asking me about today's bookings, revenue insights, fleet utilization, or a full business overview.",
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const askAI = async () => {
    if (!question.trim() || loading) return;

    const currentQuestion = question;
    setMessages((prev) => [...prev, { type: "user", text: currentQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/agent/`, {
        question: currentQuestion,
      });

      setMessages((prev) => [
        ...prev,
        { type: "ai", text: res.data.answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "Unable to connect with the AI Assistant. Please ensure Ollama is running and try again.",
        },
      ]);
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const clearChat = () => {
    setMessages([
      {
        type: "ai",
        text: "Chat cleared. How can I help you?",
      },
    ]);
  };

  const suggestedQueries = [
    { icon: <BarChart3 size={13} />, label: "Business Overview", query: "Give me a full business overview" },
    { icon: <IndianRupee size={13} />, label: "Today's Revenue", query: "What is today's revenue?" },
    { icon: <MessageSquare size={13} />, label: "Pending Bookings", query: "How many bookings are pending?" },
    { icon: <Car size={13} />, label: "Fleet Status", query: "What is the fleet utilization?" },
  ];

  const handleSuggestion = (query) => {
    setQuestion(query);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Format AI text with simple line-break support
  const formatMessage = (text) => {
    return text.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .aai-page {
          min-height: 100vh;
          background: #050505;
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ─── Header ─── */
        .aai-header {
          background: #000;
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          padding: 0 28px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .aai-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .aai-back-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          border-radius: 10px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .aai-back-btn:hover {
          background: rgba(212,175,55,0.12);
          border-color: rgba(212,175,55,0.3);
          color: #d4af37;
        }

        .aai-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .aai-brand-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #d4af37, #b8860b);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
        }
        .aai-brand-text h1 {
          font-family: 'Cinzel', serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #fff;
          margin: 0;
          line-height: 1.2;
        }
        .aai-brand-text span {
          font-size: 11px;
          color: rgba(212,175,55,0.7);
          letter-spacing: 0.5px;
          font-weight: 500;
        }

        .aai-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .aai-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }
        .aai-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4caf50;
          box-shadow: 0 0 8px rgba(76,175,80,0.5);
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .aai-clear-btn {
          background: rgba(234,67,53,0.08);
          border: 1px solid rgba(234,67,53,0.2);
          color: rgba(234,67,53,0.7);
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }
        .aai-clear-btn:hover {
          background: rgba(234,67,53,0.15);
          border-color: rgba(234,67,53,0.35);
          color: #ea4335;
        }

        /* ─── Chat Container ─── */
        .aai-chat-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 900px;
          width: 100%;
          margin: 0 auto;
          padding: 0 20px;
        }

        .aai-messages {
          flex: 1;
          overflow-y: auto;
          padding: 28px 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .aai-messages::-webkit-scrollbar { width: 4px; }
        .aai-messages::-webkit-scrollbar-track { background: transparent; }
        .aai-messages::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 2px; }

        /* ─── Message Bubbles ─── */
        .aai-msg {
          display: flex;
          gap: 12px;
          max-width: 85%;
          animation: msg-in 0.35s ease;
        }

        @keyframes msg-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .aai-msg.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .aai-msg-avatar {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .aai-msg.ai .aai-msg-avatar {
          background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05));
          border: 1px solid rgba(212,175,55,0.2);
          color: #d4af37;
        }

        .aai-msg.user .aai-msg-avatar {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
        }

        .aai-msg-bubble {
          padding: 16px 20px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.7;
          letter-spacing: 0.2px;
        }

        .aai-msg.ai .aai-msg-bubble {
          background: #0d0d0d;
          border: 1px solid rgba(212,175,55,0.1);
          color: rgba(255,255,255,0.85);
        }

        .aai-msg.user .aai-msg-bubble {
          background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
          color: #000;
          font-weight: 600;
          border: none;
        }

        /* ─── Typing Indicator ─── */
        .aai-typing {
          display: flex;
          gap: 12px;
          max-width: 85%;
          animation: msg-in 0.35s ease;
        }
        .aai-typing-dots {
          display: flex;
          gap: 5px;
          padding: 18px 22px;
          background: #0d0d0d;
          border: 1px solid rgba(212,175,55,0.1);
          border-radius: 16px;
          align-items: center;
        }
        .aai-typing-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d4af37;
          animation: typing-bounce 1.2s infinite;
        }
        .aai-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .aai-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        /* ─── Suggestions ─── */
        .aai-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px 0;
        }
        .aai-suggestion-chip {
          background: rgba(212,175,55,0.06);
          border: 1px solid rgba(212,175,55,0.15);
          color: rgba(255,255,255,0.65);
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
          font-family: 'Outfit', sans-serif;
        }
        .aai-suggestion-chip:hover {
          background: rgba(212,175,55,0.12);
          border-color: rgba(212,175,55,0.3);
          color: #d4af37;
        }

        /* ─── Input Area ─── */
        .aai-input-area {
          padding: 20px 0 28px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .aai-input-wrap {
          display: flex;
          gap: 10px;
          background: #0a0a0a;
          border: 1px solid rgba(212,175,55,0.15);
          border-radius: 14px;
          padding: 6px 6px 6px 20px;
          align-items: center;
          transition: border-color 0.3s ease;
        }
        .aai-input-wrap:focus-within {
          border-color: rgba(212,175,55,0.4);
          box-shadow: 0 0 20px rgba(212,175,55,0.08);
        }

        .aai-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          padding: 12px 0;
          letter-spacing: 0.2px;
        }
        .aai-input::placeholder {
          color: rgba(255,255,255,0.25);
        }

        .aai-send-btn {
          background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
          border: none;
          border-radius: 10px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #000;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .aai-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 20px rgba(212,175,55,0.35);
        }
        .aai-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .aai-footer-hint {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          margin-top: 10px;
          letter-spacing: 0.5px;
        }

        /* ─── Responsive ─── */
        @media (max-width: 768px) {
          .aai-header { padding: 0 16px; height: 60px; }
          .aai-brand-text h1 { font-size: 14px; }
          .aai-status { display: none; }
          .aai-chat-wrap { padding: 0 12px; }
          .aai-msg { max-width: 92%; }
          .aai-suggestion-chip { font-size: 11px; padding: 6px 12px; }
        }
      `}</style>

      <div className="aai-page">
        {/* ─── Header ─── */}
        <div className="aai-header">
          <div className="aai-header-left">
            <button
              className="aai-back-btn"
              onClick={() => navigate("/admin/admin-dashboard")}
            >
              <ArrowLeft size={18} />
            </button>
            <div className="aai-brand">
              <div className="aai-brand-icon">
                <Sparkles size={18} />
              </div>
              <div className="aai-brand-text">
                <h1>Royal Route AI</h1>
                <span>Admin Intelligence</span>
              </div>
            </div>
          </div>

          <div className="aai-header-right">
            <div className="aai-status">
              <span className="aai-status-dot" />
              Ollama Active
            </div>
            <button className="aai-clear-btn" onClick={clearChat}>
              <Trash2 size={13} />
              Clear
            </button>
          </div>
        </div>

        {/* ─── Chat Area ─── */}
        <div className="aai-chat-wrap">
          <div className="aai-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`aai-msg ${msg.type}`}
              >
                <div className="aai-msg-avatar">
                  {msg.type === "ai" ? (
                    <Bot size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div className="aai-msg-bubble">
                  {formatMessage(msg.text)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="aai-typing">
                <div className="aai-msg-avatar" style={{
                  background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))",
                  border: "1px solid rgba(212,175,55,0.2)",
                  color: "#d4af37",
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Bot size={16} />
                </div>
                <div className="aai-typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ─── Suggestion Chips ─── */}
          {messages.length <= 2 && (
            <div className="aai-suggestions">
              {suggestedQueries.map((s, i) => (
                <button
                  key={i}
                  className="aai-suggestion-chip"
                  onClick={() => handleSuggestion(s.query)}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          )}

          {/* ─── Input ─── */}
          <div className="aai-input-area">
            <div className="aai-input-wrap">
              <input
                ref={inputRef}
                className="aai-input"
                type="text"
                placeholder="Ask about bookings, revenue, fleet, customers..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") askAI();
                }}
              />
              <button
                className="aai-send-btn"
                onClick={askAI}
                disabled={loading || !question.trim()}
              >
                {loading ? (
                  <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <p className="aai-footer-hint">
              Powered by Ollama &middot; Press Enter to send
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default AdminAI;