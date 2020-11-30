import slowDown from 'express-slow-down';

export const slowDownConfig = {
    windowMs: 30 * 1000,
    max: 1,
} as slowDown.Options;
