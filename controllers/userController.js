import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";

export let updateUser = async (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.userId;

  if (!userId) {
    res.status(401).send({ status: false, msg: "Unautherized" });
  }

  let userExist = await userModel.findOne({ _id: userId });

  if (!userExist) {
    res.status(404).send({ status: false, msg: "User not found" });
  }

  const UpdatedAbout = await userModel.findByIdAndUpdate(
    { _id: userId },
    {
      name,
      email,
      profileUrl:
        req.files["profileUrl"]?.length === 1
          ? `http://localhost:4000/public/images/${req.files["profileUrl"][0].filename}`
          : userExist?.profileUrl,
    }
  );

  res.status(200).send({ status: true, msg: "user updated successfuly" });
};

export let getUser = async (req, res, next) => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).send({ status: false, msg: "Unautherized!" });
  }

  const user = await userModel.findOne({ _id: userId });

  if (user) {
    res.status(200).send({ status: true, msg: "success", data: user });
  } else {
    res.status(404).send({ status: false, msg: "User not found" });
  }
};
