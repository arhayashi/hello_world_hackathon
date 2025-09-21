import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {getSessionByJoinCode} from "../utils/supabase/supabase"

/* ---------- Reusable square button (matches your login style) ---------- */
function SquareActionButton(props) {
  const { className = "", children, ...rest } = props;
  return (
    <button
      type="button"
      {...rest}
      className={[
        "h-12 w-12 inline-flex items-center justify-center rounded-md",
        "border border-zinc-700 bg-zinc-800 text-white shadow-none",
        "hover:bg-zinc-800/90 focus:outline-none focus:ring-4 focus:ring-zinc-300/30",
        className,
      ].join(" ")}
    >
      {/* Default right-arrow icon if none provided */}
      {children ?? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12h14M12 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

/* ---------- Five-digit code input (JS version) ---------- */
export function FiveDigitCode({ length = 5, onComplete, label = "Enter 5 Digit Code" }) {
  const [values, setValues] = useState(Array.from({ length }, () => ""));
  const inputs = useMemo(
    () => Array.from({ length }, () => React.createRef()),
    [length]
  );

  const setAt = (i, v) => {
    setValues(prev => {
      const next = [...prev];
      next[i] = v;
      if (onComplete && next.every(d => d.length > 0)) {
        onComplete(next.join(""));
      }
      return next;
    });
  };

  const handleChange = (i, e) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setAt(i, "");
      return;
    }
    // Support typing/pasting multiple digits
    const chars = digits.split("");
    setValues(prev => {
      const next = [...prev];
      let idx = i;
      for (const ch of chars) {
        if (idx >= length) break;
        next[idx] = ch;
        idx++;
      }
      const focusTo = Math.min(idx, length - 1);
      inputs[focusTo]?.current?.focus();
      if (onComplete && next.every(d => d.length > 0)) onComplete(next.join(""));
      return next;
    });
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (values[i]) {
        setAt(i, "");
        return;
      }
      if (i > 0) inputs[i - 1]?.current?.focus();
      setAt(Math.max(0, i - 1), "");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (i > 0) inputs[i - 1]?.current?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (i < length - 1) inputs[i + 1]?.current?.focus();
    }
  };

  const clearAll = () => {
    setValues(Array.from({ length }, () => ""));
    inputs[0]?.current?.focus();
  };

  const boxCls =
    "h-12 w-12 rounded-md border border-zinc-300 bg-white text-center text-xl " +
    "outline-none focus:ring-4 focus:ring-zinc-200 caret-zinc-500";

  return (
    <section className="w-full">
      <h2 className="mb-4 text-center text-lg font-medium text-zinc-900">{label}</h2>

      {/* Centered row: five squares + square button */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-3">
          {values.map((val, i) => (
            <input
              key={i}
              ref={inputs[i]}
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={boxCls}
              aria-label={`Digit ${i + 1} of ${length}`}
            />
          ))}
        </div>

        {/* Right-arrow button */}
        <SquareActionButton onClick={clearAll} aria-label="Clear code" title="Clear" />
      </div>
    </section>
  );
}

/* ---------- Centered page sample (drop-in) ---------- */
export default function JoinPage() {
  const navigate = useNavigate()
  const validateSessionByJoinCode = async (code) => {
    const res = await getSessionByJoinCode(code)
    if (res.success) {
      navigate(`/chat/${code}`)
    } else {
      console.log('Invalid session.')
      console.log(`Error: ${res.error}`)
    }
  }
  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <FiveDigitCode onComplete={validateSessionByJoinCode} />
      </div>
    </main>
  );
}
