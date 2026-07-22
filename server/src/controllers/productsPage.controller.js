import { generateProductsListingPageService } from "../services/productsPage.service.js";
import { generateShopZipService } from "../services/webpage.service.js";

export const getProductsListingPage = async (req, res) => {
    try {
        const { search, category, brand, availability, minPrice, maxPrice, page, limit, sort, currency } = req.query;
        const html = await generateProductsListingPageService({
            search,
            category,
            brand,
            availability,
            minPrice,
            maxPrice,
            page,
            limit,
            sort,
            currency
        });

        res.setHeader("Content-Type", "text/html");
        return res.send(html);
    } catch (error) {
        return res.status(500).send(`
            <h1>500 - Internal Server Error</h1>
            <p>Error generating products listing: ${error.message}</p>
        `);
    }
};

export const exportShopZip = async (req, res) => {
    try {
        const zipBuffer = await generateShopZipService();

        res.setHeader("Content-Disposition", 'attachment; filename="storefront-offline.zip"');
        res.setHeader("Content-Type", "application/zip");
        return res.send(zipBuffer);
    } catch (error) {
        return res.status(500).send(`
            <h1>500 - ZIP Export Failed</h1>
            <p>Error generating storefront offline ZIP: ${error.message}</p>
        `);
    }
};
