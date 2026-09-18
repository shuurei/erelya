import path from 'path';
import { DataSource } from 'typeorm'

const { ENV, DATABASE_NAME, DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD } = process.env;

export const db = new DataSource({
    type: 'postgres',
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    username: DATABASE_USER,
    database: DATABASE_NAME,
    password: DATABASE_PASSWORD,
    synchronize: ENV === 'DEV',
    entities: [path.join(import.meta.dirname, 'database/entities/**/*.entity.{js,ts}')]
});