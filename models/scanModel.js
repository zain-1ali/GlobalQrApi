import mongoose from "mongoose";

let scanModel = new mongoose.Schema({
  qrId: {
    type: mongoose.Types.ObjectId,
    ref: "qrs",
    require: true,
  },
  timestamp: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    require: true,
  },
});

export default mongoose.model("Scans", scanModel);
