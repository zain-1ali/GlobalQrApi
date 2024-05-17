import QrModel from "../models/QrModel.js";
import analyticsModel from "../models/analyticsModel.js";
import open from "open";
import fs from "fs";
import scanModel from "../models/scanModel.js";

export let createQrController = async (req, res, next) => {
  try {
    const {
      name,
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
          name,
          url,
          forColor,
          bgColor,
          eyeColor,
          bodyShape,
          eyeShape,
          frameShape,
          logo: req.files
            ? req.files["logo"]?.length === 1
              ? `http://localhost:4000/public/images/${req.files["logo"][0].filename}`
              : ""
            : "",
        }
      );
      res.status(200).send({ status: true, msg: "Qr updated successfuly" });
    } else {
      let newQr = await QrModel.create({
        name,
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

    const checkIfUrl = (url) => {
      if (url?.includes("https://") || url?.includes("http://")) {
        return url;
      } else {
        return `https://${url}`;
      }
    };

    return res.redirect(checkIfUrl(reqiureQr.url));
  } catch (error) {
    res
      .status(500)
      .send({ status: false, msg: "internal server error", error });
  }
};

export let deleteQr = async (req, res, next) => {
  try {
    const { qrId } = req.body;
    const userId = req.userId;
    if (!qrId) {
      console.log(qrId);
      res.status(500).send({ status: false, msg: "qr id is required" });
    }
    if (!userId) {
      res.status(401).send({ status: false, msg: "Unautherized!" });
    }

    const singleQr = await QrModel.findOne({ _id: qrId });

    if (!singleQr) {
      res.status(404).send({ status: false, msg: "Qr not found" });
    }

    await QrModel.findByIdAndDelete(qrId);
    const allQrs = await QrModel.find({ userId: userId });
    res
      .status(200)
      .send({ status: true, msg: "Qr deleted successfuly", data: allQrs });
  } catch (error) {
    res
      .status(500)
      .send({ status: false, msg: "internal server error", error });
  }
};

// export let scanQr = async (req, res, next) => {
//   try {
//     const qrId = req?.params?.id;
//     console.log(`Received QR ID: ${qrId}`);

//     // Validate the qrId is a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(qrId)) {
//       return res.status(400).send({ status: false, msg: "Invalid QR ID" });
//     }

//     const reqiureQr = await QrModel.findOne({ _id: qrId });
//     if (!reqiureQr) {
//       return res.status(400).send({ status: false, msg: "QR not found" });
//     }
//     console.log(`Found QR: ${JSON.stringify(reqiureQr)}`);

//     const UpdatedQr = await QrModel.findByIdAndUpdate(
//       qrId,
//       { totalScans: reqiureQr.totalScans + 1 },
//       { new: true }
//     );
//     console.log(`Updated QR: ${JSON.stringify(UpdatedQr)}`);

//     const Updatedanalytics = await analyticsModel.findOneAndUpdate(
//       { userId: reqiureQr.userId },
//       { $inc: { totalQrScan: 1 } },
//       { new: true }
//     );
//     if (!Updatedanalytics) {
//       return res.status(404).json({ error: "Analytics document not found" });
//     }
//     console.log(`Updated analytics: ${JSON.stringify(Updatedanalytics)}`);

//     const createScan = await scanModel.create({
//       qrId,
//       userId: reqiureQr.userId,
//     });
//     console.log(`Created scan: ${JSON.stringify(createScan)}`);

//     // Use res.redirect instead of open for server environment
//     return res.redirect(reqiureQr.url);
//   } catch (error) {
//     console.error("Error occurred:", error);
//     return res
//       .status(500)
//       .send({ status: false, msg: "Internal server error", error });
//   }
// };
