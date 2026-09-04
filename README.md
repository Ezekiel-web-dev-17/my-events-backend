# 🎪 EVENTS-BACKEND

A robust, scalable RESTful API and WebSocket backend server for an Event Management Platform (similar to Eventbrite). This platform powers event creation, ticket purchasing, Paystack payment webhooks, real-time dashboard notifications via Socket.IO, Google OAuth2 authentication, Redis caching, and QR code ticket verification.

---

## 🚀 Features

- **Authentication & Authorization:** JWT-based user authentication and Google OAuth2 integration with role-based access control (`user`, `admin`, `superAdmin`).
- **Event Management:** Create, update, fetch, and list upcoming and past events.
- **Ticketing & QR Verification:** Generate unique QR code tickets upon successful purchase and verify ticket validity.
- **Payment Gateway:** Secure payment initiation and webhook handling integrated with **Paystack**.
- **Real-Time Notifications:** Socket.IO dashboard notifications for administrative events, unread notification counts, and status updates.
- **Performance & Caching:** **Redis** caching middleware for fast API response times.
- **Security & Protection:** Rate limiting and bot protection powered by **Arcjet Security**.
- **Media Uploads:** Cloudinary integration for event image uploads.
- **Email Dispatch:** SendGrid and Nodemailer email templates for welcome emails, payment receipts, and ticket delivery.

---

## 🛠 Tech Stack

- **Runtime:** Node.js (ES Modules - `type: "module"`)
- **Framework:** Express.js 5
- **Database:** MongoDB with Mongoose ORM
- **Caching & In-Memory Store:** Redis (`ioredis`)
- **Real-Time WebSockets:** Socket.IO
- **Security:** Arcjet, JWT, bcryptjs, Helmet/CORS
- **Authentication:** Passport.js (Google OAuth2)
- **Payment Gateway:** Paystack API
- **Cloud Storage:** Cloudinary
- **Email Services:** SendGrid Mail & Nodemailer

---

## 📁 Project Structure

```
EVENTS-BACKEND/
├── config/              # Passport, Arcjet, and system configurations
├── controllers/         # Request handlers (Auth, Events, Tickets, Payments, Notifications)
├── emails/              # HTML email templates and email service handlers
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
   git clone https://github.com/<YOUR_USERNAME>/my-events-backend.git
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
   The server will start on `http://localhost:5500` (or your configured `PORT`).

5. **Start Production Server:**
   ```bash
   npm start
   ```

---

## 🔑 Environment Variables Reference

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port number for the server | `5500` |
| `NODE_ENV` | Application environment mode | `development` |
| `SESSION_SECRET` | Secret key for express-session | `your_secret` |
| `MONGO_URL` | MongoDB connection URI | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_jwt_secret` |
| `BACKEND_URL` | Base URL of the backend API | `http://localhost:5500` |
| `FRONTEND_URL` | URL of the frontend application | `http://localhost:5500` |
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
| `SENDGRID_API_KEY` | API Key for SendGrid Mail | `SG.xxx` |

---

## 🤝 Contribution Guidelines

We welcome contributions! To keep the codebase clean and maintainable, please follow these guidelines when contributing:

1. **Fork & Branching:**
   - Create a feature branch off `main`:
     ```bash
     git checkout -b feature/your-feature-name
     ```
   - For bug fixes, use:
     ```bash
     git checkout -b bugfix/issue-description
     ```

2. **Code Style & ES Modules:**
   - This project uses **ES Modules (`"type": "module"`)**.
   - Use standard `import` / `export` syntax instead of `require()` / `module.exports`.
   - Ensure all relative imports include file extensions (e.g. `import userController from './controllers/userController.js';`).

3. **Commit Messages:**
   - Keep commit messages concise and descriptive using traditional conventions:
     - `feat: add endpoint for marking all notifications read`
     - `fix: resolve token decoding issue in middleware`
     - `refactor: update mail helper to use async/await`

4. **Pull Requests:**
   - Push your branch to your remote fork and open a Pull Request against `main`.
   - Describe the changes made, any new endpoints added, and instructions to test your feature.

---

## 📄 License

This project is open-source and available under the [ISC License](LICENSE).
