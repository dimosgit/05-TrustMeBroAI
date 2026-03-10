export function trackEvent(eventName, payload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const detail = {
    eventName,
    payload,
    timestamp: new Date().toISOString()
  };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...payload
    });
  }

  window.dispatchEvent(new CustomEvent("tmb:tracking", { detail }));
}
