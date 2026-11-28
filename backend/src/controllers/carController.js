import Car from "../models/Car.js";
import asyncHandler from "../utils/asyncHandler.js";

import cloudinary from "../config/cloudinary.js";
import { uploadImage } from "../services/uploadService.js";

// Create a new car
export const createCar = asyncHandler(async (req, res) => {
  const car = await Car.create(req.body);

  res.status(201).json({
    success: true,
    message: "Car added successfully",
    data: car,
  });
});

// Get all cars with search, filters, sorting and pagination
export const getCars = asyncHandler(async (req, res) => {
  const {
    search,
    minPrice,
    maxPrice,
    fuelType,
    transmission,
    sort,
    page = 1,
    limit = 6,
  } = req.query;

  let query = {};

  // Search by brand or model
  if (search) {
    query.$or = [
      { brand: { $regex: search, $options: "i" } },
      { model: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by price
  if (minPrice || maxPrice) {
    query.price = {};

    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Filter by fuel type
  if (fuelType) query.fuelType = fuelType;

  // Filter by transmission
  if (transmission) query.transmission = transmission;

  // Sorting
  let sortOption = {};

  if (sort === "price_asc") {
    sortOption = { price: 1 };
  } else if (sort === "price_desc") {
    sortOption = { price: -1 };
  } else if (sort === "year_desc") {
    sortOption = { year: -1 };
  } else if (sort === "kms_asc") {
    sortOption = { kmsDriven: 1 };
  }

  // Pagination
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // Fetch cars
  const cars = await Car.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNumber);

  // Count matching cars
  const totalCars = await Car.countDocuments(query);

  res.status(200).json({
    success: true,
    count: cars.length,
    totalCars,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalCars / limitNumber),
    data: cars,
  });
});

// Get a single car by ID
export const getCarById = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return res.status(404).json({
      success: false,
      message: "Car not found",
    });
  }

  res.status(200).json({
    success: true,
    data: car,
  });
});

//Update a car by ID

export const updateCar = asyncHandler(async (req, res) => {
  const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!car) {
    return res.status(404).json({
      success: false,
      message: "Car not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Car updated successfully",
    data: car,
  });
});

// Delete a car by ID
export const deleteCar = asyncHandler(async (req, res) => {
  const car = await Car.findByIdAndDelete(req.params.id);

  if (!car) {
    return res.status(404).json({
      success: false,
      message: "Car not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Car deleted successfully",
    data: car,
  });
});

// Upload images for an existing car
export const addCarImages = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);

  // Check whether the car exists
  if (!car) {
    return res.status(404).json({
      success: false,
      message: "Car not found",
    });
  }

  // Check whether images were provided
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please upload at least one image",
    });
  }

  const uploadedImages = [];

  try {
    // Upload each image to Cloudinary
    for (const file of req.files) {
      const image = await uploadImage(file.buffer);
      uploadedImages.push(image);
    }

    // Save image details in MongoDB
    car.images.push(...uploadedImages);

    await car.save();
  } catch (error) {
    // Delete uploaded Cloudinary images if saving fails
    await Promise.allSettled(
      uploadedImages.map((image) =>
        cloudinary.uploader.destroy(image.publicId),
      ),
    );

    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Car images uploaded successfully",
    data: car,
  });
});

// Delete an individual image from a car
export const deleteCarImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;

  // Find the car
  const car = await Car.findById(id);

  if (!car) {
    return res.status(404).json({
      success: false,
      message: "Car not found",
    });
  }

  // Find the specific image
  const image = car.images.id(imageId);

  if (!image) {
    return res.status(404).json({
      success: false,
      message: "Image not found",
    });
  }

  // Delete image from Cloudinary if it has a public ID
  if (image.publicId) {
    await cloudinary.uploader.destroy(image.publicId);
  }

  // Remove image reference from MongoDB
  car.images.pull({ _id: imageId });

  await car.save();

  res.status(200).json({
    success: true,
    message: "Car image deleted successfully",
    data: car,
  });
});
