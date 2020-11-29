import 'reflect-metadata';
import express from 'express';
import { config } from './utils/_constants';
import Redis from 'ioredis';
import cors from 'cors';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { redisConfig } from './redis.config';
import morgan from 'morgan';
import helmet from 'helmet';

const main = async () => {
    /* Expresss */
    const app = express();

    /* Redis Stuff */
    /* Redis server for Sessions not using JWT */
    const RedisStore = connectRedis(session);
    const redis = new Redis(redisConfig);

    /* CORS Stuff */
    app.use(
        cors({
            origin: `http://${config.__PROD__ ? config.__DOMAIN__ : config.__DEV_DOMAIN__}`,
            credentials: true,
        }),
    );

    /* Helmet Stuff */
    /* Basic Security */
    app.use(helmet());

    /* Morgan Stuff */
    /* Logging */
    app.use(morgan('tiny'));

    app.use(express.json());

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
    app.get('/', function (_, res) {
        res.send('hello, world!');
    });

    /* Listen */
    app.listen(config.__PORT__, () => {
        console.log(`CORS: http://${config.__PROD__ ? config.__DOMAIN__ : config.__DEV_DOMAIN__}`);
        console.log(`Server started on port: ${config.__PORT__}`);
        console.log(`Is this production: ${config.__PROD__}`);
    });
};

/* Catch errors */
main().catch((err) => {
    console.error(err);
});
