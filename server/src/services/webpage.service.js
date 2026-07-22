import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import Product from "../models/Product.js";
import productTemplate from "../templates/product.template.js";
import productsListingTemplate from "../templates/productsListing.template.js";
import { convertPrice } from "./currency.service.js";

// Helper to convert local image paths to base64 data URIs
const toBase64Image = async (imagePath) => {
    try {
        if (!imagePath) return "";
        // If imagePath is already a data URI, return as-is
        if (imagePath.startsWith("data:")) return imagePath;

        const filename = path.basename(imagePath);
        const absolutePath = path.resolve(path.join("uploads", "products", filename));

        if (fs.existsSync(absolutePath)) {
            const fileBuffer = await fs.promises.readFile(absolutePath);
            const ext = path.extname(filename).replace(".", "").toLowerCase();
            const mimeType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
            return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
        }
        return imagePath; // Fallback if file not found
    } catch (error) {
        console.error("Base64 conversion failed for:", imagePath, error);
        return imagePath;
    }
};

export const generateProductPageService = async (slug, targetCurrency = "INR") => {
    const product = await Product.findOne({ slug }).lean();

    if (!product) {
        throw new Error("Product not found.");
    }

    const activeCurrency = (targetCurrency || "INR").toUpperCase();
    if (activeCurrency !== "INR") {
        product.price = convertPrice(product.price, "INR", activeCurrency);
        product.currency = activeCurrency;
    }

    // Fetch related products (limit 4) using waterfall matching logic
    // 1. Same category, active, excluding self
    let related = await Product.find({
        category: product.category,
        status: "ACTIVE",
        _id: { $ne: product._id }
    }).limit(4).lean();

    // 2. If less than 4, fetch same brand (excluding already matched category items)
    if (related.length < 4) {
        const brandRelated = await Product.find({
            brand: product.brand,
            status: "ACTIVE",
            _id: { $ne: product._id, $nin: related.map(p => p._id) }
        }).limit(4 - related.length).lean();
        related = related.concat(brandRelated);
    }

    // 3. If still less than 4, fetch any other suggested active products
    if (related.length < 4) {
        const suggested = await Product.find({
            status: "ACTIVE",
            _id: { $ne: product._id, $nin: related.map(p => p._id) }
        }).limit(4 - related.length).lean();
        related = related.concat(suggested);
    }

    // Convert prices of related products
    for (const rel of related) {
        if (activeCurrency !== "INR") {
            rel.price = convertPrice(rel.price, "INR", activeCurrency);
            rel.currency = activeCurrency;
        }
    }

    return productTemplate(product, related, activeCurrency);
};

export const generateProductPageOfflineService = async (slug, targetCurrency = "INR") => {
    // Retrieve documents as plain JS objects using .lean() to allow field mutations
    const product = await Product.findOne({ slug }).lean();

    if (!product) {
        throw new Error("Product not found.");
    }

    const activeCurrency = (targetCurrency || "INR").toUpperCase();
    if (activeCurrency !== "INR") {
        product.price = convertPrice(product.price, "INR", activeCurrency);
        product.currency = activeCurrency;
    }

    // Convert main image to base64 Data URI
    if (product.image && product.image.path) {
        product.image.path = await toBase64Image(product.image.path);
    }

    // Fetch related products (limit 4) using waterfall matching logic
    // 1. Same category, active, excluding self
    let related = await Product.find({
        category: product.category,
        status: "ACTIVE",
        _id: { $ne: product._id }
    }).limit(4).lean();

    // 2. If less than 4, fetch same brand (excluding already matched category items)
    if (related.length < 4) {
        const brandRelated = await Product.find({
            brand: product.brand,
            status: "ACTIVE",
            _id: { $ne: product._id, $nin: related.map(p => p._id) }
        }).limit(4 - related.length).lean();
        related = related.concat(brandRelated);
    }

    // 3. If still less than 4, fetch any other suggested active products
    if (related.length < 4) {
        const suggested = await Product.find({
            status: "ACTIVE",
            _id: { $ne: product._id, $nin: related.map(p => p._id) }
        }).limit(4 - related.length).lean();
        related = related.concat(suggested);
    }

    // Convert related product images to base64 Data URIs and convert prices
    for (const rel of related) {
        if (activeCurrency !== "INR") {
            rel.price = convertPrice(rel.price, "INR", activeCurrency);
            rel.currency = activeCurrency;
        }
        if (rel.image && rel.image.path) {
            rel.image.path = await toBase64Image(rel.image.path);
        }
    }

    return productTemplate(product, related, activeCurrency);
};

