import Jwt from "jsonwebtoken";
// import ErrorHandler from "../utils/errorHandle.js";

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (!authHeader) {
      // || !authHeader.startsWith("Bearer")
      // next("Auth Failed 1");
      res.status(401).send({
        status: false,
        msg: "Auth Failed",
      });
      // next(new ErrorHandler("Auth Failed", 401));
    }
    const token = authHeader.split(" ")[1];

    const payload = await Jwt.verify(token, process.env.secretkey);
    // console.log(payload.userId);
    req.userId = await payload.userId;
    next();
  } catch (error) {
    // next(new ErrorHandler("Auth Failed", 401));
    res.status(401).send({
      status: false,
      msg: "Auth Failed",
    });
    console.log(error);
  }
};

export default userAuth;
