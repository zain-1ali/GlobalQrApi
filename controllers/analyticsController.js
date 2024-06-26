import mongoose from "mongoose";
import analyticsModel from "../models/analyticsModel.js";
import scanModel from "../models/scanModel.js";
import QrModel from "../models/QrModel.js";

export let updateAnalytics = async (req, res, next) => {
  try {
    const { type, qrId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).send({ status: false, msg: "Unautherized" });
    }
    if (!type) {
      return res.status(500).send({ status: false, msg: "type is required" });
    }

    let analyticsExist = await analyticsModel.findOne({ userId });
    if (qrId) {
      var qrExist = await QrModel.findOne({ _id: qrId });
      if (!qrExist) {
        return res.status(404).send({ status: false, msg: "Qr not found" });
      }

      if (qrExist?.status === false && type != "status") {
        return res.status(200).send({ status: true, msg: "Qr is paused" });
      }
    }

    if (!analyticsExist) {
      return res
        .status(404)
        .send({ status: false, msg: "Analytics not found" });
    }

    if (type === "create") {
      await analyticsModel.findByIdAndUpdate(
        { _id: analyticsExist?._id },
        {
          totalQrs: analyticsExist?.totalQrs + 1,
          activeQrs: analyticsExist?.activeQrs + 1,
        }
      );
    } else if (type === "download") {
      let currentDate = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      const oneMonth = 30 * 24 * 60 * 60 * 1000;

      // ----------------------------------updating analytics----------------------------------------
      if (currentDate < analyticsExist?.updatedMonth + oneMonth) {
        await analyticsModel.findByIdAndUpdate(
          { _id: analyticsExist?._id },
          {
            totalQrDownload: analyticsExist?.totalQrDownload + 1,
            totalQrDownloadCrntMonth:
              analyticsExist?.totalQrDownloadCrntMonth + 1,
          }
        );
      } else {
        await analyticsModel.findByIdAndUpdate(
          { _id: analyticsExist?._id },
          {
            totalQrDownload: analyticsExist?.totalQrDownload + 1,
            totalQrDownloadCrntMonth: 0,
            updatedMonth: Date.now(),
          }
        );
      }

      // ----------------------------------updating qr----------------------------------------

      if (currentDate < qrExist?.updatedMonth + oneMonth) {
        await QrModel.findByIdAndUpdate(
          { _id: qrExist?._id },
          {
            totalDownloads: qrExist?.totalDownloads + 1,
            totalDownloadsThisMonth: qrExist?.totalDownloadsThisMonth + 1,
          }
        );
      } else {
        await QrModel.findByIdAndUpdate(
          { _id: qrExist?._id },
          {
            totalDownloads: qrExist?.totalDownloads + 1,
            totalDownloadsThisMonth: 0,
            updatedMonth: Date.now(),
          }
        );
      }
      return res
        .status(200)
        .send({ status: true, msg: "info updated successfuly" });
    } else if (type === "status") {
      if (req.body.status === true) {
        await analyticsModel.findByIdAndUpdate(
          { _id: analyticsExist?._id },
          {
            activeQrs: analyticsExist?.activeQrs + 1,
            inactiveQrs: analyticsExist?.inactiveQrs - 1,
          }
        );

        var updatedQr = await QrModel.findByIdAndUpdate(
          { _id: qrId },
          {
            status: true,
          },
          { new: true }
        );
      } else if (req.body.status === false) {
        await analyticsModel.findByIdAndUpdate(
          { _id: analyticsExist?._id },
          {
            activeQrs: analyticsExist?.activeQrs - 1,
            inactiveQrs: analyticsExist?.inactiveQrs + 1,
          }
        );

        var updatedQr = await QrModel.findByIdAndUpdate(
          { _id: qrId },
          {
            status: false,
          },
          { new: true }
        );
      }
      var allqr = await QrModel.find({ userId: userId });
      res
        .status(200)
        .send({ status: true, msg: "status updated successfuly", data: allqr });
    } else if (type === "scan") {
      await analyticsModel.findByIdAndUpdate(
        { _id: analyticsExist?._id },
        {
          totalQrScan: analyticsExist?.totalQrScan + 1,
        }
      );
    } else {
      return res.status(500).send({ status: false, msg: "invalid type" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: false, msg: "internal server error", error });
  }
};

export let getAnalytics = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { qrId } = req.body;
    if (!userId) {
      res.status(401).send({ status: false, msg: "Unautherized" });
    }

    if (qrId) {
      let qrExist = await QrModel.findOne({ _id: qrId });
      if (!qrExist) {
        res.status(404).send({ status: false, msg: "Qr not found!" });
      }

      res.status(200).send({
        status: true,
        data: {
          totalQrs: 0,
          activeQrs: 0,
          inactiveQrs: 0,
          totalQrDownload: qrExist?.totalDownloadsThisMonth,
          totalQrScan: qrExist?.totalScans,
          totalQrDownloadCrntMonth: qrExist?.totalDownloadsThisMonth,
        },
      });
    } else {
      let analyticsExist = await analyticsModel.findOne({ userId });

      if (!analyticsExist) {
        res.status(404).send({ status: false, msg: "Data not found!" });
      }

      res.status(200).send({ status: true, data: analyticsExist });
    }
  } catch (error) {
    res
      .status(500)
      .send({ status: false, msg: "internal server error", error });
  }
};

