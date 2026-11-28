import express from "express";
import { validateCar } from "../validators/carValidator.js";
import { validateCarQuery } from "../validators/carQueryValidator.js";

import { uploadCarImages } from "../middleware/uploadMiddleware.js";
import {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar,
  addCarImages,
  deleteCarImage,
} from "../controllers/carController.js";

const router = express.Router();

router.post("/", validateCar, createCar);
router.post("/:id/images", uploadCarImages, addCarImages);
router.delete("/:id/images/:imageId", deleteCarImage);

router.get("/", validateCarQuery, getCars);
router.get("/:id", getCarById);
router.patch("/:id", validateCar, updateCar);
router.delete("/:id", deleteCar);

export default router;
