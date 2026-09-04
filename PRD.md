# PRODUCT REQUIREMENT DOCUMENT

Build the server for an event planning organization some what like Eventbritte website. The superadmin should be able to create and edit events and the users are to be able to get tickets for events, see upcoming events and events the user has attended before. The frontend would also have a dashboard whose content would be fetched from the Server.

## Current Features
Currently the following features are already implemented:
- Payment for events to Paystack webhook.
- Authentication and Authorization with and without Google Auth.
- Event related routes.
- Websocket for notifications on the Dashboard.
- Email notifications for major user events like the user sign up flow and ticket purchases.
- Ticket verification.

## Expected features
- An improved notification system for the dashboard.
- Idempotency for the user payment.