import mongoose from "mongoose";

let userModel = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  isAdmin: {
    type: Boolean,
  },
  password: {
    type: String,
  },
  profileUrl: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    default: "",
  },
});

export default mongoose.model("User", userModel);
