import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/globalQr").then(() => {
      console.log("db is conncted");
    });
  } catch (error) {
    console.log(error);
  }
};
