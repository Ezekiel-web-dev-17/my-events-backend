import express from "express";
import {
  handleCreateTicket,
  handleUpdateTicket,
  handleGetAllTicket,
  handleDeleteTicket,
  handleClearEventTickets,
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/create/:eventId", handleCreateTicket);
router.get("/getAll/:eventId", handleGetAllTicket);
router.patch("/update/:ticketId", handleUpdateTicket);
router.delete("/delete/:ticketId", handleDeleteTicket);
router.delete("/delete/:eventId", handleClearEventTickets);

export default router;