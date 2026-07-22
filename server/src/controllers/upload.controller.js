import { saveUploadedImagesService } from "../services/upload.service.js";

export const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files uploaded.",
      });
    }

    const fileNames = req.files.map(f => f.originalname);
    console.log(`\n[IMPORT LOG] Received Images:\n - ${fileNames.join('\n - ')}\n`);

    const uniqueNames = new Set(fileNames.map(name => name.toLowerCase()));
    if (uniqueNames.size !== fileNames.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate image filenames detected in upload. Please remove duplicates.",
      });
    }

    const uploadedImages = await saveUploadedImagesService(
      req.user._id,
      req.files
    );

    return res.status(201).json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully.`,
      data: uploadedImages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};