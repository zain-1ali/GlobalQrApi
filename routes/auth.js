import express from "express";

import {
  GoogleAuthController,
  SigninController,
  SignupController,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

// router Object
const router = express.Router();

// Register route
router.post("/register", SignupController);
// Login route
router.post("/login", SigninController);
router.post("/googleAuth", GoogleAuthController);
router.post("/forgetPassword", forgotPassword);
router.post("/resetPassword", resetPassword); 

export default router;
