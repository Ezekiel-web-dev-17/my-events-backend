import express from "express";
import passport from "passport";
import { googleCallback, finalizeGoogle } from "../controllers/googleAuth.js";
import User from "../models/usersSchema.js";

const router = express.Router();

// Step 1: Redirect to Google for login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google redirects back to your app with tokens
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/failure",
  }),
  googleCallback
);

// Step 3: Finalize Google login/signup after user selects email
router.post("/google/finalize", finalizeGoogle);

export default router;
