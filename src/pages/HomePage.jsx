import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSession } from "../utils/supabase/supabase";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartSession = async () => {
    setLoading(true);
    
    try {
      const result = await createSession();
      
      if (result.success) {
        // Navigate to the session page with the join code
        navigate(`/session/${result.session.join_code}`);
      } else {
        alert('Failed to create session: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center px-4 bg-zinc-50">
      <div className="w-full max-w-sm sm:max-w-md text-center">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900">
          Welcome
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Start Session (light) */}
          <button
            onClick={handleStartSession}
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Start Session'}
          </button>

          {/* Join Session (matte dark grey) */}
          <a
            href="/join"
            className="inline-flex h-12 w-full items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-800/90 focus:outline-none focus:ring-4 focus:ring-zinc-300/30"
          >
            Join Session
          </a>
        </div>
      </div>
    </main>
  );
}