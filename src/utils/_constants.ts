import dotenv from 'dotenv';

dotenv.config();
export const config = {
    __PROD__: process.env.NODE_ENV === 'production',
    __DBNAME__: process.env.DB_NAME,
    __DBUSER__: process.env.DB_USERNAME,
    __DBHOST__: process.env.DB_HOSTNAME,
    __DBPASS__: process.env.DB_PASSWORD,
    __DBTYPE__: process.env.DB_TYPE,
    __REDISPORT__: process.env.REDIS_PORT,
    __REDISHOST__: process.env.REDIS_HOST,
    __REDISNAME__: process.env.REDIS_NAME,
    __REDISPASSWORD__: process.env.REDIS_PASSWORD,
    __PORT__: process.env.EXPRESS_PORT,
    __REACT__PORT: process.env.REACT_PORT,
    __DOMAIN__: process.env.DOMAIN,
    __DEV_DOMAIN__: `${process.env.DEV_DOMAIN}:${process.env.REACT_PORT}`,
    __EMAILREGEX__: new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'),
    __SESSIONCOOKIENAME__: `${process.env.APP_NAME?.toLocaleLowerCase()}-app-qid`,
    __SESSIONSECRET__: '/^A40+;ZEY[Ig[OZvngEM--XlYLDtO',
    __DEV_COOKIELIFE__: 1000 * 60 * 60 * 24 * 365 * 1, //1 year
    __SESSIONTTL__: 1000 * 60 * 60 * 24 * 30, // 30 days
    __COOKIELIFE__: 1000 * 60 * 60 * 24 * 30, // 30 days
    __DEMOEMAILUSER__: 'wxpirgefaxnep6lx@ethereal.email',
    __DEMOEMAILPASS__: 'q7hbRYJ28KQ5AexKAU',
    __FORGOT_PASSWORD_PREFIX__: 'forgot-password:',
    __FORGOT_PASSWORD_EXPIRES__: 1000 * 60 * 60 * 24 * 3, // 3 days
    __ROOT_FOLDER__: process.env.INIT_CWD as string,
};
