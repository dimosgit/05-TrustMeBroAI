import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { clearCookie, serializeCookie } from "../utils/cookies.js";
import { assertPositiveInteger, assertValidEmail, normalizeEmail, parseOptionalString } from "../utils/validators.js";

function setSessionCookie({ res, cookieName, token, maxAgeMs, isProduction }) {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(cookieName, token, {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAgeMs
    })
  );
}

function clearSessionCookie({ res, cookieName, isProduction }) {
  res.setHeader(
    "Set-Cookie",
    clearCookie(cookieName, {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax"
    })
  );
}

export function createAuthRouter({
  authService,
  cookieName,
  sessionTtlMs,
  isProduction,
  requireAuth,
  authRateLimiter,
  meRateLimiter,
  metricsService
}) {
  const router = Router();

  router.post(
    "/passkey/register/options",
    authRateLimiter,
    asyncHandler(async (req, res) => {
      const email = normalizeEmail(req.body?.email);
      const emailConsent = req.body?.email_consent;
      const signupSource = parseOptionalString(req.body?.signup_source);

      assertValidEmail(email);

      const result = await authService.requestPasskeyRegistrationOptions({
        email,
        emailConsent,
        signupSource,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.socket?.remoteAddress || null
      });

      return res.status(200).json(result);
    })
  );

  router.post(
    "/passkey/register/verify",
    authRateLimiter,
    asyncHandler(async (req, res) => {
      const challengeId = assertPositiveInteger(req.body?.challenge_id, "challenge_id");
      const credential = req.body?.credential;

      const result = await authService.verifyPasskeyRegistration({
        challengeId,
        credential,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.socket?.remoteAddress || null
      });

      setSessionCookie({
        res,
        cookieName,
        token: result.session.token,
        maxAgeMs: sessionTtlMs,
        isProduction
      });

      await metricsService?.captureFunnelEvent({
        eventName: "account_created",
        userId: result.user.id,
        eventMetadata: {
          method: "passkey_register"
        }
      });

      return res.status(200).json({ user: result.user });
    })
  );

  router.post(
    "/passkey/login/options",
    authRateLimiter,
    asyncHandler(async (req, res) => {
      const email = normalizeEmail(req.body?.email);
      assertValidEmail(email);

      const result = await authService.requestPasskeyAuthenticationOptions({
        email,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.socket?.remoteAddress || null
      });

      return res.status(200).json(result);
    })
  );

  router.post(
    "/passkey/login/verify",
    authRateLimiter,
    asyncHandler(async (req, res) => {
      const challengeId = assertPositiveInteger(req.body?.challenge_id, "challenge_id");
      const credential = req.body?.credential;

      const result = await authService.verifyPasskeyAuthentication({
        challengeId,
        credential,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.socket?.remoteAddress || null
      });

      setSessionCookie({
        res,
        cookieName,
        token: result.session.token,
        maxAgeMs: sessionTtlMs,
        isProduction
      });

      await metricsService?.captureFunnelEvent({
        eventName: "sign_in_completed",
        userId: result.user.id,
        eventMetadata: {
          method: "passkey_login"
        }
      });

      return res.status(200).json({ user: result.user });
    })
  );

  router.post(
    "/recovery/request",
    authRateLimiter,
    asyncHandler(async (req, res) => {
      const email = normalizeEmail(req.body?.email);
      const redirectPath = req.body?.redirect_path;

      assertValidEmail(email);

      const result = await authService.requestRecovery({
        email,
        redirectPath,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.socket?.remoteAddress || null
      });

      return res.status(202).json(result);
    })
  );

  router.post(
    "/recovery/verify",
    authRateLimiter,
    asyncHandler(async (req, res) => {
      const result = await authService.verifyRecovery({
        token: req.body?.token,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.socket?.remoteAddress || null
      });

      setSessionCookie({
        res,
        cookieName,
        token: result.session.token,
        maxAgeMs: sessionTtlMs,
        isProduction
      });

      await metricsService?.captureFunnelEvent({
        eventName: "sign_in_completed",
        userId: result.user.id,
        eventMetadata: {
          method: "recovery_fallback"
        }
      });

      return res.status(200).json({
        user: result.user,
        requires_passkey_enrollment: result.requires_passkey_enrollment
      });
    })
  );

  router.post(
    "/logout",
    authRateLimiter,
    asyncHandler(async (req, res) => {
      if (req.authSession?.id) {
        await authService.logoutBySessionId(req.authSession.id);
      } else if (req.sessionToken) {
        await authService.logoutByToken(req.sessionToken);
      }

      clearSessionCookie({
        res,
        cookieName,
        isProduction
      });

      return res.status(204).send();
    })
  );

  router.get(
    "/me",
    meRateLimiter,
    requireAuth,
    asyncHandler(async (req, res) => {
      return res.json({ user: req.user });
    })
  );

  return router;
}
