import { RequestHandler } from 'express';
import { MetadataKeys } from './MetadataKeys';

export function useMiddleware(middleware: RequestHandler) {
    return function (target: any, key: string, _desc: PropertyDescriptor) {
        const middlewares = Reflect.getMetadata(MetadataKeys.Middleware, target, key) || [];
        Reflect.defineMetadata(MetadataKeys.Middleware, [...middlewares, middleware], target, key);
    };
}
