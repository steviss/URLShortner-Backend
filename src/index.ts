import 'reflect-metadata';
import express from 'express';
import Redis from 'ioredis';
import cors from 'cors';
import session from 'express-session';
import connectRedis from 'connect-redis';
import morgan from 'morgan';
import helmet from 'helmet';
import { typeormConfig } from './typeorm.config';
import { redisConfig } from './redis.config';
import { config } from './utils/_constants';
import { createConnection } from 'typeorm';
import Entities from './entities';
import { routeMiddleware } from './routes';

/* Adding userId to Session Context */

declare module 'express-session' {
    interface Session {
        userId: string;
    }
}

const main = async () => {
    /* Type ORM */
    /* Connecting to DB */
    await createConnection({
        ...typeormConfig,
        entities: Entities,
        //ENABLE BELOW FOR FIRST RUN INSTALL (POPULATES MYSQL WITH NESCESSARY DATA)
        //synchronize: true,
    });

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
    app.use(morgan('common'));

    /* Server Public Folder */
    app.use(express.static('./public'));

    /* Аccept JSON data оnly */
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    /* Express Slow Down */
    /* for reverse proxy stuff */
    app.enable('trust proxy');

    /* Create a session, I might not use this. It just might be fully anonymous */
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

    /* Routes Middleware*/
    app.use('/', routeMiddleware(redis));

    /* Register a Redirect it can be anonymous or registered */
    /* If registered, save an ownerID */

    app.use((_, res) => {
        res.status(404).redirect('/404');
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
