import express from "express";

import { getUser, updateUser } from "../controllers/userController.js";
import userAuth from "../middlewares/auth.js";
import { uploadFile } from "../middlewares/storage.js";

// router Object
const router = express.Router();

// update user route
router.post(
  "/update",
  userAuth,
  uploadFile.fields([{ name: "profileUrl", maxCount: 1 }]),
  updateUser
);

// get user route
router.get("/get", userAuth, getUser);

export default router;
