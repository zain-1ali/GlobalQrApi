import express from "express";
import {
  createQrController,
  deleteQr,
  getQrByUserid,
  getSingleQr,
  scanQr,
} from "../controllers/qrControllers.js";
import userAuth from "../middlewares/auth.js";
import { uploadFile } from "../middlewares/storage.js";

// router Object
const router = express.Router();

// create/update qr route
router.post(
  "/create",
  userAuth,
  createQrController
);

// get qr by id route
router.post("/getSingle", userAuth, getSingleQr);

// get qr by user id route
router.get("/getAll", userAuth, getQrByUserid);

// scan qr
router.get("/:id", scanQr);

// scan qr
router.post("/delete", userAuth, deleteQr);

export default router;
