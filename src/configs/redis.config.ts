import { RedisOptions } from 'ioredis';
import { config } from '.';

export const redisConfig = {
    host: config.__REDISHOST__,
    port: config.__REDISPORT__,
    password: config.__REDISPASSWORD__,
} as RedisOptions;
