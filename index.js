import express from "express";
import { connectDb } from "./config/db.js";
import authroutes from "./routes/auth.js";
import userroutes from "./routes/user.js";
import qrroutes from "./routes/qr.js";
import statsroutes from "./routes/analytics.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use("/public/images", express.static("public/images"));
app.use(cors());
app.use(express.json());

app.use("/api/auth/", authroutes);
app.use("/api/user/", userroutes);
app.use("/api/qr/", qrroutes);
app.use("/api/analytics/", statsroutes);

connectDb();
let prot = process.env.port || 5000;
app.listen(prot, () => {
  console.log(`server is running on port ${prot}`);
});
