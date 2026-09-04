import express from "express";
import {
  createEvents,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventControl.js";
import { isUser, isAdmin, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-event", isUser, isAdmin, createEvents);
router.get("/all-event", getAllEvents);
router.get("/single-event/:id", isUser, getSingleEvent);
router.patch("/update-event/:id", isUser, isAdmin, updateEvent);
router.delete("/delete-event/:id", isUser, isSuperAdmin, deleteEvent);

export default router;
