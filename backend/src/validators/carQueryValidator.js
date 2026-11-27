export const validateCarQuery = (req, res, next) => {
  const { minPrice, maxPrice, page = "1", limit = "6", sort } = req.query;

  // Validate minimum price
  if (
    minPrice !== undefined &&
    (!Number.isFinite(Number(minPrice)) || Number(minPrice) < 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Minimum price must be a valid non-negative number",
    });
  }

  // Validate maximum price
  if (
    maxPrice !== undefined &&
    (!Number.isFinite(Number(maxPrice)) || Number(maxPrice) < 0)
  ) {
    return res.status(400).json({
      success: false,
      message: "Maximum price must be a valid non-negative number",
    });
  }

  // Validate price range
  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    Number(minPrice) > Number(maxPrice)
  ) {
    return res.status(400).json({
      success: false,
      message: "Minimum price cannot be greater than maximum price",
    });
  }

  // Validate page
  if (!/^[1-9]\d*$/.test(page)) {
    return res.status(400).json({
      success: false,
      message: "Page must be a positive integer",
    });
  }

  // Validate limit
  if (!/^[1-9]\d*$/.test(limit) || Number(limit) > 50) {
    return res.status(400).json({
      success: false,
      message: "Limit must be between 1 and 50",
    });
  }

  // Validate sorting option
  const allowedSortOptions = [
    "price_asc",
    "price_desc",
    "year_desc",
    "kms_asc",
  ];

  if (sort && !allowedSortOptions.includes(sort)) {
    return res.status(400).json({
      success: false,
      message: "Invalid sorting option",
    });
  }

  next();
};
