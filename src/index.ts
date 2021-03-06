import 'reflect-metadata';
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectRedis from 'connect-redis';
import morgan from 'morgan';
import helmet from 'helmet';
import Redis from 'ioredis';
import { createConnection } from 'typeorm';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Server } from 'socket.io';
import { config, redisConfig, rateLimitConfig, slowDownConfig, typeormConfig } from './configs';
import Entities from './entities';
import { ApiRouter } from './api/ApiRouter';
import './controllers';

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
    app.use(
        morgan('common', {
            stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' }),
        }),
    );

    /* Server Public Folder */
    app.use(express.static('./public'));

    /* Аccept JSON data оnly */
    app.use(express.json());

    /* Enable Body Property Middleware */
    app.use(express.urlencoded({ extended: true }));

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
    //app.use('/', slowDown(slowDownConfig), rateLimit(rateLimitConfig), routeMiddleware(redis));
    app.use(ApiRouter.init(redis));
    /* Apply Api limitations */
    app.use(slowDown(slowDownConfig), rateLimit(rateLimitConfig));

    /* Listen */
    const listen = app.listen(config.__PORT__, () => {
        console.log(`CORS: http://${config.__PROD__ ? config.__DOMAIN__ : config.__DEV_DOMAIN__}`);
        console.log(`Server started on port: ${config.__PORT__}`);
        console.log(`Is this production: ${config.__PROD__}`);
    });
    /* Socket IO */
    const io = new Server(listen);
    //odustani od ovoga zavrsi collections i zavrsi page pojedinacni, geolokaciju takodje. poslije react native udaraj
    io.on('connection', (client) => {
        console.log("io's ready");
        client.on('event', (data: any) => {
            console.log('event', data);
        });
        client.on('disconnect', () => {
            console.log('disconnect');
        });
    });
};

/* Catch errors */
main().catch((err) => {
    console.error(err);
});
