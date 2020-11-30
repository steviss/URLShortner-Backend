import rateLimit from 'express-rate-limit';

export const rateLimitConfig = {
    windowMs: 30 * 1000,
    max: 1,
} as rateLimit.Options;
