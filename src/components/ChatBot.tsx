"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type LLMProvider = "openai" | "claude" | "llama";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

// ─── LLM Config ───────────────────────────────────────────────────────────────

const LLM_OPTIONS: { value: LLMProvider; label: string; icon: string; color: string }[] = [
  { value: "openai", label: "OpenAI GPT-4o", icon: "⚡", color: "#10a37f" },
  { value: "claude", label: "Claude 3.5", icon: "🌟", color: "#d97706" },
  { value: "llama", label: "Llama 3 (Groq)", icon: "🦙", color: "#7c3aed" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function BotIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="11" />
      <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" />
      <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "10px 14px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--cf-brand)",
            display: "inline-block",
            animation: `chatbot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 10,
      }}
    >
      {!isUser && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--cf-brand)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginRight: 8,
            marginTop: 2,
          }}
        >
          <BotIcon size={14} />
        </div>
      )}
      <div
        style={{
          maxWidth: "82%",
          padding: "9px 13px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser ? "var(--cf-brand)" : "var(--cf-card)",
          color: isUser ? "#fff" : "var(--cf-text)",
          border: isUser ? "none" : "1px solid var(--cf-border)",
          fontSize: 13.5,
          lineHeight: 1.55,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          ...(msg.error ? { background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" } : {}),
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ─── Main ChatBot Component ───────────────────────────────────────────────────

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm the CodeForge assistant. Ask me anything about the platform, coding problems, or tips. I search our knowledge base to give you accurate answers! 🚀",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState<LLMProvider>("openai");
  const [showLLMMenu, setShowLLMMenu] = useState(false);
  const [resourceCount, setResourceCount] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const llmMenuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Fetch resource count on mount
  useEffect(() => {
    fetch("/api/chatbot")
      .then((r) => r.json())
      .then((d) => setResourceCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  // Close LLM menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (llmMenuRef.current && !llmMenuRef.current.contains(e.target as Node)) {
        setShowLLMMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, llm: selectedLLM, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: data.answer },
      ]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${errMsg}`,
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, selectedLLM]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat cleared! How can I help you?",
      },
    ]);
  };

  const currentLLM = LLM_OPTIONS.find((l) => l.value === selectedLLM)!;

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes chatbot-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes chatbot-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatbot-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(91, 76, 219, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(91, 76, 219, 0); }
        }
      `}</style>

      {/* ── Floating Toggle Button ── */}
      <button
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        aria-label="Open AI Assistant"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9998,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--cf-brand)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: isOpen && !isMinimized ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(91,76,219,0.45)",
          animation: "chatbot-pulse 2.5s ease-in-out infinite",
          transition: "transform 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <BotIcon size={24} />
        {/* Unread dot */}
        <span
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#22c55e",
            border: "2px solid white",
          }}
        />
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            zIndex: 9999,
            width: 370,
            maxWidth: "calc(100vw - 32px)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)",
            border: "1px solid var(--cf-border)",
            background: "var(--cf-bg)",
            display: "flex",
            flexDirection: "column",
            animation: "chatbot-slide-up 0.22s ease-out",
            ...(isMinimized ? { height: "auto" } : { height: 520, maxHeight: "calc(100vh - 120px)" }),
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              background: "var(--cf-brand)",
              color: "#fff",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
              cursor: "pointer",
            }}
            onClick={() => setIsMinimized((m) => !m)}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BotIcon size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.2 }}>
                CodeForge Assistant
              </div>
              <div style={{ fontSize: 11, opacity: 0.85, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                {resourceCount} resource{resourceCount !== 1 ? "s" : ""} loaded · {currentLLM.icon} {currentLLM.label}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={clearChat}
                title="Clear chat"
                style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 7px", cursor: "pointer", fontSize: 12 }}
              >
                Clear
              </button>
              <button
                onClick={() => setIsMinimized((m) => !m)}
                title="Minimize"
                style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 7px", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <MinimizeIcon />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 6, padding: "4px 7px", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* ── Messages ── */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "14px 12px 6px",
                  display: "flex",
                  flexDirection: "column",
                  scrollbarWidth: "thin",
                }}
              >
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {isLoading && (
                  <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "var(--cf-brand)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginRight: 8,
                      }}
                    >
                      <BotIcon size={14} />
                    </div>
                    <div
                      style={{
                        background: "var(--cf-card)",
                        border: "1px solid var(--cf-border)",
                        borderRadius: "16px 16px 16px 4px",
                      }}
                    >
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ── LLM Selector + Input ── */}
              <div
                style={{
                  padding: "10px 12px 12px",
                  borderTop: "1px solid var(--cf-border)",
                  background: "var(--cf-card)",
                  flexShrink: 0,
                }}
              >
                {/* LLM selector */}
                <div ref={llmMenuRef} style={{ position: "relative", marginBottom: 8 }}>
                  <button
                    onClick={() => setShowLLMMenu((s) => !s)}
                    style={{
                      background: "var(--cf-brand-muted)",
                      border: "1px solid var(--cf-border)",
                      borderRadius: 8,
                      padding: "5px 10px",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "var(--cf-text)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      width: "100%",
                    }}
                  >
                    <span>{currentLLM.icon}</span>
                    <span style={{ flex: 1, textAlign: "left" }}>{currentLLM.label}</span>
                    <span style={{ opacity: 0.5 }}>▾</span>
                  </button>

                  {showLLMMenu && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        background: "var(--cf-card)",
                        border: "1px solid var(--cf-border)",
                        borderRadius: 10,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                        overflow: "hidden",
                        zIndex: 10,
                        animation: "chatbot-slide-up 0.15s ease-out",
                      }}
                    >
                      {LLM_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSelectedLLM(opt.value); setShowLLMMenu(false); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "100%",
                            padding: "9px 12px",
                            background: selectedLLM === opt.value ? "var(--cf-brand-muted)" : "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--cf-text)",
                            fontSize: 13,
                            textAlign: "left",
                          }}
                        >
                          <span style={{ fontSize: 16 }}>{opt.icon}</span>
                          <span style={{ flex: 1 }}>{opt.label}</span>
                          {selectedLLM === opt.value && (
                            <span style={{ color: "var(--cf-brand)", fontWeight: 700 }}>✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input row */}
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question… (Enter to send)"
                    rows={1}
                    style={{
                      flex: 1,
                      resize: "none",
                      border: "1px solid var(--cf-border)",
                      borderRadius: 10,
                      padding: "9px 12px",
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      background: "var(--cf-input-bg, rgba(0,0,0,0.05))",
                      color: "var(--cf-text)",
                      outline: "none",
                      fontFamily: "inherit",
                      maxHeight: 100,
                      overflowY: "auto",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--cf-brand)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--cf-border)")}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = Math.min(el.scrollHeight, 100) + "px";
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: input.trim() && !isLoading ? "var(--cf-brand)" : "var(--cf-border)",
                      color: "#fff",
                      border: "none",
                      cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 0.15s, transform 0.1s",
                    }}
                    onMouseEnter={(e) => { if (input.trim() && !isLoading) e.currentTarget.style.transform = "scale(1.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    <SendIcon />
                  </button>
                </div>

                <div style={{ fontSize: 10.5, color: "var(--cf-muted)", textAlign: "center", marginTop: 6 }}>
                  Shift+Enter for new line · Answers from /resources files
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
