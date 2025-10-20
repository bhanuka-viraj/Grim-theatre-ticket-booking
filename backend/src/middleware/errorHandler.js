import { AppError } from "../utils/errors.js";

/**
 * Global error handler middleware
 * Handles all errors and sends appropriate responses
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    // Development: Send detailed error info
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production: Send user-friendly error
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // Programming or unknown errors: don't leak details
      console.error("💥 ERROR:", err);
      res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      });
    }
  }
};

/**
 * Handle 404 - Route not found
 */
export const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
