import Product from "../models/Product.js";
import productsListingTemplate from "../templates/productsListing.template.js";
import { convertPrice } from "./currency.service.js";

export const generateProductsListingPageService = async (filters = {}) => {
    const { search, category, brand, availability, minPrice, maxPrice, page = 1, limit = 9, sort = 'newest', currency = 'INR' } = filters;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 9;
    const skipNum = (pageNum - 1) * limitNum;

    const query = { status: "ACTIVE" };

    if (search) {
        const searchRegex = new RegExp(search, "i");
        query.$or = [
            { name: searchRegex },
            { brand: searchRegex },
            { category: searchRegex }
        ];
    }

    if (category) {
        query.category = category;
    }

    if (brand) {
        query.brand = brand;
    }

    if (availability) {
        if (availability === 'in-stock') {
            query.stock = { $gt: 0 };
        } else if (availability === 'out-of-stock') {
            query.stock = 0;
        }
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) {
            query.price.$gte = parseFloat(minPrice);
        }
        if (maxPrice) {
            query.price.$lte = parseFloat(maxPrice);
        }
    }

    // Configure MongoDB sort query
    let sortQuery = { createdAt: -1 }; // default: newest
    if (sort === 'oldest') {
        sortQuery = { createdAt: 1 };
    } else if (sort === 'price-asc') {
        sortQuery = { price: 1 };
    } else if (sort === 'price-desc') {
        sortQuery = { price: -1 };
    } else if (sort === 'name-asc') {
        sortQuery = { name: 1 };
    } else if (sort === 'name-desc') {
        sortQuery = { name: -1 };
    }

    // Count matching products
    const totalProducts = await Product.countDocuments(query);

    // Fetch matching products with pagination and sorting (using lean for mutability)
    const products = await Product.find(query)
        .sort(sortQuery)
        .skip(skipNum)
        .limit(limitNum)
        .lean();

    // Convert product prices if currency is not INR
    const activeCurrency = (currency || "INR").toUpperCase();
    for (const p of products) {
        if (activeCurrency !== "INR") {
            p.price = convertPrice(p.price, "INR", activeCurrency);
            p.currency = activeCurrency;
        }
    }

    const totalPages = Math.ceil(totalProducts / limitNum);

    // Fetch unique categories and brands dynamically for active products
    const allCategories = await Product.distinct("category", { status: "ACTIVE" });
    const allBrands = await Product.distinct("brand", { status: "ACTIVE" });

    return productsListingTemplate(products, {
        search,
        category,
        brand,
        availability,
        minPrice,
        maxPrice,
        sort,
        page: pageNum,
        limit: limitNum,
        totalPages,
        totalProducts,
        allCategories,
        allBrands,
        currency: activeCurrency
    });
};
