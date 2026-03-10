const TONE_CLASSES = {
  error: "border-rose-900/70 bg-rose-950/60 text-rose-200",
  info: "border-blue-900/60 bg-blue-950/50 text-blue-200",
  success: "border-emerald-900/70 bg-emerald-950/60 text-emerald-200"
};

export default function InlineAlert({ children, tone = "error" }) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${TONE_CLASSES[tone] || TONE_CLASSES.error}`} role="alert">
      {children}
    </div>
  );
}
