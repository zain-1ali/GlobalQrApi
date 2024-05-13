import QrModel from "../models/QrModel.js";
import analyticsModel from "../models/analyticsModel.js";
import open from "open";
import fs from "fs";
import scanModel from "../models/scanModel.js";

export let createQrController = async (req, res, next) => {
  try {
    const {
      url,
      forColor,
      bgColor,
      eyeColor,
      bodyShape,
      eyeShape,
      frameShape,
      status,
      totalScans,
      qrId,
      logo,
    } = req.body;

    const userId = req.userId;
    // let logoData = Buffer.from(logo, "base64");
    // fs.writeFile(logoData, "my-file.png");
    // fs.writeFile(
    //   "public/images/abc.jpg",
    //   logoData,
    //   {
    //     encoding: "utf8",
    //     flag: "w",
    //     mode: 0o666,
    //   },
    //   (err) => {
    //     if (err) console.log(err);
    //     else {
    //       console.log("File written successfully\n");
    //       console.log("The written has the following contents:");
    //       console.log(fs.readFileSync("movies.txt", "utf8"));
    //     }
    //   }
    // );

    if (!url) {
      res
        .status(500)
        .send({ status: false, msg: "Url value should not be empty" });
    }
    if (!userId) {
      res.status(401).send({ status: false, msg: "Unautherized!" });
    }

    if (qrId) {
      var qrExists = await QrModel.findById(qrId);
    }

    if (qrExists) {
      let updateQr = await QrModel.findByIdAndUpdate(
        { _id: qrId },
        {
          url,
          forColor,
          bgColor,
          eyeColor,
          bodyShape,
          eyeShape,
          frameShape,
          logo:
            req.files["logo"]?.length === 1
              ? `http://localhost:4000/public/images/${req.files["logo"][0].filename}`
              : qrExists?.logo,
        }
      );
      res.status(200).send({ status: true, msg: "Qr updated successfuly" });
    } else {
      let newQr = await QrModel.create({
        url,
        forColor,
        bgColor,
        eyeColor,
        bodyShape,
        eyeShape,
        frameShape,
        status,
        totalScans,
        userId,
        logo: req.files
          ? req.files["logo"]?.length === 1
            ? `http://localhost:4000/public/images/${req.files["logo"][0].filename}`
            : ""
          : "",
      });

      await analyticsModel.findOneAndUpdate(
        { userId },
        {
          $inc: { activeQrs: 1 },
        }
      );

      res.status(200).send({ status: true, msg: "Qr created successfuly" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ status: false, msg: "internal server error", error });
    console.log(error);
  }
};

export let getSingleQr = async (req, res, next) => {
  try {
    const { qrId } = req.body;
    const userId = req.userId;
    if (!qrId) {
      res.status(500).send({ status: false, msg: "internel server error" });
    }
    if (!userId) {
      res.status(401).send({ status: false, msg: "Unautherized!" });
    }

    const singleQr = await QrModel.findOne({ _id: qrId });

    if (singleQr) {
      res.status(200).send({ status: true, msg: "success", data: singleQr });
    } else {
      res.status(404).send({ status: false, msg: "Qr not found" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ status: false, msg: "internal server error", error });
  }
};

export let getQrByUserid = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).send({ status: false, msg: "Unautherized!" });
    }

    const allQrs = await QrModel.find({ userId: userId });

    if (allQrs) {
      res.status(200).send({ status: true, msg: "success", data: allQrs });
    } else {
      res.status(404).send({ status: false, msg: "Qrs not found" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ status: false, msg: "internal server error", error });
  }
};

export let scanQr = async (req, res, next) => {
  try {
    const qrId = req?.params?.id;
    const reqiureQr = await QrModel.findOne({ _id: qrId });

    if (!reqiureQr) {
      res.status(400).send({ status: false, msg: "Qr not found" });
    }

    const UpdatedQr = await QrModel.findByIdAndUpdate(
      { _id: qrId },
      {
        totalScans: reqiureQr?.totalScans + 1,
      }
    );

    console.log(reqiureQr?.userId);

    const Updatedanalytics = await analyticsModel.findOneAndUpdate(
      { userId: reqiureQr?.userId },
      {
        $inc: { totalQrScan: 1 },
      },
      { new: true }
    );

    if (!Updatedanalytics) {
      return res.status(404).json({ error: "analyics Document not found" });
    }

    const createScan = await scanModel.create({
      qrId,
      userId: reqiureQr?.userId,
    });

    await open(reqiureQr.url);
  } catch (error) {
    res
      .status(500)
      .send({ status: false, msg: "internal server error", error });
  }
};
