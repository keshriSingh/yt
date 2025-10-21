const { v2 } = require("cloudinary");
const fs = require("fs");

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await v2.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log('file has been uploaded succesfully',response?.url)
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (deleteFile) => {
  try {
    const getPublicIdFromUrl = (url) => {
      // Improved regex to handle different Cloudinary URL formats
      const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
      return matches ? matches[1] : null;
    };

    const publicId = getPublicIdFromUrl(deleteFile);

    if (!publicId) {
      throw new Error("Invalid Cloudinary URL: " + deleteFile);
    }

    console.log("Deleting file with public ID:", publicId);

    const result = await v2.uploader.destroy(publicId, {
      resource_type: "image",
    });

    console.log("Cloudinary delete result:", result);

    // if (result.result === "ok") {
    //   console.log("Successfully deleted from Cloudinary");
    //   return result;
    // } else {
    //   console.log("Delete failed:", result);
    //   throw new Error("Delete operation failed: " + result.result);
    // }
  } catch (error) {
    // FIXED: Added proper error handling
    console.error("Error deleting from Cloudinary:", error.message);
    throw error; // Re-throw the error
  }
};

const deleteVideoFromCloudinary = async (deleteFile) => {
  try {
    const getPublicIdFromUrl = (url) => {
      // Improved regex to handle different Cloudinary URL formats
      const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
      return matches ? matches[1] : null;
    };

    const publicId = getPublicIdFromUrl(deleteFile);

    if (!publicId) {
      throw new Error("Invalid Cloudinary URL: " + deleteFile);
    }

    console.log("Deleting file with public ID:", publicId);

    const result = await v2.uploader.destroy(publicId, {
      resource_type: "video",
    });

    console.log("Cloudinary delete result:", result);

    // if (result.result === "ok") {
    //   console.log("Successfully deleted from Cloudinary");
    //   return result;
    // } else {
    //   console.log("Delete failed:", result);
    //   throw new Error("Delete operation failed: " + result.result);
    // }
  } catch (error) {
    // FIXED: Added proper error handling
    console.error("Error deleting from Cloudinary:", error.message);
    throw error; // Re-throw the error
  }
};

module.exports = { uploadOnCloudinary, deleteFromCloudinary, deleteVideoFromCloudinary };
