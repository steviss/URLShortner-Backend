import 'reflect-metadata';
import express from 'express';
import { config } from './utils/_constants';
import Redis from 'ioredis';
import cors from 'cors';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { redisConfig } from './redis.config';

const main = async () => {
    /* Expresss */
    const app = express();

    //Delete all the posts, you need to turn off synchronize first (syncronize will crash this operation, because it will try to fill the items that are being deleted)
    //await User.delete({});

    /* Redis Stuff */
    /* Redis server for Sessions not using JWT */
    const RedisStore = connectRedis(session);
    const redis = new Redis(redisConfig);

    //Cors
    app.use(
        cors({
            origin: `http://${config.__PROD__ ? config.__DOMAIN__ : config.__DEV_DOMAIN__}`,
            credentials: true,
        }),
    );

    app.use(
        session({
            name: config.__SESSIONCOOKIENAME__,
            store: new RedisStore({ client: redis, disableTouch: true }),
            cookie: {
                maxAge: config.__PROD__ ? config.__COOKIELIFE__ : config.__DEV_COOKIELIFE__,
                httpOnly: true,
                sameSite: 'lax', // CSRF
                secure: config.__PROD__, // cookie only works in https
            },
            saveUninitialized: false,
            secret: config.__SESSIONSECRET__,
            resave: false,
        }),
    );
};

/* Catch errors */
main().catch((err) => {
    console.error(err);
});
