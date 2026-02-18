import { v2 as cloudinary } from "cloudinary";
import { ENV } from "../utils/ENV.js";

cloudinary.config({
  cloud_name: ENV.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto",
    });
    return result;
  } catch (error) {
    console.log(`Error uploading to Cloudinary: ${error.message}`);
    throw new Error(error.message);
  }
};

export const deleteFromCloudinary = async (publicId, resource_type) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type,
    });
    return result;
  } catch (error) {
    console.log(`Error deleting from Cloudinary: ${error.message}`);
    throw new Error(error.message);
  }
};
