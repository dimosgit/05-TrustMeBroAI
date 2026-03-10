import { parseCookies } from "../utils/cookies.js";

export function createSessionParser({ authService, cookieName }) {
  return async (req, _res, next) => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const token = cookies[cookieName];

      req.sessionToken = token || null;
      req.user = null;
      req.authSession = null;

      if (!token) {
        return next();
      }

      const authContext = await authService.authenticateSessionToken(token);
      if (!authContext) {
        return next();
      }

      req.user = authContext.user;
      req.authSession = authContext.session;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return next();
}
