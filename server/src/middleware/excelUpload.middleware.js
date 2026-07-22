import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = "uploads/excel";

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDirectory);
  },

  filename(req, file, cb) {
    cb(
      null,
      `${Date.now()}-${file.originalname}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension === ".xlsx" || extension === ".xls" || extension === ".csv") {
    cb(null, true);
  } else {
    cb(new Error("Only Excel (.xlsx, .xls, .csv) files are allowed."));
  }
};

const excelUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default excelUpload;