const DEFAULT_MAGIC_LINK_URL = "http://localhost:5174/auth/verify";
const RESEND_API_URL = "https://api.resend.com/emails";

function buildMagicLinkUrl(baseUrl, token) {
  const url = new URL(baseUrl || DEFAULT_MAGIC_LINK_URL);
  url.searchParams.set("token", token);
  return url.toString();
}

function buildMagicLinkCopy({ flow, magicLinkUrl, expiresAt }) {
  const expiresIso = expiresAt.toISOString();
  const intro =
    flow === "register"
      ? "Finish setting up your TrustMeBroAI account."
      : "Use this link to sign in to TrustMeBroAI.";

  return {
    subject: flow === "register" ? "Complete your TrustMeBroAI registration" : "Your TrustMeBroAI sign-in link",
    text: `${intro}\n\n${magicLinkUrl}\n\nThis link expires at ${expiresIso}.`,
    html: `<p>${intro}</p><p><a href="${magicLinkUrl}">Open secure sign-in link</a></p><p>This link expires at ${expiresIso}.</p>`
  };
}

export function createConsoleMagicLinkProvider({ baseUrl, logger = console, isProduction = false } = {}) {
  if (isProduction) {
    throw new Error(
      "Production auth rollout requires a real magic-link provider. Console delivery is disabled in production."
    );
  }

  return {
    async sendMagicLink({ email, token, expiresAt, flow }) {
      const magicLinkUrl = buildMagicLinkUrl(baseUrl, token);
      logger.log(
        `[auth] Magic link (${flow}) for ${email}: ${magicLinkUrl} (expires ${expiresAt.toISOString()})`
      );
    }
  };
}

export function createResendMagicLinkProvider({
  resendApiKey,
  fromEmail,
  fromName,
  baseUrl,
  fetchImpl = fetch
} = {}) {
  if (!resendApiKey) {
    throw new Error("AUTH_MAGIC_LINK_RESEND_API_KEY is required when AUTH_MAGIC_LINK_PROVIDER=resend");
  }

  if (!fromEmail) {
    throw new Error("AUTH_MAGIC_LINK_FROM_EMAIL is required when AUTH_MAGIC_LINK_PROVIDER=resend");
  }

  if (typeof fetchImpl !== "function") {
    throw new Error("fetch implementation is required for resend magic-link delivery");
  }

  const sender = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

  return {
    async sendMagicLink({ email, token, expiresAt, flow }) {
      const magicLinkUrl = buildMagicLinkUrl(baseUrl, token);
      const content = buildMagicLinkCopy({
        flow,
        magicLinkUrl,
        expiresAt
      });

      const response = await fetchImpl(RESEND_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: sender,
          to: [email],
          subject: content.subject,
          text: content.text,
          html: content.html
        })
      });

      if (!response.ok) {
        const details = await response.text().catch(() => "");
        const suffix = details ? `: ${details}` : "";
        throw new Error(`Magic-link delivery failed via Resend (${response.status})${suffix}`);
      }
    }
  };
}

export function createMagicLinkProvider({
  mode,
  isProduction,
  baseUrl,
  resendApiKey,
  fromEmail,
  fromName,
  logger,
  fetchImpl
} = {}) {
  const providerMode = String(mode || "console").trim().toLowerCase();

  if (providerMode === "console") {
    return createConsoleMagicLinkProvider({
      baseUrl,
      logger,
      isProduction
    });
  }

  if (providerMode === "resend") {
    return createResendMagicLinkProvider({
      resendApiKey,
      fromEmail,
      fromName,
      baseUrl,
      fetchImpl
    });
  }

  throw new Error(`Unsupported AUTH_MAGIC_LINK_PROVIDER: ${providerMode}`);
}
