# 🎪 EVENTS-BACKEND

A robust, scalable RESTful API and WebSocket backend server for an Event Management Platform (similar to Eventbrite). This platform powers event creation, ticket purchasing, Paystack payment webhooks, real-time dashboard notifications via Socket.IO, Google OAuth2 authentication, Redis caching, Nodemailer email dispatch, and QR code ticket verification.

---

## 🚀 Features

- **Authentication & Authorization:** JWT-based user authentication, email verification, password reset, and Google OAuth2 integration with role-based access control (`user`, `admin`, `superAdmin`).
- **Event Management:** Create, update, fetch, and list upcoming and past events.
- **Ticketing & QR Verification:** Generate unique QR code tickets upon successful purchase and verify ticket validity via scanner endpoints.
- **Payment Gateway:** Secure payment initialization and webhook handling integrated with **Paystack**.
- **Real-Time Notifications:** Socket.IO dashboard notifications for administrative events, unread notification counts, and status updates.
- **Email Dispatch:** Unified **Nodemailer** integration (Gmail & custom SMTP support) for welcome emails, email verification, password resets, payment receipts, and ticket delivery.
- **Environment Schema & Impact Validation:** Startup environment validation matrix with detailed service impact reporting for missing secrets.
- **Performance & Caching:** **Redis** caching middleware (`ioredis`) for fast API response times.
- **Security & Logging:** **Morgan** HTTP request logger and rate-limiting/bot protection powered by **Arcjet Security**.
- **Media Uploads:** Cloudinary integration for event image uploads.

---

## 🛠 Tech Stack

- **Runtime:** Node.js (ES Modules - `"type": "module"`)
- **Framework:** Express.js 5
- **Database:** MongoDB with Mongoose ORM
- **Caching & In-Memory Store:** Redis (`ioredis`)
- **Real-Time WebSockets:** Socket.IO
- **Security & Validation:** Arcjet, JWT, bcryptjs, CORS, Morgan
- **Authentication:** Passport.js (Google OAuth2)
- **Payment Gateway:** Paystack API
- **Cloud Storage:** Cloudinary
- **Email Services:** Nodemailer (SMTP / Gmail)

---

## 📁 Project Structure

```
EVENTS-BACKEND/
├── config/              # Passport, Arcjet, and Environment validation schema
├── controllers/         # Request handlers (Auth, Events, Tickets, Payments, Notifications)
├── emails/              # Reusable Nodemailer mailer & HTML email templates
├── frontend/            # Dashboard interface for real-time notification testing
├── helpers/             # Utility helpers (Redis, Socket.IO, QR generation, Token helpers)
├── middleware/          # Auth checks, Redis caching, Socket auth, and Error handling
├── models/              # Mongoose database schemas (User, Event, Ticket, Notification, etc.)
├── routes/              # Express API route endpoints
├── index.js             # Application entry point & Socket.IO server startup
├── example.env          # Template for required environment variables
└── package.json         # Project dependencies and npm scripts
```

---

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- [Redis](https://redis.io/) (Local instance or Cloud provider)

### Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Ezekiel-web-dev-17/my-events-backend.git
   cd EVENTS-BACKEND
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `example.env` to `.env` (or `.env.development.local`) and update the values with your credentials:
   ```bash
   cp example.env .env
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000` (or your configured `PORT`).

5. **Start Production Server:**
   ```bash
   npm start
   ```

---

## 🔑 Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port number for the server | `5000` |
| `NODE_ENV` | Application environment mode | `development` |
| `SESSION_SECRET` | Secret key for express-session | `your_secret` |
| `MONGO_URL` | MongoDB connection URI | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_jwt_secret` |
| `BACKEND_URL` | Base URL of the backend API | `http://localhost:5000` |
| `FRONTEND_URL` | URL of the frontend application | `http://localhost:5000` |
| `EMAIL` | Sender email address for Nodemailer | `your_email@gmail.com` |
| `PASSWORD` | Google App Password or SMTP password | `16_char_app_password` |
| `ADMIN_EMAIL` | Contact form notification recipient email | `admin@yourdomain.com` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_SECURE` | Use SSL/TLS for SMTP connection | `false` |
| `GOOGLE_CLIENT_ID` | OAuth2 Client ID from Google Console | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth2 Client Secret from Google Console | `GOCSPX-xxx` |
| `PAYSTACK_SECRET_KEY` | Secret key from Paystack API dashboard | `sk_test_xxx` |
| `REDIS_HOST` | Hostname for Redis connection | `127.0.0.1` |
| `REDIS_PORT` | Port for Redis connection | `6379` |
| `REDIS_PASSWORD` | Password for Redis (if applicable) | `your_redis_password` |
| `ARCJET_KEY` | API Key for Arcjet security rate limiter | `ajkey_xxx` |
| `CLOUD_NAME` | Cloudinary Cloud Name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `your_api_secret` |

---

## 📡 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - User registration (triggers verification email)
- `POST /api/auth/login` - User login (JWT returned)
- `POST /api/auth/verify-email/:token` - Verify user email address via token
- `POST /api/auth/resend-email` - Resend verification email
- `POST /api/auth/forgot-password` - Trigger password reset link
- `POST /api/auth/reset-password` - Reset account password
- `POST /api/auth/change-password/:id` - Change password (Authenticated)

### Events (`/api/events`)
- `GET /api/events` - Fetch all live events
- `GET /api/events/:id` - Fetch single event details
- `POST /api/events` - Create a new event (Admin)
- `PATCH /api/events/:id` - Update event details (Admin)
- `DELETE /api/events/:id` - Delete an event (Admin)

### Payments & Webhooks (`/api/payments` & `/api/webhook`)
- `POST /api/payments/initialize/:ticketId` - Initialize Paystack payment transaction
- `GET /api/payments/verify` - Verify Paystack payment transaction & issue tickets
- `POST /api/webhook` - Paystack webhook listener endpoint

### Tickets & QR Verification (`/api/tickets` & `/api/qrcode`)
- `GET /api/tickets/user` - Fetch ticket instances belonging to logged-in user
- `POST /api/qrcode/verify` - Scan & verify ticket QR code validity

### Notifications (`/api/notifications`)
- `GET /api/notifications` - Fetch all admin notifications
- `GET /api/notifications/unread` - Fetch unread notifications
- `PATCH /api/notifications/mark/:id` - Mark notification as read
- `PATCH /api/notifications/mark-all` - Mark all notifications as read

---

## 🤝 Contribution Guidelines

We welcome contributions! Please follow these rules when submitting code:

1. **Fork & Branching:**
   - Create a feature branch off `main`:
     ```bash
     git checkout -b feature/your-feature-name
     ```
2. **ES Modules Standard:**
   - Always use standard `import` / `export` syntax (`"type": "module"`).
   - Environment variables must be imported from `config/config.js` rather than calling raw `process.env`.
3. **Commit Messages:**
   - Keep messages concise and formatted (`feat: ...`, `fix: ...`, `refactor: ...`).

---

## 📄 License

This project is open-source and available under the [ISC License](LICENSE).
