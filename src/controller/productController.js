import Product from "../models/Product.js";
import uploadImage from "../services/cloudnaryService.js";
import cloudinary from "../config/cloudnary.js";

// =================================
// ADD PRODUCT
// =================================
export const addProduct = async (req, res) => {
    console.log("BODY:", req.body);
console.log("FILE:", req.file);
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


// =================================
// GET ALL PRODUCTS
// =================================
// =================================
// GET ALL PRODUCTS
// =================================
export const getProducts = async (req, res) => {
    try {

        const {
            page = 1,
            limit = 10,
            search,
            category,
            brand,
            minPrice,
            maxPrice,
            sort
        } = req.query;

        const query = {};

        // Search
        if (search) {
            query.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    description: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        // Category
        if (category) {
            query.category = category;
        }

        // Brand
        if (brand) {
            query.brand = brand;
        }

        // Price
        if (minPrice || maxPrice) {

            query.price = {};

            if (minPrice)
                query.price.$gte = Number(minPrice);

            if (maxPrice)
                query.price.$lte = Number(maxPrice);

        }

        let sortOption = {
            createdAt: -1,
        };

        switch (sort) {

            case "price-low":
                sortOption = { price: 1 };
                break;

            case "price-high":
                sortOption = { price: -1 };
                break;

            case "newest":
                sortOption = { createdAt: -1 };
                break;

            case "oldest":
                sortOption = { createdAt: 1 };
                break;

            case "name":
                sortOption = { name: 1 };
                break;

        }

        const totalProducts =
            await Product.countDocuments(query);

        const products =
            await Product.find(query)
                .sort(sortOption)
                .skip((page - 1) * limit)
                .limit(Number(limit));

        return res.status(200).json({

            success: true,

            totalProducts,

            currentPage: Number(page),

            totalPages: Math.ceil(
                totalProducts / limit
            ),

            products,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });

    }
};

// =================================
// GET SINGLE PRODUCT
// =================================
export const getProduct = async (req, res) => {
  try {

    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
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

// =================================
// GET PRODUCTS BY CATEGORY
// =================================
export const getProductsByCategory = async (req, res) => {
  try {

    const { category } = req.params;

    const products = await Product.find({
      category: new RegExp(`^${category}$`, "i"),
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =================================
// UPDATE PRODUCT
// =================================
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    let product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let image = product.image;
    let public_id = product.public_id;

    // Upload new image if provided
    if (req.file) {

      // Delete old image
      await cloudinary.uploader.destroy(product.public_id);

      const uploadedImage = await uploadImage(req.file.buffer);

      image = uploadedImage.secure_url;
      public_id = uploadedImage.public_id;
    }

    product.name = req.body.name || product.name;
    product.description =
      req.body.description || product.description;
    product.category =
      req.body.category || product.category;
    product.brand =
      req.body.brand || product.brand;
    product.price =
      req.body.price || product.price;
    product.discount =
      req.body.discount ?? product.discount;
    product.stock =
      req.body.stock ?? product.stock;

    product.image = image;
    product.public_id = public_id;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
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
// =================================
// DELETE PRODUCT
// =================================
export const deleteProduct = async (req, res) => {
  try {

    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(product.public_id);

    // Delete product from MongoDB
    await Product.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};