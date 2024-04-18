import express from "express";
import {
  createQrController,
  getQrByUserid,
  getSingleQr,
} from "../controllers/qrControllers.js";
import userAuth from "../middlewares/auth.js";
import { uploadFile } from "../middlewares/storage.js";

// router Object
const router = express.Router();

// create/update qr route
router.post(
  "/create",
  userAuth,
  uploadFile.fields([{ name: "logo", maxCount: 1 }]),
  createQrController
);

// get qr by id route
router.get("/getSingle", userAuth, getSingleQr);

// get qr by user id route
router.get("/getAll", userAuth, getQrByUserid);

export default router;
