import express from "express";

import {
  SigninController,
  SignupController,
} from "../controllers/authController.js";

// router Object
const router = express.Router();

// Register route
router.post("/register", SignupController);

// Login route
router.post("/login", SigninController);

export default router;
