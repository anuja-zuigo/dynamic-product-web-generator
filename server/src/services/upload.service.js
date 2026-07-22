import UploadedImage from "../models/UploadedImage.js";
import Product from "../models/Product.js";

export const saveUploadedImagesService = async (
  ownerId,
  uploadedFiles
) => {
  const imageData = uploadedFiles.map((file) => ({
    ownerId,
    originalName: file.originalname,
    storedName: file.filename,
    path: `/uploads/products/${file.filename}`,
  }));

  const savedImages = await UploadedImage.insertMany(imageData);

  // Auto-link uploaded images to matching products in MongoDB
  for (const img of savedImages) {
    const cleanName = img.originalName.toLowerCase().replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const nameKeywords = cleanName.split(" ").filter(k => k.length > 2);

    if (nameKeywords.length > 0) {
      const keywordRegexes = nameKeywords.map(k => new RegExp(k, "i"));

      await Product.updateMany(
        {
          ownerId,
          $or: [
            { name: { $in: keywordRegexes } },
            { brand: { $in: keywordRegexes } },
            { "image.originalName": img.originalName }
          ]
        },
        {
          $set: {
            image: {
              originalName: img.originalName,
              storedName: img.storedName,
              path: img.path
            }
          }
        }
      );
    }
  }

  return savedImages;
};