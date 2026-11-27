const allowedFields = [
  "brand",
  "model",
  "variant",
  "year",
  "price",
  "kmsDriven",
  "fuelType",
  "transmission",
  "ownership",
  "location",
  "description",
  "images",
  "status",
  "isFeatured",
];

const requiredFields = [
  "brand",
  "model",
  "year",
  "price",
  "kmsDriven",
  "fuelType",
  "transmission",
  "ownership",
  "location",
];

const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

const transmissions = ["Manual", "Automatic"];

const statuses = ["AVAILABLE", "RESERVED", "SOLD"];

export const validateCar = (req, res, next) => {
  const data = req.body;
  const errors = [];

  // Check whether request body is a valid object
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a valid object",
    });
  }

  // Reject unknown fields
  const unknownFields = Object.keys(data).filter(
    (field) => !allowedFields.includes(field),
  );

  if (unknownFields.length > 0) {
    errors.push(`Unknown fields: ${unknownFields.join(", ")}`);
  }

  // POST requires all mandatory fields
  if (req.method === "POST") {
    requiredFields.forEach((field) => {
      if (
        data[field] === undefined ||
        data[field] === null ||
        (typeof data[field] === "string" && data[field].trim() === "")
      ) {
        errors.push(`${field} is required`);
      }
    });
  }

  // PATCH must contain at least one field
  if (Object.keys(data).length === 0) {
    errors.push("Request body cannot be empty");
  }

  // Validate string fields
  ["brand", "model", "variant", "location", "description"].forEach((field) => {
    if (
      data[field] !== undefined &&
      (typeof data[field] !== "string" || data[field].trim() === "")
    ) {
      errors.push(`${field} must be a non-empty string`);
    }
  });

  // Validate year
  if (data.year !== undefined) {
    if (
      !Number.isInteger(data.year) ||
      data.year < 1900 ||
      data.year > new Date().getFullYear()
    ) {
      errors.push("Year must be a valid integer");
    }
  }

  // Validate price
  if (data.price !== undefined) {
    if (
      typeof data.price !== "number" ||
      !Number.isFinite(data.price) ||
      data.price <= 0
    ) {
      errors.push("Price must be a positive number");
    }
  }

  // Validate kilometres driven
  if (data.kmsDriven !== undefined) {
    if (
      typeof data.kmsDriven !== "number" ||
      !Number.isFinite(data.kmsDriven) ||
      data.kmsDriven < 0
    ) {
      errors.push("Kms driven must be a non-negative number");
    }
  }

  // Validate fuel type
  if (data.fuelType !== undefined && !fuelTypes.includes(data.fuelType)) {
    errors.push("Invalid fuel type");
  }

  // Validate transmission
  if (
    data.transmission !== undefined &&
    !transmissions.includes(data.transmission)
  ) {
    errors.push("Invalid transmission type");
  }

  // Validate ownership
  if (data.ownership !== undefined) {
    if (
      !Number.isInteger(data.ownership) ||
      data.ownership < 1 ||
      data.ownership > 5
    ) {
      errors.push("Ownership must be an integer between 1 and 5");
    }
  }

  // Validate images
  if (data.images !== undefined) {
    if (
      !Array.isArray(data.images) ||
      !data.images.every((image) => typeof image === "string")
    ) {
      errors.push("Images must be an array of strings");
    }
  }

  // Validate status
  if (data.status !== undefined && !statuses.includes(data.status)) {
    errors.push("Invalid car status");
  }

  // Validate featured status
  if (data.isFeatured !== undefined && typeof data.isFeatured !== "boolean") {
    errors.push("isFeatured must be a boolean");
  }

  // Return validation errors
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};
