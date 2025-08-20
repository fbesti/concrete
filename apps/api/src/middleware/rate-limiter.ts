import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// General rate limiter for all requests
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    console.warn(
      `Rate limit exceeded for IP: ${req.ip} on ${req.method} ${req.path}`
    );
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      timestamp: new Date().toISOString(),
    });
  },
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth attempts per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    error: 'Too many authentication attempts',
    message: 'Too many failed login attempts. Please try again later.',
    timestamp: new Date().toISOString(),
  },
  handler: (req: Request, res: Response) => {
    console.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts',
      message: 'Too many failed login attempts. Please try again later.',
      timestamp: new Date().toISOString(),
    });
  },
});

// API rate limiter for general API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 API requests per windowMs
  message: {
    success: false,
    error: 'API rate limit exceeded',
    message: 'Too many API requests. Please try again later.',
    timestamp: new Date().toISOString(),
  },
  handler: (req: Request, res: Response) => {
    console.warn(
      `API rate limit exceeded for IP: ${req.ip} on ${req.method} ${req.path}`
    );
    res.status(429).json({
      success: false,
      error: 'API rate limit exceeded',
      message: 'Too many API requests. Please try again later.',
      timestamp: new Date().toISOString(),
    });
  },
});

// Create account rate limiter (very strict)
export const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 account creations per hour
  message: {
    success: false,
    error: 'Account creation limit exceeded',
    message: 'Too many accounts created from this IP. Please try again later.',
    timestamp: new Date().toISOString(),
  },
  handler: (req: Request, res: Response) => {
    console.warn(`Account creation rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Account creation limit exceeded',
      message:
        'Too many accounts created from this IP. Please try again later.',
      timestamp: new Date().toISOString(),
    });
  },
});
