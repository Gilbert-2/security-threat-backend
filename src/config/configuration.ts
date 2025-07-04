import { url } from "inspector";

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    // host: process.env.DATABASE_HOST,
    // port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    // username: process.env.DATABASE_USERNAME,
    // password: process.env.DATABASE_PASSWORD,
    // database: process.env.DATABASE_NAME,
    url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Hm5cbAEjWCl2@ep-purple-recipe-a8u60js9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
});