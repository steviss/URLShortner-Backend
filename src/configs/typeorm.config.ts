import { ConnectionOptions } from 'typeorm';
import { config } from '.';

export const typeormConfig = {
    host: config.__DBHOST__,
    database: config.__DBNAME__,
    type: config.__DBTYPE__,
    username: config.__DBUSER__,
    password: config.__DBPASS__,
    logging: !config.__PROD__,
} as ConnectionOptions;
