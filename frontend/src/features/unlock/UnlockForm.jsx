import { useState } from "react";
import InlineAlert from "../../components/ui/InlineAlert";
import { CONSENT_COPY } from "../wizard/constants";

export default function UnlockForm({ onUnlock, loading }) {
  const [email, setEmail] = useState("");
  const [emailConsent, setEmailConsent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim().includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    if (!emailConsent) {
      setError("Consent is required to unlock your recommendation.");
      return;
    }

    try {
      await onUnlock({ email: email.trim(), emailConsent });
    } catch (unlockError) {
      setError(unlockError.message || "Could not unlock recommendation.");
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <label className="block text-left text-sm font-medium text-slate-300">
        Email to unlock
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/30"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>

      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={emailConsent}
          onChange={(event) => setEmailConsent(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/30 bg-transparent text-blue-500 focus:ring-blue-500"
        />
        <span>{CONSENT_COPY}</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Unlocking..." : "Unlock my best match"}
      </button>
    </form>
  );
}