export let getScansAnalytics = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { type, qrId } = req.body;

    if (!userId) {
      res.status(401).send({ status: false, msg: "Unautherized" });
    }
    console.log(userId);
    console.log("the type", type);
    try {
      if (qrId) {
        if (type === "weakly") {
          console.log("weakly");
          const endDate = new Date(); // Current date
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 7); // Date 7 days ago

          const result = await scanModel.aggregate([
            {
              $match: {
                timestamp: { $gte: startDate, $lt: endDate },
                qrId: new mongoose.Types.ObjectId(qrId),
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ]);

          // Construct the array with zeros for missing days
          const daysData = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(endDate);
            date.setDate(date.getDate() - (6 - index)); // Get date for each day in the past week
            const dateString = date.toISOString().split("T")[0]; // Format date to "YYYY-MM-DD"

            const dayData = result.find((item) => item._id === dateString);
            return dayData ? dayData.count : 0; // If data exists for the day, use count, otherwise 0
          });
          // console.log(daysData);
          res
            .status(200)
            .send({ status: true, data: daysData, qrId, result: result });
        } else if (type === "monthly") {
          console.log("monthly");
          const endDate = new Date(); // Current date
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30); // Date 7 days ago

          const result2 = await scanModel.aggregate([
            {
              $match: {
                qrId: new mongoose.Types.ObjectId(qrId),
                timestamp: { $gte: startDate, $lt: endDate },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ]);

          // Construct the array with zeros for missing days
          const monthlyData = Array.from({ length: 30 }, (_, index) => {
            const date = new Date(endDate);
            date.setDate(date.getDate() - (29 - index)); // Get date for each day in the past week
            const dateString = date.toISOString().split("T")[0]; // Format date to "YYYY-MM-DD"

            const dayData = result2.find((item) => item._id === dateString);
            return dayData ? dayData.count : 0; // If data exists for the day, use count, otherwise 0
          });

          res.status(200).send({ status: true, data: monthlyData });
        } else if (type === "yearly") {
          console.log("yearly");
          const endDate = new Date(); // Current date
          const startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1); // Date 1 year ago

          try {
            const result = await scanModel.aggregate([
              {
                $match: {
                  qrId: new mongoose.Types.ObjectId(qrId),
                  timestamp: { $gte: startDate, $lt: endDate },
                },
              },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m", date: "$timestamp" },
                  },
                  count: { $sum: 1 },
                },
              },
              {
                $sort: { _id: 1 },
              },
            ]);

            // Construct the array with zeros for missing months
            const monthsData = Array.from({ length: 12 }, (_, index) => {
              const monthDate = new Date(endDate);
              monthDate.setMonth(monthDate.getMonth() - (11 - index)); // Get date for each month in the past year
              const monthString = monthDate.toISOString().slice(0, 7); // Format month to "YYYY-MM"

              const monthData = result.find((item) => item._id === monthString);
              return monthData ? monthData.count : 0; // If data exists for the month, use count, otherwise 0
            });
            // console.log("months", monthsData);
            res.status(200).send({ status: true, data: monthsData });
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        if (type === "weakly") {
          console.log("weakly");
          const endDate = new Date(); // Current date
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 7); // Date 7 days ago

          const result = await scanModel.aggregate([
            {
              $match: {
                userId: new mongoose.Types.ObjectId(userId),
                timestamp: { $gte: startDate, $lt: endDate },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ]);

          // Construct the array with zeros for missing days
          const daysData = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(endDate);
            date.setDate(date.getDate() - (6 - index)); // Get date for each day in the past week
            const dateString = date.toISOString().split("T")[0]; // Format date to "YYYY-MM-DD"

            const dayData = result.find((item) => item._id === dateString);
            return dayData ? dayData.count : 0; // If data exists for the day, use count, otherwise 0
          });
          // console.log(daysData);
          res.status(200).send({ status: true, data: daysData });
        } else if (type === "monthly") {
          console.log("monthly");
          const endDate = new Date(); // Current date
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30); // Date 7 days ago

          const result2 = await scanModel.aggregate([
            {
              $match: {
                userId: new mongoose.Types.ObjectId(userId),
                timestamp: { $gte: startDate, $lt: endDate },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ]);

          // Construct the array with zeros for missing days
          const monthlyData = Array.from({ length: 30 }, (_, index) => {
            const date = new Date(endDate);
            date.setDate(date.getDate() - (29 - index)); // Get date for each day in the past week
            const dateString = date.toISOString().split("T")[0]; // Format date to "YYYY-MM-DD"

            const dayData = result2.find((item) => item._id === dateString);
            return dayData ? dayData.count : 0; // If data exists for the day, use count, otherwise 0
          });

          res.status(200).send({ status: true, data: monthlyData });
        } else if (type === "yearly") {
          console.log("yearly");
          const endDate = new Date(); // Current date
          const startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1); // Date 1 year ago

          try {
            const result = await scanModel.aggregate([
              {
                $match: {
                  userId: new mongoose.Types.ObjectId(userId),
                  timestamp: { $gte: startDate, $lt: endDate },
                },
              },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m", date: "$timestamp" },
                  },
                  count: { $sum: 1 },
                },
              },
              {
                $sort: { _id: 1 },
              },
            ]);

            // Construct the array with zeros for missing months
            const monthsData = Array.from({ length: 12 }, (_, index) => {
              const monthDate = new Date(endDate);
              monthDate.setMonth(monthDate.getMonth() - (11 - index)); // Get date for each month in the past year
              const monthString = monthDate.toISOString().slice(0, 7); // Format month to "YYYY-MM"

              const monthData = result.find((item) => item._id === monthString);
              return monthData ? monthData.count : 0; // If data exists for the month, use count, otherwise 0
            });
            // console.log("months", monthsData);
            res.status(200).send({ status: true, data: monthsData });
          } catch (error) {
            console.log(error);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    res
      .status(500)
      .send({ status: false, msg: "internal server error", error });
  }
};
