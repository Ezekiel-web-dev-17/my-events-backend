import { config } from "dotenv";

config();
config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

/**
 * Environment Schema Definition & Service Impact Matrix
 */
export const ENV_SCHEMA = {
  PORT: {
    required: false,
    default: "5500",
    description: "Server HTTP port",
    impact: "Server defaults to port 5500 if not set.",
  },
  NODE_ENV: {
    required: false,
    default: "development",
    description: "Application environment mode (development/production)",
    impact: "Defaults to 'development'. Verbose stack traces enabled.",
  },
  MONGO_URL: {
    required: true,
    description: "MongoDB connection string URI",
    impact: "CRITICAL FAIL: Database connection fails. All API data persistence crashes.",
  },
  JWT_SECRET: {
    required: true,
    description: "Secret key for signing and verifying JWT tokens",
    impact: "CRITICAL FAIL: User authentication, login, and authorization middleware fail.",
  },
  SESSION_SECRET: {
    required: false,
    default: "secret",
    description: "Secret key for express-session middleware",
    impact: "Falls back to insecure default 'secret'. Session tampering risk.",
  },
  BACKEND_URL: {
    required: false,
    default: "http://localhost:5500",
    description: "Public base URL of the backend API server",
    impact: "Paystack redirect URLs and callback links default to localhost.",
  },
  FRONTEND_URL: {
    required: false,
    default: "http://localhost:5500",
    description: "Public URL of the frontend web client",
    impact: "CORS allowed origins and email verification redirect links default to localhost.",
  },
  EMAIL: {
    required: true,
    description: "Sender email address for Nodemailer",
    impact: "Nodemailer email dispatch (welcome emails, tickets, password resets) fails.",
  },
  PASSWORD: {
    required: true,
    description: "App Password or SMTP password for Nodemailer authentication",
    impact: "Nodemailer SMTP authentication fails. Unable to send emails.",
  },
  ADMIN_EMAIL: {
    required: false,
    description: "Notification email address for contact form inquiries",
    impact: "Defaults to EMAIL env var for contact form notifications.",
  },
  SMTP_HOST: {
    required: false,
    default: "smtp.gmail.com",
    description: "SMTP server hostname for Nodemailer",
    impact: "Defaults to Gmail SMTP service (smtp.gmail.com).",
  },
  SMTP_PORT: {
    required: false,
    default: "587",
    description: "SMTP server port",
    impact: "Defaults to port 587.",
  },
  SMTP_SECURE: {
    required: false,
    default: "false",
    description: "Use SSL/TLS for SMTP connection (true for port 465, false for 587/25)",
    impact: "Defaults to STARTTLS upgrade (false).",
  },
  PAYSTACK_SECRET_KEY: {
    required: false,
    description: "Paystack API secret key for payment processing",
    impact: "Payment initialization and webhook verification fail.",
  },
  CLOUD_NAME: {
    required: false,
    description: "Cloudinary account cloud name for image uploads",
    impact: "Cloudinary image uploads (event banners, profile photos) fail.",
  },
  CLOUDINARY_API_KEY: {
    required: false,
    description: "Cloudinary API Key",
    impact: "Cloudinary authentication fails.",
  },
  CLOUDINARY_API_SECRET: {
    required: false,
    description: "Cloudinary API Secret",
    impact: "Cloudinary authentication fails.",
  },
  GOOGLE_CLIENT_ID: {
    required: false,
    description: "Google OAuth2 Client ID",
    impact: "Google OAuth2 login & registration feature disabled.",
  },
  GOOGLE_CLIENT_SECRET: {
    required: false,
    description: "Google OAuth2 Client Secret",
    impact: "Google OAuth2 authentication token exchange fails.",
  },
  REDIS_HOST: {
    required: false,
    default: "127.0.0.1",
    description: "Redis server host address",
    impact: "Redis caching & rate limiting fall back or fail connection.",
  },
  REDIS_PORT: {
    required: false,
    default: "6379",
    description: "Redis server port",
    impact: "Defaults to port 6379.",
  },
  REDIS_USERNAME: {
    required: false,
    description: "Redis username (if required by provider)",
    impact: "Unauthenticated Redis connection attempt.",
  },
  REDIS_PASSWORD: {
    required: false,
    description: "Redis password for authentication",
    impact: "Unauthenticated Redis connection attempt.",
  },
  ARCJET_KEY: {
    required: false,
    description: "Arcjet API key for rate limiting and bot detection",
    impact: "Arcjet protection shield disabled/bypassed.",
  },
};

/**
 * Validate environment variables and print formatted report
 */
export const validateEnv = () => {
  const missingRequired = [];
  const missingOptional = [];

  console.log("\n===============================================================================");
  console.log("🔍  EVENTS-BACKEND ENVIRONMENT VARIABLE VALIDATION & SCHEMA REPORT  🔍");
  console.log("===============================================================================");

  for (const [key, schema] of Object.entries(ENV_SCHEMA)) {
    const val = process.env[key];
    if (!val || val.trim() === "") {
      if (schema.required) {
        missingRequired.push({ key, ...schema });
      } else {
        missingOptional.push({ key, ...schema });
      }
    }
  }

  if (missingOptional.length > 0) {
    console.warn("\n⚠️  OPTIONAL ENVIRONMENT SECRETS NOT CONFIGURED:");
    missingOptional.forEach(({ key, description, impact, default: def }) => {
      console.warn(`   • [${key}] - ${description} ${def ? `(Default: '${def}')` : ""}`);
      console.warn(`     Consequence: ${impact}`);
    });
  }

  if (missingRequired.length > 0) {
    console.error("\n❌  CRITICAL MISSING REQUIRED ENVIRONMENT SECRETS:");
    missingRequired.forEach(({ key, description, impact }) => {
      console.error(`   • [${key}] - REQUIRED (${description})`);
      console.error(`     CRITICAL IMPACT: ${impact}`);
    });
    console.error("\n===============================================================================");
    console.error("⛔  SERVER WARNING: Missing required secrets will cause service degradation or failure.");
    console.error("===============================================================================\n");
  } else {
    console.log("✅  All required environment secrets are configured successfully.");
    console.log("===============================================================================\n");
  }

  return { missingRequired, missingOptional };
};

// Execute schema validation on config load
export const envStatus = validateEnv();

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
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SESSION_SECRET,
} = process.env;