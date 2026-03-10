import { AppError } from "../errors.js";

export function notFoundHandler(_req, res) {
  return res.status(404).json({ message: "Not found" });
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ message: "Malformed JSON payload" });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code
    });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
}
