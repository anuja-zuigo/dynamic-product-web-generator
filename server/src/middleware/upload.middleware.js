import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products");
  },

  filename: (req, file, cb) => {
    const uniqueFileName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpg|jpeg|png|webp)$/i;

  const isValidExtension = allowedExtensions.test(
    path.extname(file.originalname)
  );

  const isValidMimeType = file.mimetype.startsWith("image/");

  if (isValidExtension && isValidMimeType) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPG, JPEG, PNG and WEBP images are allowed."),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export default upload;