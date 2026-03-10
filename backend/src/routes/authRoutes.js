import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { clearCookie, serializeCookie } from "../utils/cookies.js";
import {
  assertValidEmail,
  assertValidPassword,
  normalizeEmail,
  parseOptionalString
} from "../utils/validators.js";

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
  meRateLimiter
}) {
  const router = Router();

  router.post(
    "/register",
    authRateLimiter,
    asyncHandler(async (req, res) => {
      const email = normalizeEmail(req.body?.email);
      const password = req.body?.password;
      const emailConsent = req.body?.email_consent;
      const signupSource = parseOptionalString(req.body?.signup_source);

      assertValidEmail(email);
      assertValidPassword(password);

      const result = await authService.register({
        email,
        password,
        emailConsent,
        signupSource,
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

      return res.status(201).json({ user: result.user });
    })
  );

  router.post(
    "/login",
    authRateLimiter,
    asyncHandler(async (req, res) => {
      const email = normalizeEmail(req.body?.email);
      const password = req.body?.password;

      assertValidEmail(email);
      assertValidPassword(password);

      const result = await authService.login({
        email,
        password,
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

      return res.status(200).json({ user: result.user });
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