export const generateShopZipService = async () => {
    const zip = new AdmZip();

    // 1. Fetch all active products
    const products = await Product.find({ status: "ACTIVE" }).lean();

    // 2. Base64 encode all product images inside list
    for (const p of products) {
        if (p.image && p.image.path) {
            p.image.path = await toBase64Image(p.image.path);
        }
    }

    // 3. Generate main listing index.html page
    const allCategories = await Product.distinct("category", { status: "ACTIVE" });
    const allBrands = await Product.distinct("brand", { status: "ACTIVE" });

    let indexHtml = productsListingTemplate(products, {
        allCategories,
        allBrands,
        limit: products.length,
        totalProducts: products.length
    });

    // Fix links inside index.html for offline local use
    indexHtml = indexHtml.replace(/onclick="window\.location\.href='\/product\/([^']+)'"/g, 'onclick="window.location.href=\'./product-$1.html\'"');
    indexHtml = indexHtml.replace(/href="\/products"/g, 'href="./index.html"');
    // Hide search form and filters since it's an offline catalog
    indexHtml = indexHtml.replace('<form action="/products" method="GET" class="catalog-form">', '<form action="#" method="GET" class="catalog-form" style="display:none;">');

    // Add index.html to ZIP archive
    zip.addFile("index.html", Buffer.from(indexHtml, "utf8"));

    // 4. Generate detail pages for each product
    for (const prod of products) {
        // Fetch related products for this specific product
        let related = await Product.find({
            category: prod.category,
            status: "ACTIVE",
            _id: { $ne: prod._id }
        }).limit(4).lean();

        if (related.length < 4) {
            const brandRelated = await Product.find({
                brand: prod.brand,
                status: "ACTIVE",
                _id: { $ne: prod._id, $nin: related.map(p => p._id) }
            }).limit(4 - related.length).lean();
            related = related.concat(brandRelated);
        }

        if (related.length < 4) {
            const suggested = await Product.find({
                status: "ACTIVE",
                _id: { $ne: prod._id, $nin: related.map(p => p._id) }
            }).limit(4 - related.length).lean();
            related = related.concat(suggested);
        }

        // Clone and base64-encode related products' images
        const relatedCloned = JSON.parse(JSON.stringify(related));
        for (const rel of relatedCloned) {
            if (rel.image && rel.image.path) {
                rel.image.path = await toBase64Image(rel.image.path);
            }
        }

        let productHtml = productTemplate(prod, relatedCloned);

        // Fix links inside detail pages for offline local use
        productHtml = productHtml.replace(/onclick="window\.location\.href='\/product\/([^']+)'"/g, 'onclick="window.location.href=\'./product-$1.html\'"');
        productHtml = productHtml.replace(/href="\/products"/g, 'href="./index.html"');
        // Hide the "Export Offline Page" button since it is already offline
        productHtml = productHtml.replace(/<a href="\/product\/[^"]+\/export" class="btn btn-outline">Export Offline Page<\/a>/g, '');

        zip.addFile(`product-${prod.slug}.html`, Buffer.from(productHtml, "utf8"));
    }

    return zip.toBuffer();
};

export const addProductReviewService = async (slug, { name, rating, text }) => {
    const product = await Product.findOne({ slug });

    if (!product) {
        throw new Error("Product not found.");
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
        throw new Error("Name is required and must be a non-empty string.");
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        throw new Error("Rating must be a number between 1 and 5.");
    }

    if (!text || typeof text !== "string" || text.trim() === "") {
        throw new Error("Review text is required and must be a non-empty string.");
    }

    product.reviews.push({
        name: name.trim(),
        rating: parsedRating,
        text: text.trim()
    });

    await product.save();
    return product;
};