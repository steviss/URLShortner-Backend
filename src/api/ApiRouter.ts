import { Router } from 'express';
import { Redis } from 'ioredis';

export interface ResponseMessage {
    status?: any;
    message?: string;
    errors?: {
        field: string;
        message: string;
    }[];
    data?: {} | [];
}

export class ApiRouter {
    private static instance: Router;
    private static redis: Redis;
    static init(redis: Redis): Router {
        ApiRouter.redis = redis;
        if (!ApiRouter.instance) {
            ApiRouter.instance = Router();
        }
        return ApiRouter.instance;
    }
    static get(): Router {
        if (!ApiRouter.instance) {
            ApiRouter.instance = Router();
        }
        return ApiRouter.instance;
    }
    static setRedis(redis: Redis): void {
        ApiRouter.redis = redis;
    }
    static getRedis(): Redis {
        return ApiRouter.redis;
    }
}
