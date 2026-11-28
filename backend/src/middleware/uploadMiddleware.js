import multer from "multer";

// Store uploaded images temporarily in memory
const storage = multer.memoryStorage();

// Allow only supported image formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  const error = new Error("Only JPEG, PNG, and WebP images are allowed");

  error.statusCode = 400;

  cb(error);
};

// Configure Multer
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter,
});

// Accept a maximum of 10 images under the field name "images"
export const uploadCarImages = upload.array("images", 10);
