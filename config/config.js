import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const {
    ARCJET_KEY,
    ADMIN_EMAIL,
    BACKEND_URL,
    CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    EMAIL,
    FRONTEND_URL,
    FRONTEND_TICKET,
    FRONTEND_STATUS_PATH,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    JWT_SECRET,
    MONGO_URL,
    NODE_ENV,
    PAYSTACK_SECRET_KEY,
    PASSWORD,
    PORT,
    REDIS_USERNAME,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_PASSWORD,
    SENDGRID_API_KEY,
    SESSION_SECRET,
} = process.env;