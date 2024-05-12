import mongoose from "mongoose";

let analyticsModel = new mongoose.Schema({
  totalQrs: {
    type: Number,
    default: 0,
  },
  activeQrs: {
    type: Number,
    default: 0,
  },
  inactiveQrs: {
    type: Number,
    default: 0,
  },
  totalQrDownload: {
    type: Number,
    default: 0,
  },
  totalQrScan: {
    type: Number,
    default: 0,
  },

  totalQrDownloadCrntMonth: {
    type: Number,
    default: 0,
  },
  updatedMonth: {
    type: Number,
    default: Date.now(),
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    require: true,
  },
});

export default mongoose.model("Analytics", analyticsModel);
