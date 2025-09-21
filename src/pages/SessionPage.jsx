import React, { useEffect, useRef, useState } from "react";

function JoinCodeBanner() {
    const [visible, setVisible] = useState(true);

    if(!visible) return null;

    return (
        <div className = "fixed top-0 left-0 w-screen bg-blue-500 text-3xl font-bold flex items-center justify-between px-6 py-4 z-50">
            <span> Join code: 12345 </span>
            <button 
                onClick={() => setVisible(false)}
                className = "text-white text-2xl hover:text-gray-300 focus:outline-none"
            >
                &times;
            </button>
        </div>
    )
}

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


/* ---------------- Top-level Chat Page (lighter bg, fixed bar overlays messages) ---------------- */
export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

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
  useEffect(() => {
    // myBaaS.fetchMessages().then(list => setMessages(list));
    // const unsub = myBaaS.onMessage(msg => setMessages(prev => [...prev, msg]));
    // return () => unsub?.();
  }, []);

  const handleSend = (text) => {
    if (Date.now() < cooldownUntil) return; // rate limit (defense-in-depth)

    const newMsg = {
      id: crypto.randomUUID?.() || String(Date.now()),
      text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, newMsg]);

    // Start 10s cooldown
    setCooldownUntil(Date.now() + 10_000);

    // BaaS: persist the message (optimistic UI above)
    // myBaaS.sendMessage(newMsg).catch(() => {/* optional rollback */});
  };

  return (
    <main className={`min-h-screen ${bgClass}`}>
      {/* Messages intentionally have NO extra bottom padding so they scroll under the fixed bar */}
      <JoinCodeBanner/>
      <Messages items={messages} />
    </main>
  );
}
