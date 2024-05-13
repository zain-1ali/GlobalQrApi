import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import analyticsModel from "../models/analyticsModel.js";

export let SignupController = async (req, res, next) => {
  try {
    if (!req.body.email) {
      res.status(200).send({ status: false, msg: "email field is required" });
    }
    if (!req.body.password) {
      res
        .status(200)
        .send({ status: false, msg: "password field is required" });
    }

    let userExist = await userModel.findOne({ email: req.body.email });

    if (userExist) {
      res
        .status(200)
        .send({ status: false, msg: "this email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    let bcryptpassword = await bcrypt.hash(req.body.password, salt);

    let newUser = await userModel.create({
      email: req.body.email,
      password: bcryptpassword,
      isAdmin: false,
    });

    await analyticsModel.create({
      userId: newUser?._id,
    });

    res.status(200).send({ status: true, msg: "new user created successfuly" });
  } catch (error) {
    res.status(500).send({
      status: false,
      msg: "internal server error",
      error,
    });
  }
};

export let SigninController = async (req, res, next) => {
  try {
    if (!req.body.email) {
      res.send({ status: false, msg: "all fields are required" });
    }
    if (!req.body.password) {
      res.send({ status: false, msg: "all fields are required" });
    }

    let userExist = await userModel.findOne({ email: req.body.email });

    if (!userExist) {
      res.send({ status: false, msg: "user not found" });
    }

    let isMatch = await bcrypt.compare(req.body.password, userExist.password);

    if (!isMatch) {
      res.send({ status: false, msg: "wrong credentials!" });
    }

    let theToken = Jwt.sign({ userId: userExist._id }, "mySecret", {
      expiresIn: "1y",
    });

    res.status(200).send({
      status: true,
      msg: "Login successfuly",
      token: theToken,
      isAdmin: userExist?.isAdmin,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      msg: "internal server error",
      error,
    });
  }
};
