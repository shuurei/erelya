import path from 'path'
import { DataSource } from 'typeorm'

const { DATABASE_NAME, DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD } = process.env;

export const db = new DataSource({
    type: 'postgres',
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    username: DATABASE_USER,
    database: DATABASE_NAME,
    password: DATABASE_PASSWORD,
    synchronize: false,
    entities: [path.join(process.cwd(), `src/database/entities/**/*.entity.{js,ts}`)],
    migrations: [path.join(process.cwd(), `src/database/migrations/*.{js,ts}`)]
});