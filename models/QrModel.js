import mongoose from "mongoose";

let qrModel = new mongoose.Schema({
  url: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  forColor: {
    type: String,
    default: "#000000",
  },
  bgColor: {
    type: String,
    default: "#ffffff",
  },
  eyeColor: {
    type: String,
    default: "#000000",
  },
  logo: {
    type: String,
    default: "",
  },
  bodyShape: {
    type: String,
    default: "square",
  },
  eyeShape: {
    type: String,
    default: "0,0,0,0",
  },
  frameShape: {
    type: String,
    default: "0,0,0,0",
  },
  status: {
    type: Boolean,
    default: true,
  },
  totalScans: {
    type: Number,
    default: 0,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    require: true,
  },
});

export default mongoose.model("Qrs", qrModel);
