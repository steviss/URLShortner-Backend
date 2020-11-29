import { RedisOptions } from 'ioredis';
import { config } from './utils/_constants';

export const redisConfig = {
    host: config.__REDISHOST__,
    port: config.__REDISPORT__,
    password: config.__REDISPASSWORD__,
} as RedisOptions;
