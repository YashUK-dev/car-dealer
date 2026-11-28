import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";

// Upload one image buffer to Cloudinary
export const uploadImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "car-dealer/cars",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    // Convert the image buffer into a readable stream
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};
