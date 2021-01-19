import { NextFunction, Request, Response, RequestHandler } from 'express';
import { ErrorDispatch } from '../utils';
import { ApiRouter } from '../api/ApiRouter';
import { MetadataKeys } from './MetadataKeys';
import { Methods } from './Methods';

function bodyValidators(keys: string[]): RequestHandler {
    return function (req: Request, res: Response, next: NextFunction) {
        if (!req.body) {
            return res.status(200).json(ErrorDispatch('body', 'Invalid request'));
        }
        for (let key of keys) {
            if (!req.body[key]) {
                return res.status(200).json(ErrorDispatch(key, `Invalid request missing ${key}`));
            }
        }
        return next();
    };
}

export function controller(prefix: string) {
    return function (target: Function) {
        const router = ApiRouter.get();
        for (let key in target.prototype) {
            const handler = target.prototype[key];
            const path = Reflect.getMetadata(MetadataKeys.Path, target.prototype, key);
            const method: Methods = Reflect.getMetadata(MetadataKeys.Method, target.prototype, key);
            const middlewares = Reflect.getMetadata(MetadataKeys.Middleware, target.prototype, key) || [];
            const requiredBodyProps = Reflect.getMetadata(MetadataKeys.Validator, target.prototype, key) || [];
            const validator = bodyValidators(requiredBodyProps);
            if (path) {
                router[method](`${prefix}${path}`, ...middlewares, validator, handler);
            }
        }
    };
}
