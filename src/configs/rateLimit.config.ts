import rateLimit from 'express-rate-limit';

export const rateLimitConfig = {
    windowMs: 30 * 1000,
    max: 1000,
} as rateLimit.Options;
