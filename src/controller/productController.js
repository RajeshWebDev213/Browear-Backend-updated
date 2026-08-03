import Product from "../models/Product.js";
import uploadImage from "../services/cloudnaryService.js";

// =================================
// ADD PRODUCT
// =================================
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      price,
      discount,
      stock,
    } = req.body;

    if (
      !name ||
      !description ||
      !category ||
      !brand ||
      !price ||
      !stock
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    // Upload image to Cloudinary
    const uploadedImage = await uploadImage(req.file.buffer);

    const product = await Product.create({
      name,
      description,
      category,
      brand,
      price,
      discount: discount || 0,
      stock,
      image: uploadedImage.secure_url,
      public_id: uploadedImage.public_id,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};