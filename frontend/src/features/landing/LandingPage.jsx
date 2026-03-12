import { useNavigate } from "react-router-dom";
import { t } from "../../lib/i18n";

const LANDING_LOGOS = [
  { name: "ChatGPT",    src: "https://www.google.com/s2/favicons?domain=chat.openai.com&sz=64" },
  { name: "Claude",     src: "https://www.google.com/s2/favicons?domain=claude.ai&sz=64" },
  { name: "Copilot",    src: "https://www.google.com/s2/favicons?domain=copilot.microsoft.com&sz=64" },
  { name: "Perplexity", src: "https://www.google.com/s2/favicons?domain=perplexity.ai&sz=64" },
  { name: "Cursor",     src: "https://www.google.com/s2/favicons?domain=cursor.com&sz=64" }
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center py-10 text-center">

      {/* PRIMARY: Headline — the hero */}
      <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
        {t("landing.headingLineOne")}
        <br />
        {t("landing.headingLineTwo")}
      </h1>

      {/* SECONDARY: Subtitle — clearly subordinate */}
      <p className="mx-auto mt-5 max-w-xs text-sm text-slate-500">
        {t("landing.subtitle")}
      </p>

      {/* ACTION: CTA — the one thing to do */}
      <div className="mt-10 w-full max-w-xs">
        <button
          type="button"
          onClick={() => navigate("/wizard")}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-base font-bold text-white shadow-lg transition-all hover:from-blue-500 hover:to-blue-400 active:scale-[0.98]"
        >
          {t("landing.cta")}
        </button>
        <p className="mt-2 text-[11px] text-slate-600">{t("landing.noLoginRequired")}</p>
      </div>

      {/* FOOTNOTE: Logos — small, quiet, supportive */}
      <div className="mt-14 flex flex-wrap items-center justify-center gap-5">
        {LANDING_LOGOS.map((logo) => (
          <div key={logo.name} className="flex flex-col items-center gap-1.5 opacity-50 transition-opacity hover:opacity-80">
            <img
              src={logo.src}
              alt={logo.name}
              className="h-8 w-8 rounded-lg"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <span className="text-[10px] text-slate-500">{logo.name}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
