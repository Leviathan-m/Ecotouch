import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

// General API rate limiter
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later.',
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Stricter rate limiter for mission start endpoints
export const missionStartLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each user to 5 mission starts per minute
  message: {
    success: false,
    error: 'Too many mission start attempts, please wait before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID for rate limiting if available
    return req.user?.id || req.ip;
  },
});

// Rate limiter for webhook endpoints
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // Allow more requests for webhooks
  message: {
    success: false,
    error: 'Webhook rate limit exceeded.',
  },
  skip: (req) => {
    // Only skip for legitimate webhook sources (you might want to add IP whitelist here)
    return false;
  },
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit file uploads
  message: {
    success: false,
    error: 'Too many file uploads, please try again later.',
  },
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
});

// Blockchain interaction rate limiter (stricter)
export const blockchainLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit blockchain operations
  message: {
    success: false,
    error: 'Too many blockchain operations, please try again later.',
  },
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
});
