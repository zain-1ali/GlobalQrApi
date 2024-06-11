import express from "express";

import {
  GoogleAuthController,
  SigninController,
  SignupController,
} from "../controllers/authController.js";

// router Object
const router = express.Router();

// Register route
router.post("/register", SignupController);
// Login route
router.post("/login", SigninController);
router.post("/googleAuth", GoogleAuthController);

export default router;
