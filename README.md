# GourmetGo Backend

REST API for an academic Android application that connects diners with gastronomic experiences. The backend handles accounts, experience listings, reservations, QR tickets, and ratings.

[Documentación técnica en español](README.es.md)

## What it includes

- User and host registration, bcrypt password hashing, JWT login, and role checks for managing experiences.
- Experience listings, filters, and host management routes.
- Reservation creation with availability checks, QR generation, and confirmation emails.
- Ratings for reservations marked as attended, ticket data in JSON, and a rule-based FAQ endpoint.

**Stack:** JavaScript, Node.js, Express 5, MySQL, JWT, bcrypt, Nodemailer, QRCode.

## Local setup

Requires Node.js, npm, MySQL, and Gmail SMTP credentials for email flows.

1. Install dependencies with `npm install`.
2. Create a root `.env` file:

   ```dotenv
   PORT=4000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=gourmetgo
   JWT_SECRET=your_local_signing_secret
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_google_app_password
   ```

3. Prepare the local database using [the SQL development script](config/scriptllenado-creacion.sql) and the queries in [the controllers](src/controllers). The SQL file contains incomplete statements, schema revisions, and reset operations. A clean first-run migration is still pending; review and reconcile this script in a disposable database before running the API.
4. Start the server with `npm run dev`. Use `npm start` to run without the development watcher.
5. Check [`GET /db-test`](http://localhost:4000/db-test). A successful database connection returns `{"db":2}`.

The API listens on port `4000` by default. The Android client is outside this repository.

## API map

| Base path | Purpose |
| --- | --- |
| `/api/auth` | Registration, login, password recovery and changes |
| `/api/users` | Authenticated profile |
| `/api/experiences` | Listings, filters, and host operations |
| `/api/reservations` | Booking and reservation queries |
| `/api/ratings` | Ratings linked to attended reservations |
| `/api/export` | Ticket and reservation data as JSON |
| `POST /api/chatbot` | Fixed responses to supported FAQ messages |

Protected routes accept `Authorization: Bearer <token>`. See [route definitions](src/routes) for methods, paths, and middleware, and [validators](src/middlewares/validators.js) for request fields.

## Project status

Academic backend prototype. Database setup needs consolidation, and reservation consistency and access controls need further validation before deployment. An automated test suite is not configured. Export routes currently provide JSON for client-side formatting.

