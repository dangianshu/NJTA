import dotenv from 'dotenv'

dotenv.config()

export const CONFIG = {
  DB: {
    MONGO_URL: process.env.MONGO_URL as string,
   
  },
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3002,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',
  ADMIN_EMAIL: process.env.EMAIL_FROM,
  ADMIN_PASS: process.env.EMAIL_PASSWORD,
  FRONTEND_AUTH_URL: process.env.FRONTENDURL,

}
