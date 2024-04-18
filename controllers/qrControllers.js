import QrModel from "../models/QrModel.js";

export let createQrController = async (req, res, next) => {
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
  } = req.body;
  const userId = req.userId;
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
      logo:
        req.files["logo"]?.length === 1
          ? `http://localhost:4000/public/images/${req.files["logo"][0].filename}`
          : "",
    });
    res.status(200).send({ status: true, msg: "Qr created successfuly" });
  }
};

export let getSingleQr = async (req, res, next) => {
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
};

export let getQrByUserid = async (req, res, next) => {
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
};
