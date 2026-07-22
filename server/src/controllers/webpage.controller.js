import { generateProductPageService, generateProductPageOfflineService, addProductReviewService } from "../services/webpage.service.js";
import { generateProductPdfService } from "../services/pdf.service.js";

export const getProductWebPage = async (req, res) => {
    try {
        const { slug } = req.params;
        const { currency } = req.query;
        const html = await generateProductPageService(slug, currency);

        res.setHeader("Content-Type", "text/html");
        return res.send(html);
    } catch (error) {
        return res.status(404).send(`
            <h1>404 - Product Not Found</h1>
            <p>${error.message}</p>
        `);
    }
};

export const exportProductWebPage = async (req, res) => {
    try {
        const { slug } = req.params;
        const { currency } = req.query;
        const html = await generateProductPageOfflineService(slug, currency);

        res.setHeader("Content-Disposition", `attachment; filename="${slug}-offline.html"`);
        res.setHeader("Content-Type", "text/html");
        return res.send(html);
    } catch (error) {
        return res.status(500).send(`
            <h1>500 - Export Failed</h1>
            <p>Error generating offline storefront page: ${error.message}</p>
        `);
    }
};

export const exportProductPdf = async (req, res) => {
    try {
        const { slug } = req.params;
        const { currency } = req.query;
        const pdfBuffer = await generateProductPdfService(slug, currency);

        res.setHeader("Content-Disposition", `attachment; filename="product-${slug}.pdf"`);
        res.setHeader("Content-Type", "application/pdf");
        return res.send(pdfBuffer);
    } catch (error) {
        return res.status(500).send(`
            <h1>500 - PDF Generation Failed</h1>
            <p>Error generating product PDF: ${error.message}</p>
        `);
    }
};

export const submitProductReview = async (req, res) => {
    try {
        const { slug } = req.params;
        const { name, rating, text } = req.body;

        await addProductReviewService(slug, { name, rating, text });

        // Preserve current currency query when redirecting back
        const { currency } = req.query;
        const redirectUrl = currency ? `/product/${slug}?currency=${currency}` : `/product/${slug}`;
        return res.redirect(redirectUrl);
    } catch (error) {
        return res.status(400).send(`
            <h1>400 - Review Submission Failed</h1>
            <p>Error details: ${error.message}</p>
            <a href="/product/${req.params.slug}">Go back to product page</a>
        `);
    }
};