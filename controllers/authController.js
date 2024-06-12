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
  secure: false,
});

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

export let GoogleAuthController = async (req, res, next) => {
  try {
    if (!req.body.email) {
      res.status(200).send({ status: false, msg: "email field is required" });
    }

    let userExist = await userModel.findOne({ email: req.body.email });

    if (userExist) {
      const theToken = Jwt.sign({ userId: userExist._id }, "mySecret", {
        expiresIn: "1y",
      });
      res.status(200).send({
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

    res.status(200).send({
      status: true,
      msg: "Authenticated by google successfuly",
      token: theToken,
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      msg: "internal server error",
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
    const user = await userModel.findOne({ _id: id }).lean();
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
