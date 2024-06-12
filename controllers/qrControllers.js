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

    // Extract base64 data and metadata
    const matches = logo.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      const type = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      // Create unique filename
      var fileName = `qrlogo_${Date.now()}.png`;

      fs.writeFile(
        path.join(__dirname, "public/images", fileName),
        buffer,
        (err) => {
          if (err) {
            return res.status(500).send("Error saving image");
          }
        }
      );
    }

    if (!url) {
      return res
        .status(500)
        .send({ status: false, msg: "Url value should not be empty" });
    }
    if (!userId) {
      return res.status(401).send({ status: false, msg: "Unautherized!" });
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
          logo: matches
            ? `https://global-qr-codes-9520601e1a2d.herokuapp.com/public/images/${fileName}`
            : logo,
        }
      );
      return res
        .status(200)
        .send({ status: true, msg: "Qr updated successfuly" });
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
        logo: matches
          ? `https://global-qr-codes-9520601e1a2d.herokuapp.com/public/images/${fileName}`
          : logo,
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
      return res
        .status(500)
        .send({ status: false, msg: "internel server error" });
    }
    if (!userId) {
      return res.status(401).send({ status: false, msg: "Unautherized!" });
    }

    const singleQr = await QrModel.findOne({ _id: qrId });

    if (singleQr) {
      return res
        .status(200)
        .send({ status: true, msg: "success", data: singleQr });
    } else {
      return res.status(404).send({ status: false, msg: "Qr not found" });
    }
  } catch (error) {
    return res
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
      return res.status(400).send({ status: false, msg: "Qr not found" });
    }
    if (reqiureQr?.status === false) {
      return res.status(200).send({ status: true, msg: "Qr is paused" });
    }
    await scanModel.create({
      qrId,
      userId: reqiureQr?.userId,
    });

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

    const checkIfUrl = (url) => {
      if (url?.includes("https://") || url?.includes("http://")) {
        return url;
      } else {
        return `https://${url}`;
      }
    };

    return res.redirect(checkIfUrl(reqiureQr.url));
  } catch (error) {
    return res
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
      return res.status(500).send({ status: false, msg: "qr id is required" });
    }

    if (!userId) {
      return res.status(401).send({ status: false, msg: "Unautherized!" });
    }

    const singleQr = await QrModel.findOne({ _id: qrId });

    if (!singleQr) {
      return res.status(404).send({ status: false, msg: "Qr not found" });
    }

    const deletedQr = await QrModel.findByIdAndDelete(qrId);

    if (deletedQr) {
      console.log("test");
      if (deletedQr?.status) {
        await analyticsModel.findOneAndUpdate(
          { userId },
          {
            $inc: { activeQrs: -1 },
          }
        );
      } else {
        await analyticsModel.findOneAndUpdate(
          { userId },
          {
            $inc: { inactiveQrs: -1 },
          }
        );
      }

      const allQrs = await QrModel.find({ userId: userId });
      return res
        .status(200)
        .send({ status: true, msg: "Qr deleted successfuly", data: allQrs });
    }

    return res
      .status(500)
      .send({ status: false, msg: "internal server error" });
  } catch (error) {
    return res
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
