const { Redis } = require("@upstash/redis");
const { sendError } = require("../utils/response");

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const rateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 10,
    message = "Too many requests, please try again later",
  } = options;

  const windowSeconds = Math.floor(windowMs / 1000);

  return async (req, res, next) => {
    try {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress ||
        "unknown";
      const key = `rate_limit:${req.path}:${ip}`;

      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (count > max) {
        const ttl = await redis.ttl(key);
        res.setHeader("Retry-After", ttl);
        return sendError(res, message, 429);
      }

      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, max - count));

      next();
    } catch (err) {
      console.error("RATE LIMITER ERROR:", err.message);
      next();
    }
  };
};

const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again in 15 minutes.",
});

const registerLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message:
    "Too many accounts created from this IP. Please try again in 1 hour.",
});

const generalLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP.",
});

module.exports = { rateLimiter, loginLimiter, registerLimiter, generalLimiter };
