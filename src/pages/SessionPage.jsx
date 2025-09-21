import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getQuestionsByJoinCode } from "../utils/supabase/supabase";

function JoinCodeBanner( {joinCode} ) {
    const [visible, setVisible] = useState(true);

    if(!visible) return null;

    return (
        <div className = "fixed top-0 left-0 w-screen bg-blue-500 text-3xl font-bold flex items-center justify-between px-6 py-4 z-50">
            <span> Join code: {joinCode} </span>
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
  const [sessionId, setSessionId] = useState(null)
  const { join_code } = useParams()

  // Much lighter background with a whisper of contrast
  const bgClass = "bg-white";

  // load messages
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
        }
      };
  
      loadMessages();
  
      const refreshInterval = setInterval(loadMessages, 5000);
      
      return () => clearInterval(refreshInterval);
    }, [join_code]);

  return (
    <main className={`min-h-screen ${bgClass}`}>
      {/* Messages intentionally have NO extra bottom padding so they scroll under the fixed bar */}
      <JoinCodeBanner joinCode={join_code}/>
      <Messages items={messages} />
    </main>
  );
}
