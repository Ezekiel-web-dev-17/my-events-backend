import express from "express";
// Import event controller functions
import {
  getAllEvents, // Fetch all events
  getAllUpComingEvents, // Fetch all upcoming events
  createEvents, // Create a new event
  updateEvent, // Update an existing event by ID
  deleteEvent, // Delete an event by ID
  cancelEvent, // Mark an event as cancelled
  filterEvent,
  getEventById,
  getDraftEvents,
  getLiveEvents, // Filter events by query params
} from "../controllers/eventController.js";

// Import middleware for checking admin authorization
import { isAdmin, isUser } from "../middleware/auth.js";
import cache from "../middleware/redisMiddleware.js";

// Initialize an Express router instance
const router = express.Router();

// ----------------------------------------------------------------------
// GET ROUTES (FIXED ORDER)
// Define fixed-string endpoints FIRST to avoid conflicts with :id
// ----------------------------------------------------------------------

// Route: GET /api/events
// Fetch all events and cache the response
router.get("/", cache("All events: "), getAllEvents);

// Route: GET /api/events/drafts
// Fetch all draft events and cache the response
router.get("/drafts", cache("All draft events: "), getDraftEvents);

// Route: GET /api/events/live
// Fetch all live events and cache the response
router.get("/live", cache("All live events: "), getLiveEvents);

// Route: GET /api/events/upcoming
// Fetch events with category = "upcoming" and cache the response
router.get("/upcoming", cache("All upcoming events: "), getAllUpComingEvents);

// Route: GET /api/events/filterby?field=value
// Filter events by query (e.g. ?location=Lagos) and cache the response
router.get("/filterby", cache("Filter event: "), filterEvent);

// ----------------------------------------------------------------------
// POST / PATCH / DELETE ROUTES (Order is less critical here, but good practice)
// ----------------------------------------------------------------------

// Route: POST /api/events/draft
// Draft new event (admin only)
router.post("/draft", isUser, isAdmin, createEvents);

// ----------------------------------------------------------------------
// Route: POST /api/events/create
// Create new event (admin only)
router.post("/create/:id", isUser, isAdmin, createEvents);

// ----------------------------------------------------------------------
// Route: POST /api/events/update/:id
// Update event by ID (admin only)
router.patch("/update/:id", isUser, isAdmin, updateEvent);

// ----------------------------------------------------------------------
// Route: POST /api/events/cancel/:id
// Cancel an event by ID (admin only)
router.patch("/cancel/:id", isUser, isAdmin, cancelEvent);

// ----------------------------------------------------------------------
// Route: DELETE /api/events/delete/:id
// Delete event by ID (admin only)
router.delete("/delete/:id", isUser, isAdmin, deleteEvent);

// ----------------------------------------------------------------------
// Route: GET /api/events/:id
// Fetch event by ID and cache the response
router.get("/:id", cache("Event details: "), getEventById);

// Export router so it can be used in server.js / app.js
export default router;
