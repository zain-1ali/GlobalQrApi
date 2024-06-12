import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import analyticsModel from "../models/analyticsModel.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  port: 465, // true for 465, false for other ports

  host: "server15.hndservers.net",
  auth: {
    user: "zain@link2avicenna.com",
    pass: "Avicenna7860#",
  },
  secure: true,
});

export let SignupController = async (req, res, next) => {
  try {
    if (!req.body.email) {
      return res
        .status(200)
        .send({ status: false, msg: "Email field is required" });
    }
    if (!req.body.password) {
      return res
        .status(200)
        .send({ status: false, msg: "Password field is required" });
    }

    let userExist = await userModel.findOne({ email: req.body.email });

    if (userExist) {
      return res
        .status(200)
        .send({ status: false, msg: "This email is already registered" });
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

    return res
      .status(200)
      .send({ status: true, msg: "New user created successfuly" });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: "Something went wrong",
      error,
    });
  }
};

export let SigninController = async (req, res, next) => {
  try {
    if (!req.body.email) {
      return res.send({ status: false, msg: "All fields are required" });
    }
    if (!req.body.password) {
      return res.send({ status: false, msg: "All fields are required" });
    }

    let userExist = await userModel.findOne({ email: req.body.email });

    if (!userExist) {
      return res.send({ status: false, msg: "User not found" });
    }

    let isMatch = bcrypt.compare(req.body.password, userExist.password);

    if (!isMatch) {
      return res.send({ status: false, msg: "Wrong credentials!" });
    }

    let theToken = Jwt.sign({ userId: userExist._id }, "mySecret", {
      expiresIn: "1y",
    });

    return res.status(200).send({
      status: true,
      msg: "Login successfuly",
      token: theToken,
      isAdmin: userExist?.isAdmin,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: "internal server error",
      error,
    });
  }
};

export let GoogleAuthController = async (req, res, next) => {
  try {
    if (!req.body.email) {
      return res
        .status(200)
        .send({ status: false, msg: "Email field is required" });
    }

    let userExist = await userModel.findOne({ email: req.body.email });

    if (userExist) {
      const theToken = Jwt.sign({ userId: userExist._id }, "mySecret", {
        expiresIn: "1y",
      });
      return res.status(200).send({
        status: true,
        msg: "Authenticated by google successfuly",
        token: theToken,
      });
    }

    let newUser = await userModel.create({
      email: req.body.email,
      password: "googleUser",
      isAdmin: false,
    });

    let theToken = Jwt.sign({ userId: newUser._id }, "mySecret", {
      expiresIn: "1y",
    });

    await analyticsModel.create({
      userId: newUser?._id,
    });

    return res.status(200).send({
      status: true,
      msg: "Authenticated by google successfuly",
      token: theToken,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: "Something went wrong",
      error,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(401)
        .json({ status: false, message: "Email should not be empty" });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Send email with verification code
    const mailOptions = {
      from: "zain@link2avicenna.com",
      //   from: 'hasnain.avicennaenterprise@gmail.com',
      to: email,
      subject: "Global QR update password",
      // text: `Your verification code is: ${verificationCode}`,
      html: `
        <p>Hi [name],</p><br/>
        <p>There was a request to change your password!</p><br/>
        <p>If you did not make this request then please ignore this email.</p><br/>
        <p>Otherwise, please click this link to change your password: <a href=${`https://generator.globalqrcodes.com/dashboard/updatePassword/${existingUser?._id}`}>${`https://generator.globalqrcodes.com/dashboard/updatePassword/${existingUser?._id}`}</a></p>
    `,
    };

    transporter.sendMail(mailOptions, function (err, info) {
      console.log(info);
      if (err)
        return res.status(500).json({ status: false, message: err.message });
      else
        return res.status(200).json({
          status: true,
          message: "Email sent",
        });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { id, newPassword } = req.body;

    // Check if the user exists
    const user = await userModel.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    let bcryptpassword = await bcrypt.hash(newPassword, salt);

    await userModel.updateOne({ _id: id }, { password: bcryptpassword });

    return res.json({ status: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};
