import Product from "../models/Product.js";
import uploadImage from "../services/cloudnaryService.js";
import cloudinary from "../config/cloudnary.js";
import Order from "../models/Order.js";
// ADD PRODUCT
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
  sizes,
} = req.body;

  if (
  !name ||
  !description ||
  !category ||
  !brand ||
  !price ||
  !stock ||
  !sizes
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
     const parsedSizes = JSON.parse(sizes);
  const product = await Product.create({
  name,
  description,
  category,
  brand,
  price,
  discount: discount || 0,
  stock,
  sizes: parsedSizes,
  images: [
    {
      url: uploadedImage.secure_url,
      public_id: uploadedImage.public_id,
    },
  ],
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
// GET ALL PRODUCTS
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

       if (category) {
    query.category = {
        $regex: `^${category}$`,
        $options: "i",
    };
}

if (brand) {
    query.brand = {
        $regex: `^${brand}$`,
        $options: "i",
    };
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
// GET SINGLE PRODUCT
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
// GET PRODUCTS BY CATEGORY
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
// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
    try {

        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Upload new image if provided
        if (req.file) {

            // Delete old Cloudinary image
            if (
                product.images &&
                product.images.length > 0
            ) {
                await cloudinary.uploader.destroy(
                    product.images[0].public_id
                );
            }

            // Upload new image
            const uploadedImage = await uploadImage(
                req.file.buffer
            );

            // Save new image
            product.images = [
                {
                    url: uploadedImage.secure_url,
                    public_id: uploadedImage.public_id,
                },
            ];
        }

        // Update other fields
        product.name =
            req.body.name || product.name;

        product.description =
            req.body.description ||
            product.description;

        product.category =
            req.body.category ||
            product.category;

        product.brand =
            req.body.brand ||
            product.brand;

        product.price =
            req.body.price !== undefined
                ? Number(req.body.price)
                : product.price;

        product.discount =
            req.body.discount !== undefined
                ? Number(req.body.discount)
                : product.discount;

        product.stock =
            req.body.stock !== undefined
                ? Number(req.body.stock)
                : product.stock;

        // Automatically update availability
        product.isAvailable =
            product.stock > 0;

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
// DELETE PRODUCT
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
    if (product.images.length > 0) {
    await cloudinary.uploader.destroy(
        product.images[0].public_id
    );
}

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

// TRENDING PRODUCTS


export const getTrendingProducts = async (req, res) => {
    try {

        const products = await Product.find({
            isAvailable: true,
            stock: { $gt: 0 },
        })
            .sort({
                createdAt: -1,
            })
            .limit(10);

        return res.status(200).json({
            success: true,
            products,
        });

    } catch (error) {

        console.log(
            "TRENDING PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch trending products",
        });

    }
};
// 50% OFF PRODUCTS
export const getOfferProducts = async (req, res) => {
    try {

        const products = await Product.find({
            isAvailable: true,
            stock: { $gt: 0 },
            discount: { $gte: 50 },
        })
            .sort({
                discount: -1,
            })
            .limit(10);

        return res.status(200).json({
            success: true,
            products,
        });

    } catch (error) {

        console.log(
            "OFFER PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch offer products",
        });

    }
};
// BEST SELLERS
export const getBestSellerProducts = async (req, res) => {
    try {

        const bestSellers = await Order.aggregate([

            {
                $match: {
                    orderStatus: {
                        $ne: "Cancelled",
                    },
                },
            },

            {
                $unwind: "$orderItems",
            },

            {
                $group: {
                    _id: "$orderItems.product",

                    totalSold: {
                        $sum: "$orderItems.quantity",
                    },
                },
            },

            {
                $sort: {
                    totalSold: -1,
                },
            },

            {
                $limit: 10,
            },

        ]);

        const productIds =
            bestSellers.map(
                (item) => item._id
            );

        const products =
            await Product.find({
                _id: {
                    $in: productIds,
                },
                isAvailable: true,
            });

        return res.status(200).json({
            success: true,
            products,
        });

    } catch (error) {

        console.log(
            "BEST SELLER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch best sellers",
        });

    }
};