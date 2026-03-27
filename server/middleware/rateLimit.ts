import rateLimit from "express-rate-limit";

// Global API rate limiter - protects against general DoS
// Limit each IP to 100 requests per 1 minute window
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per window
  message: { message: "Too many requests from this IP, please try again after a minute." },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict authentication rate limiter - protects against credential stuffing
// Limit each IP to 10 requests per 15 minute window
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: { message: "Too many authentication attempts, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
