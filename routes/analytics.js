import express from "express";

import {
  updateAnalytics,
  getAnalytics,
  getScansAnalytics,
} from "../controllers/analyticsController.js";
import userAuth from "../middlewares/auth.js";

// router Object
const router = express.Router();

// Register route
router.post("/update", userAuth, updateAnalytics);
// Login route
router.post("/get", userAuth, getAnalytics);

router.post("/scans", userAuth, getScansAnalytics);

export default router;
