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
const allowedOrigins = ["http://localhost:5173"]; // Add other domains as needed
// const corsOptions = {
//   origin: "http://localhost:5173",
//   credentials: true,
//   optionSuccessStatus: 200,
// };
app.use(cors({ origin: "*" }));
app.use("/public/images", express.static("public/images"));

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
