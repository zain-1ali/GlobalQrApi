import multer from "multer";
import path from "path";
import fs from "fs";

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.readdir("public/images", (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return;
      }

      // Find the file with the matching name (case-sensitive)
      console.log(req.userId);
      const matchingFile = files.find((singlefile) =>
        singlefile.startsWith(file.fieldname + "-" + req.userId)
      );

      if (matchingFile) {
        const filePath = path.join("public/images", matchingFile);

        // Delete the file
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log("File deleted:", filePath);
            cb(null, "public/images");
          }
        });
      } else {
        // console.log("File not found:");
        cb(null, "public/images");
      }
    });
  },

  filename: (req, file, cb) => {
    // let date = new Date.now();
    cb(
      null,
      file.fieldname === "logo"
        ? file.fieldname + "abcf"
        : file.fieldname + "-" + req.userId + path.extname(file.originalname)
    );
  },
});

export const uploadFile = multer({
  storage: storage,
});
