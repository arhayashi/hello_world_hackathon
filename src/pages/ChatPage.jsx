import React, { useEffect, useRef, useState } from "react";
import supabase, { submitQuestion, getQuestionsByJoinCode, getSessionByJoinCode } from "../utils/supabase/supabase";
import { useParams } from "react-router-dom";

/* ---------------- Messages List (square-ish bubbles, subtle shadow, hard wrap) ---------------- */
function Messages({ items }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  return (
    <div className="mx-auto w-full max-w-md sm:max-w-lg px-4 pt-6 pb-0">
      <ul className="grid gap-2.5">
        {items.map((m) => (
          <li
            key={m.id}
            className={[
              // width bounded so it never bleeds off-screen
              "w-fit max-w-[85%]",
              // squarer corners, light border, plain white
              "rounded-md border border-zinc-200 bg-white",
              // subtle shadow
              "px-3 py-2 shadow-[0_1px_1px_rgba(0,0,0,0.04)]",
            ].join(" ")}
          >
            <p className="text-sm text-zinc-900 whitespace-pre-wrap break-words break-all">
              {m.text}
            </p>
          </li>
        ))}
      </ul>
      <div ref={endRef} />
    </div>
  );
}

/* ---------------- Input Bar (compact; gap; countdown inside button) ---------------- */
function ChatInputBar({ onSend, cooldownSec }) {
  const [msg, setMsg] = useState("");

  const canSend = msg.trim().length > 0 && cooldownSec <= 0;

  const send = () => {
    const text = msg.trim();
    if (!text || cooldownSec > 0) return;
    onSend?.(text);
    setMsg("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 sm:pb-6">
      <div className="mx-auto w-full max-w-md sm:max-w-lg">
        {/* Single row; space between input & button via gap-2 */}
        <div className="flex items-stretch gap-2">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message…"
            className="h-10 flex-1 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:ring-4 focus:ring-zinc-200"
          />
          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            aria-label={cooldownSec > 0 ? `Wait ${cooldownSec}s` : "Send message"}
            title={cooldownSec > 0 ? `Wait ${cooldownSec}s` : "Send"}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-800/90 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-zinc-300/30"
          >
            {/* Show countdown inside the button so layout height never changes */}
            {cooldownSec > 0 ? (
              <span className="text-[11px] font-medium">{cooldownSec}</span>
            ) : (
              // Up arrow
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 5l6 6M12 5L6 11M12 5v14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Top-level Chat Page (lighter bg, fixed bar overlays messages) ---------------- */
export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null)
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const { join_code } = useParams()

  // Much lighter background with a whisper of contrast
  const bgClass = "bg-white";

  // Tick a small clock so the countdown updates
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 300);
    return () => clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, cooldownUntil - now);
  const cooldownSec = Math.ceil(remainingMs / 1000);

  // BaaS: load history + subscribe here if needed
  // Fetch messages on page load
  useEffect(() => {
    const loadMessages = async () => {
      if (!join_code) {
        return;
      }

      try {
        // Get questions by join code (this should return {success, questions, sessionId})
        const result = await getQuestionsByJoinCode(join_code);
        
        if (result.success) {
          setMessages(result.questions || []);
          setSessionId(result.sessionId);
        }
      } catch (err) {
        console.error("Error loading messages:", err);
        setError("Failed to load messages");
      }
    };

    loadMessages();

    const refreshInterval = setInterval(loadMessages, 5000);
    
    return () => clearInterval(refreshInterval);
  }, [join_code]);


  const handleSend = async (text) => {
    if (Date.now() < cooldownUntil) return; // rate limit (defense-in-depth)

    const newMsg = {
      id: crypto.randomUUID?.() || String(Date.now()),
      text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, newMsg]);

    // Start 10s cooldown
    setCooldownUntil(Date.now() + 10_000);
    try {
        // Get session by join code
        const result = await getSessionByJoinCode(join_code);
        if (result.success) {
          setSessionId(result.session.id);
          await submitQuestion(result.session.id, text).catch(() => {/* optional rollback */});
        }
    } catch (error) {
      console.error("Failed to submit question", error)
    }
  };

  return (
    <main className={`min-h-screen ${bgClass}`}>
      {/* Messages intentionally have NO extra bottom padding so they scroll under the fixed bar */}
      <Messages items={messages} />

      {/* Fixed input bar overlays messages; no layout shift on cooldown */}
      <ChatInputBar onSend={handleSend} cooldownSec={cooldownSec} />
    </main>
  );
}
